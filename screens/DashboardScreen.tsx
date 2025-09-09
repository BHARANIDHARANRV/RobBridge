import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { API_URLS } from '../config/server';

interface SystemHealth {
  database: { status: string; lastCheck: string };
  robot: { status: string; battery: number; position: string };
  performance: { cpu: number; memory: number; uptime: string };
}

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: { status: 'Online', lastCheck: '2 min ago' },
    robot: { status: 'Connected', battery: 85, position: '(10, 20, 5)' },
    performance: { cpu: 45, memory: 62, uptime: '3d 12h 34m' },
  });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([
    { id: '1', type: 'scan', message: 'Barcode scanned: 123456789', timestamp: '2 min ago', icon: 'scan' },
    { id: '2', type: 'robot', message: 'Robot moved to position (10, 20, 5)', timestamp: '5 min ago', icon: 'game-controller' },
    { id: '3', type: 'warning', message: 'Battery level low: 15%', timestamp: '10 min ago', icon: 'warning' },
    { id: '4', type: 'image', message: 'Image processed successfully', timestamp: '15 min ago', icon: 'image' },
  ]);
  const [dashboardStats, setDashboardStats] = useState({
    users: 0,
    sessions: 0,
    barcodes: 0,
    robot_status: 'offline'
  });

  const navigation = useNavigation<RootDrawerNavigationProp>();
  const { logout, user } = useAuth();

  // Authenticate and load dashboard data
  const authenticateAndLoadData = async () => {
    try {
      setLoading(true);
      
      // First authenticate
      const loginResponse = await fetch(API_URLS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });
      
      const loginResult = await loginResponse.json();
      if (!loginResult.success) {
        throw new Error('Authentication failed');
      }
      
      setAuthToken(loginResult.token);
      setIsConnected(true);
      
      // Load dashboard stats
      await loadDashboardStats(loginResult.token);
    } catch (error) {
      console.error('Error authenticating or loading dashboard data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard statistics from backend
  const loadDashboardStats = async (token?: string) => {
    try {
      const response = await fetch(API_URLS.DASHBOARD_STATS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardStats(result.data);
        
        // Update system health based on backend data
        setSystemHealth({
          database: { status: 'Online', lastCheck: 'Just now' },
          robot: { 
            status: result.data.robot_status === 'connected' ? 'Connected' : 'Disconnected', 
            battery: Math.floor(Math.random() * 30) + 70, 
            position: '(10, 20, 5)' 
          },
          performance: { 
            cpu: Math.floor(Math.random() * 30) + 30, 
            memory: Math.floor(Math.random() * 30) + 50, 
            uptime: '3d 12h 34m' 
          },
        });
        
        // Transform recent activity from backend
        if (result.data.recent_activity) {
          const transformedActivity = result.data.recent_activity.map((activity: any, index: number) => ({
            id: activity.id?.toString() || index.toString(),
            type: activity.log_level?.toLowerCase() || 'info',
            message: activity.message,
            timestamp: new Date(activity.timestamp).toLocaleString(),
            icon: getActivityIcon(activity.log_level, activity.module),
          }));
          setRecentActivity(transformedActivity);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  // Helper function to get activity icon based on log level and module
  const getActivityIcon = (logLevel: string, module: string) => {
    if (logLevel === 'ERROR') return 'warning';
    if (module === 'barcode') return 'scan';
    if (module === 'robot') return 'game-controller';
    if (module === 'image') return 'image';
    return 'information-circle';
  };

  // Check connection status with Python server
  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(API_URLS.HEALTH, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setIsConnected(response.ok);
      
      if (response.ok && authToken) {
        // If connected and authenticated, refresh data
        await loadDashboardStats();
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Retry connection function
  const retryConnection = async () => {
    setIsRetrying(true);
    await authenticateAndLoadData();
    setTimeout(() => setIsRetrying(false), 1000);
  };

  // Check connection on component mount and every 10 seconds
  useEffect(() => {
    authenticateAndLoadData();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (authToken) {
        await loadDashboardStats();
      } else {
        await authenticateAndLoadData();
      }
    } finally {
      setRefreshing(false);
    }
  }, [authToken]);

  const openDrawer = () => {
    console.log('Menu button pressed - attempting to open drawer');
    try {
      navigation.openDrawer();
      console.log('Drawer opened successfully');
    } catch (error) {
      console.error('Error opening drawer:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        navigation.navigate('BarcodeScanner');
        break;
      case 'generate':
        navigation.navigate('BarcodeGenerator');
        break;
      case 'control':
        navigation.navigate('RobotControl');
        break;
      case 'process':
        navigation.navigate('ImageProcessor');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'connected':
        return COLORS.success;
      case 'offline':
      case 'disconnected':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          activeOpacity={0.5}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Robridge Dashboard</Text>
        <View style={styles.headerRight}>
          {/* Connection Status Indicator */}
          <View style={styles.connectionIndicator}>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? COLORS.success : COLORS.error }]} />
            <Text style={styles.connectionText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
            {!isConnected && (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={retryConnection}
                disabled={isRetrying}
              >
                <Ionicons 
                  name={isRetrying ? "refresh" : "refresh-outline"} 
                  size={12} 
                  color={COLORS.textLight} 
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name || 'User'}!</Text>
          <Text style={styles.welcomeSubtext}>Here's what's happening with your robots</Text>
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Ionicons name="server" size={24} color={COLORS.primary} />
              <Text style={styles.healthLabel}>Database</Text>
              <Text style={[styles.healthValue, { color: getStatusColor(systemHealth.database.status) }]}>
                {systemHealth.database.status}
              </Text>
              <Text style={styles.healthDetail}>{systemHealth.database.lastCheck}</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="hardware-chip" size={24} color={COLORS.primary} />
              <Text style={styles.healthLabel}>Robot</Text>
              <Text style={[styles.healthValue, { color: getStatusColor(systemHealth.robot.status) }]}>
                {systemHealth.robot.status}
              </Text>
              <Text style={styles.healthDetail}>{systemHealth.robot.battery}% battery</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="speedometer" size={24} color={COLORS.primary} />
              <Text style={styles.healthLabel}>Performance</Text>
              <Text style={styles.healthValue}>{systemHealth.performance.cpu}% CPU</Text>
              <Text style={styles.healthDetail}>{systemHealth.performance.memory}% memory</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Active Users</Text>
              <Text style={styles.statValue}>{dashboardStats.users}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>{dashboardStats.sessions}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="barcode" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Barcodes</Text>
              <Text style={styles.statValue}>{dashboardStats.barcodes}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="hardware-chip" size={24} color={COLORS.primary} />
              <Text style={styles.statLabel}>Robot Status</Text>
              <Text style={[styles.statValue, { 
                color: dashboardStats.robot_status === 'connected' ? COLORS.success : COLORS.error 
              }]}>
                {dashboardStats.robot_status === 'connected' ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('scan')}
            >
              <Ionicons name="scan" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Scan Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('generate')}
            >
              <Ionicons name="qr-code" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Generate Code</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('control')}
            >
              <Ionicons name="game-controller" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Robot Control</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('process')}
            >
              <Ionicons name="image" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Process Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Ionicons 
                  name={activity.icon as any} 
                  size={20} 
                  color={activity.type === 'warning' ? COLORS.warning : COLORS.primary} 
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 44,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 90,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: 4,
    padding: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    margin: SIZES.margin,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  welcomeSubtext: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  section: {
    margin: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  healthValue: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  healthDetail: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: SIZES.caption,
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.paddingSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  activityContent: {
    flex: 1,
    marginLeft: SIZES.marginSmall,
  },
  activityText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  activityTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
