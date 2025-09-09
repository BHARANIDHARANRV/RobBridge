import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { API_URLS } from '../config/server';

const { width } = Dimensions.get('window');

interface Rack {
  id: string;
  name: string;
  status: 'empty' | 'occupied';
  productName?: string;
  productId?: string;
  lastUpdated: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
}

// Mock data for demonstration
const mockRacks: Rack[] = [
  {
    id: 'R001',
    name: 'Rack A1',
    status: 'occupied',
    productName: 'Electronics Kit',
    productId: 'ELEK001',
    lastUpdated: '2025-09-08 14:30',
    location: { x: 1, y: 1, z: 1 }
  },
  {
    id: 'R002',
    name: 'Rack A2',
    status: 'empty',
    lastUpdated: '2025-09-08 12:15',
    location: { x: 1, y: 1, z: 2 }
  },
  {
    id: 'R003',
    name: 'Rack A3',
    status: 'occupied',
    productName: 'Mechanical Parts',
    productId: 'MECH002',
    lastUpdated: '2025-09-08 15:45',
    location: { x: 1, y: 1, z: 3 }
  },
  {
    id: 'R004',
    name: 'Rack B1',
    status: 'empty',
    lastUpdated: '2025-09-08 11:20',
    location: { x: 2, y: 1, z: 1 }
  },
  {
    id: 'R005',
    name: 'Rack B2',
    status: 'occupied',
    productName: 'Software License',
    productId: 'SOFT003',
    lastUpdated: '2025-09-08 16:00',
    location: { x: 2, y: 1, z: 2 }
  },
  {
    id: 'R006',
    name: 'Rack B3',
    status: 'empty',
    lastUpdated: '2025-09-08 10:30',
    location: { x: 2, y: 1, z: 3 }
  },
  {
    id: 'R007',
    name: 'Rack C1',
    status: 'occupied',
    productName: 'Tools Set',
    productId: 'TOOL004',
    lastUpdated: '2025-09-08 13:15',
    location: { x: 3, y: 1, z: 1 }
  },
  {
    id: 'R008',
    name: 'Rack C2',
    status: 'occupied',
    productName: 'Safety Equipment',
    productId: 'SAFE005',
    lastUpdated: '2025-09-08 14:45',
    location: { x: 3, y: 1, z: 2 }
  },
  {
    id: 'R009',
    name: 'Rack C3',
    status: 'empty',
    lastUpdated: '2025-09-08 09:45',
    location: { x: 3, y: 1, z: 3 }
  },
];

const RackStatusScreen: React.FC = () => {
  const navigation = useNavigation<RootDrawerNavigationProp>();
  const [racks, setRacks] = useState<Rack[]>(mockRacks);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'empty' | 'occupied'>('all');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredRacks = racks.filter(rack => {
    if (filter === 'all') return true;
    return rack.status === filter;
  });

  const emptyRacks = racks.filter(rack => rack.status === 'empty').length;
  const occupiedRacks = racks.filter(rack => rack.status === 'occupied').length;
  const totalRacks = racks.length;

  useEffect(() => {
    authenticateAndLoadRacks();
  }, []);

  const authenticateAndLoadRacks = async () => {
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
      
      // Then load racks
      await loadRacks(loginResult.token);
    } catch (error) {
      console.error('Error authenticating or loading racks:', error);
      Alert.alert('Error', 'Failed to connect to server');
      // Fallback to mock data
      setRacks(mockRacks);
    } finally {
      setLoading(false);
    }
  };

  const loadRacks = async (token?: string) => {
    try {
      const response = await fetch(API_URLS.GET_RACKS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Transform backend data to frontend format
        const transformedRacks = result.data.map((rack: any) => ({
          id: rack.id,
          name: rack.name,
          status: rack.status,
          productName: rack.productName,
          productId: rack.productId,
          lastUpdated: new Date(rack.lastUpdated).toLocaleString(),
          location: rack.location,
        }));
        setRacks(transformedRacks);
      } else {
        throw new Error(result.error || 'Failed to load racks');
      }
    } catch (error) {
      console.error('Error loading racks:', error);
      Alert.alert('Error', 'Failed to load racks from server');
      // Fallback to mock data
      setRacks(mockRacks);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRacks();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRackPress = (rack: Rack) => {
    if (rack.status === 'occupied') {
      Alert.alert(
        'Rack Details',
        `Rack: ${rack.name}\nProduct: ${rack.productName}\nID: ${rack.productId}\nLocation: (${rack.location.x}, ${rack.location.y}, ${rack.location.z})\nLast Updated: ${rack.lastUpdated}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Empty Rack',
        `Rack: ${rack.name}\nStatus: Available\nLocation: (${rack.location.x}, ${rack.location.y}, ${rack.location.z})\nLast Updated: ${rack.lastUpdated}`,
        [{ text: 'OK' }]
      );
    }
  };

  const toggleRackStatus = (rackId: string) => {
    setRacks(prevRacks =>
      prevRacks.map(rack =>
        rack.id === rackId
          ? {
              ...rack,
              status: rack.status === 'empty' ? 'occupied' : 'empty',
              productName: rack.status === 'empty' ? 'New Product' : undefined,
              productId: rack.status === 'empty' ? 'NEW001' : undefined,
              lastUpdated: new Date().toLocaleString(),
            }
          : rack
      )
    );
  };

  const RackCard: React.FC<{ rack: Rack }> = ({ rack }) => (
    <TouchableOpacity
      style={[
        styles.rackCard,
        rack.status === 'occupied' ? styles.occupiedCard : styles.emptyCard,
      ]}
      onPress={() => handleRackPress(rack)}
      onLongPress={() => toggleRackStatus(rack.id)}
    >
      <View style={styles.rackHeader}>
        <Text style={styles.rackName}>{rack.name}</Text>
        <View
          style={[
            styles.statusIndicator,
            rack.status === 'occupied' ? styles.occupiedIndicator : styles.emptyIndicator,
          ]}
        />
      </View>
      
      <View style={styles.rackContent}>
        <Text style={styles.locationText}>
          Location: ({rack.location.x}, {rack.location.y}, {rack.location.z})
        </Text>
        
        {rack.status === 'occupied' ? (
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{rack.productName}</Text>
            <Text style={styles.productId}>ID: {rack.productId}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Available</Text>
        )}
        
        <Text style={styles.lastUpdated}>
          Updated: {rack.lastUpdated}
        </Text>
      </View>
      
      <View style={styles.rackFooter}>
        <Ionicons
          name={rack.status === 'occupied' ? 'cube' : 'cube-outline'}
          size={20}
          color={rack.status === 'occupied' ? COLORS.primary : COLORS.gray}
        />
        <Text style={styles.statusText}>
          {rack.status === 'occupied' ? 'Occupied' : 'Empty'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rack Status</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalRacks}</Text>
          <Text style={styles.statLabel}>Total Racks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>{occupiedRacks}</Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>{emptyRacks}</Text>
          <Text style={styles.statLabel}>Empty</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All ({totalRacks})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'occupied' && styles.activeFilter]}
          onPress={() => setFilter('occupied')}
        >
          <Text style={[styles.filterText, filter === 'occupied' && styles.activeFilterText]}>
            Occupied ({occupiedRacks})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'empty' && styles.activeFilter]}
          onPress={() => setFilter('empty')}
        >
          <Text style={[styles.filterText, filter === 'empty' && styles.activeFilterText]}>
            Empty ({emptyRacks})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Racks Grid */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.racksGrid}>
          {filteredRacks.map((rack) => (
            <RackCard key={rack.id} rack={rack} />
          ))}
        </View>
        
        {filteredRacks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyStateText}>
              No racks found for the selected filter
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.statusBarHeight + 10,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.card,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: COLORS.grayDark,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  racksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.padding,
    justifyContent: 'space-between',
  },
  rackCard: {
    width: (width - SIZES.padding * 3) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  occupiedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  emptyCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  rackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rackName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  occupiedIndicator: {
    backgroundColor: COLORS.success,
  },
  emptyIndicator: {
    backgroundColor: COLORS.warning,
  },
  rackContent: {
    marginBottom: 10,
  },
  locationText: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  productId: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.warning,
    fontWeight: '500',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  rackFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginLeft: 5,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 15,
  },
});

export default RackStatusScreen;
