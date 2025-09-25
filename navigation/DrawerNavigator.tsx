import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import BarcodeGeneratorScreen from '../screens/BarcodeGeneratorScreen';
import ImageProcessorScreen from '../screens/ImageProcessorScreen';
import RobotControlScreen from '../screens/RobotControlScreen';
import RackStatusScreen from '../screens/RackStatusScreen';
import RackManagementScreenNew from '../screens/RackManagementScreenNew';
import RackSettingsScreen from '../screens/RackSettingsScreen';
import ProductMovementScreen from '../screens/ProductMovementScreen';
import ESP32ControlScreen from '../screens/ESP32ControlScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import the logo image
const logoImage = require('../assets/logo.png');

const Drawer = createDrawerNavigator();

// Custom drawer content component
const CustomDrawerContent = (props: any) => {
  const { user, logout } = useAuth();
  
  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      {/* Logo Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Default drawer items */}
      <DrawerItemList {...props} />
      
      {/* Logout button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BarcodeScanner':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'BarcodeGenerator':
              iconName = focused ? 'qr-code' : 'qr-code-outline';
              break;
            case 'ImageProcessor':
              iconName = focused ? 'image' : 'image-outline';
              break;
            case 'RobotControl':
              iconName = focused ? 'game-controller' : 'game-controller-outline';
              break;
            case 'RackStatus':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'RackManagement':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'RackSettings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            case 'ProductMovement':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'ESP32Control':
              iconName = focused ? 'bluetooth' : 'bluetooth-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerStyle: {
          backgroundColor: COLORS.surface,
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: SIZES.body,
          fontWeight: '500',
          marginLeft: -10,
        },
        // Remove default headers to use custom ones
        headerShown: false,
        // Enable swipe to open/close drawer
        swipeEnabled: true,
        // Enable edge swipe to open drawer
        drawerType: 'front',
        // Overlay when drawer is open
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        // Enable touch events
        gestureEnabled: true,
        // Enable touch response
        touchResponseDistance: 50,
        // Enable keyboard handling
        keyboardDismissMode: 'on-drag',
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          drawerLabel: 'Dashboard'
        }}
      />
      <Drawer.Screen 
        name="BarcodeScanner" 
        component={BarcodeScannerScreen}
        options={{ 
          drawerLabel: 'Scan Barcode'
        }}
      />
      <Drawer.Screen 
        name="BarcodeGenerator" 
        component={BarcodeGeneratorScreen}
        options={{ 
          drawerLabel: 'Generate Barcode'
        }}
      />
      <Drawer.Screen 
        name="ImageProcessor" 
        component={ImageProcessorScreen}
        options={{ 
          drawerLabel: 'Image Processor'
        }}
      />
      <Drawer.Screen 
        name="RobotControl" 
        component={RobotControlScreen}
        options={{ 
          drawerLabel: 'Robot Control'
        }}
      />
      <Drawer.Screen 
        name="RackStatus" 
        component={RackStatusScreen}
        options={{ 
          drawerLabel: 'Rack Status'
        }}
      />
      <Drawer.Screen 
        name="RackManagement" 
        component={RackManagementScreenNew}
        options={{ 
          drawerLabel: 'Rack Management'
        }}
      />
      <Drawer.Screen 
        name="RackSettings" 
        component={RackSettingsScreen}
        options={{ 
          drawerLabel: 'Rack Settings'
        }}
      />
      <Drawer.Screen 
        name="ProductMovement" 
        component={ProductMovementScreen}
        options={{ 
          drawerLabel: 'Product Movement'
        }}
      />
      <Drawer.Screen 
        name="ESP32Control" 
        component={ESP32ControlScreen}
        options={{ 
          drawerLabel: 'ESP32 Control'
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          drawerLabel: 'Settings'
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    backgroundColor: 'transparent',
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 0,
  },
  brandName: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SIZES.margin / 4,
  },
  brandTagline: {
    fontSize: SIZES.fontSmall,
    color: COLORS.secondaryLight,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  userRole: {
    fontSize: SIZES.fontSmall,
    color: COLORS.secondaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: SIZES.margin,
  },
  logoutSection: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding / 2,
  },
  logoutText: {
    fontSize: SIZES.body,
    color: COLORS.error,
    marginLeft: SIZES.margin / 2,
    fontWeight: '500',
  },
});

export default DrawerNavigator;
