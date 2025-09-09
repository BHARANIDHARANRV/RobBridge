import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import BarcodeGeneratorScreen from '../screens/BarcodeGeneratorScreen';
import ImageProcessorScreen from '../screens/ImageProcessorScreen';
import RobotControlScreen from '../screens/RobotControlScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.grayLight,
          borderTopWidth: 1,
          height: SIZES.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.small,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textLight,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="BarcodeScanner" 
        component={BarcodeScannerScreen}
        options={{ title: 'Scan Barcode' }}
      />
      <Tab.Screen 
        name="BarcodeGenerator" 
        component={BarcodeGeneratorScreen}
        options={{ title: 'Generate Barcode' }}
      />
      <Tab.Screen 
        name="ImageProcessor" 
        component={ImageProcessorScreen}
        options={{ title: 'Image Processor' }}
      />
      <Tab.Screen 
        name="RobotControl" 
        component={RobotControlScreen}
        options={{ title: 'Robot Control' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
