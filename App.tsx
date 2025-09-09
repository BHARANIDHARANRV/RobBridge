import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Animated } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './components/SplashScreen';
import { COLORS } from './constants/colors';

// Component to handle post-login splash screen
const AppContent = () => {
  const { showSplashAfterLogin, hideSplashAfterLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Initial app loading
    const timer = setTimeout(() => {
      // Fade out transition
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setIsLoading(false);
        // Fade in transition
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // 5 seconds initial splash

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  useEffect(() => {
    // Post-login splash screen
    if (showSplashAfterLogin) {
      const timer = setTimeout(() => {
        // Fade out transition
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          hideSplashAfterLogin();
          // Fade in transition
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        });
      }, 5000); // 5 seconds post-login splash

      return () => clearTimeout(timer);
    }
  }, [showSplashAfterLogin, hideSplashAfterLogin, fadeAnim]);

  if (isLoading) {
    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <SplashScreen 
          onAnimationComplete={() => setIsLoading(false)}
          duration={5000}
        />
      </Animated.View>
    );
  }

  if (showSplashAfterLogin) {
    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <SplashScreen 
          onAnimationComplete={() => hideSplashAfterLogin()}
          duration={5000}
          message="Welcome back!"
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <AppNavigator />
    </Animated.View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
