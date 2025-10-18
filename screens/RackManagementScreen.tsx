import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { API_URLS } from '../config/server';

const { width } = Dimensions.get('window');

// Separate form component to prevent re-renders
const RackForm = React.memo(({ 
  newRack, 
  onRackChange, 
  onClose, 
  onSubmit 
}: {
  newRack: any;
  onRackChange: (rack: any) => void;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const rackNameRef = useRef<TextInput>(null);
  const locationXRef = useRef<TextInput>(null);
  const locationYRef = useRef<TextInput>(null);
  const locationZRef = useRef<TextInput>(null);
  const capacityRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const productNameRef = useRef<TextInput>(null);
  const productIdRef = useRef<TextInput>(null);

  const handleRackNameChange = (text: string) => {
    console.log('Typing:', text);
    onRackChange({ ...newRack, name: text });
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      hardwareAccelerated={true}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Rack</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            removeClippedSubviews={false}
            bounces={true}
            alwaysBounceVertical={false}
          >
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rack Name *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={rackNameRef}
                style={styles.textInput}
                value={newRack.name}
                onChangeText={handleRackNameChange}
                placeholder="e.g., Rack A1"
                placeholderTextColor={COLORS.gray}
                blurOnSubmit={false}
                returnKeyType="next"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                textContentType="none"
                onSubmitEditing={() => locationXRef.current?.focus()}
                onFocus={() => console.log('Rack name focused')}
                onBlur={() => console.log('Rack name blurred')}
                selectTextOnFocus={false}
                caretHidden={false}
                multiline={false}
                numberOfLines={1}
                keyboardType="default"
                secureTextEntry={false}
                editable={true}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationInput}>
                <Text style={styles.inputLabel}>X</Text>
                <TextInput
                  ref={locationXRef}
                  style={styles.textInput}
                  value={newRack.location.x.toString()}
                  onChangeText={(text) => onRackChange({
                    ...newRack,
                    location: { ...newRack.location, x: parseInt(text) || 1 }
                  })}
                  placeholder="1"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => locationYRef.current?.focus()}
                />
              </View>
              <View style={styles.locationInput}>
                <Text style={styles.inputLabel}>Y</Text>
                <TextInput
                  ref={locationYRef}
                  style={styles.textInput}
                  value={newRack.location.y.toString()}
                  onChangeText={(text) => onRackChange({
                    ...newRack,
                    location: { ...newRack.location, y: parseInt(text) || 1 }
                  })}
                  placeholder="1"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => locationZRef.current?.focus()}
                />
              </View>
              <View style={styles.locationInput}>
                <Text style={styles.inputLabel}>Z</Text>
                <TextInput
                  ref={locationZRef}
                  style={styles.textInput}
                  value={newRack.location.z.toString()}
                  onChangeText={(text) => onRackChange({
                    ...newRack,
                    location: { ...newRack.location, z: parseInt(text) || 1 }
                  })}
                  placeholder="1"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => capacityRef.current?.focus()}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Capacity</Text>
            <TextInput
              ref={capacityRef}
              style={styles.textInput}
              value={newRack.capacity.toString()}
              onChangeText={(text) => onRackChange({
                ...newRack,
                capacity: parseInt(text) || 100
              })}
              placeholder="100"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              ref={descriptionRef}
              style={[styles.textInput, styles.textArea]}
              value={newRack.description}
              onChangeText={(text) => onRackChange({ ...newRack, description: text })}
              placeholder="Optional description"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => productNameRef.current?.focus()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name (if occupied)</Text>
            <TextInput
              ref={productNameRef}
              style={styles.textInput}
              value={newRack.productName || ''}
              onChangeText={(text) => onRackChange({ ...newRack, productName: text })}
              placeholder="Product name"
              placeholderTextColor={COLORS.gray}
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => productIdRef.current?.focus()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product ID (if occupied)</Text>
            <TextInput
              ref={productIdRef}
              style={styles.textInput}
              value={newRack.productId || ''}
              onChangeText={(text) => onRackChange({ ...newRack, productId: text })}
              placeholder="Product ID"
              placeholderTextColor={COLORS.gray}
              blurOnSubmit={false}
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={onSubmit}>
            <Text style={styles.addButtonText}>Add Rack</Text>
          </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});


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
  capacity?: number;
  description?: string;
}

interface NewRack {
  name: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
  capacity: number;
  description: string;
}

const RackManagementScreen: React.FC = () => {
  const navigation = useNavigation<RootDrawerNavigationProp>();
  const [racks, setRacks] = useState<Rack[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalKey, setModalKey] = useState(0); // Force re-render key
  const [forceCloseModal, setForceCloseModal] = useState(false); // Force close mechanism
  const [newRack, setNewRack] = useState<NewRack>({
    name: '',
    location: { x: 1, y: 1, z: 1 },
    capacity: 100,
    description: '',
  });




  // Mock data for demonstration
  const mockRacks: Rack[] = [
    {
      id: 'R001',
      name: 'Rack A1',
      status: 'occupied',
      productName: 'Electronics Kit',
      productId: 'ELEK001',
      lastUpdated: '2025-09-08 14:30',
      location: { x: 1, y: 1, z: 1 },
      capacity: 100,
      description: 'Main electronics storage'
    },
    {
      id: 'R002',
      name: 'Rack A2',
      status: 'empty',
      lastUpdated: '2025-09-08 12:15',
      location: { x: 1, y: 1, z: 2 },
      capacity: 100,
      description: 'Secondary storage'
    },
    {
      id: 'R003',
      name: 'Rack A3',
      status: 'occupied',
      productName: 'Mechanical Parts',
      productId: 'MECH002',
      lastUpdated: '2025-09-08 15:45',
      location: { x: 1, y: 1, z: 3 },
      capacity: 150,
      description: 'Heavy mechanical components'
    },
  ];

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
          capacity: rack.capacity,
          description: rack.description,
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

  const handleAddRack = async () => {
    if (!newRack.name.trim()) {
      Alert.alert('Error', 'Please enter a rack name');
      return;
    }

    if (!authToken) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(API_URLS.CREATE_RACK, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRack.name,
          location: newRack.location,
          capacity: newRack.capacity,
          description: newRack.description,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Transform the response data to match our frontend format
        const newRackData: Rack = {
          id: result.data.id,
          name: result.data.name,
          status: result.data.status,
          lastUpdated: new Date().toLocaleString(),
          location: result.data.location,
          capacity: result.data.capacity,
          description: result.data.description,
        };
        
        setRacks(prev => [newRackData, ...prev]);
        resetForm();
        setShowAddModal(false);
        Alert.alert('Success', 'Rack added successfully');
      } else {
        throw new Error(result.error || 'Failed to create rack');
      }
    } catch (error) {
      console.error('Error adding rack:', error);
      Alert.alert('Error', 'Failed to add rack');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRack = (rack: Rack) => {
    setSelectedRack(rack);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setNewRack({
      name: '',
      location: { x: 1, y: 1, z: 1 },
      capacity: 100,
      description: '',
    });
  };

  // Memoized onChangeText handlers to prevent re-renders
  const handleRackNameChange = React.useCallback((text: string) => {
    console.log('Typing:', text);
    setNewRack(prev => ({ ...prev, name: text }));
  }, []);

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    console.log('closeEditModal called');
    setShowEditModal(false);
    setSelectedRack(null);
  };

  const forceCloseEditModal = React.useCallback(() => {
    console.log('forceCloseEditModal called');
    setLoading(false);
    setSelectedRack(null);
    setShowEditModal(false);
  }, []);

  const emergencyReset = React.useCallback(() => {
    console.log('Emergency reset called');
    setLoading(false);
    setShowEditModal(false);
    setSelectedRack(null);
    setShowAddModal(false);
    setForceCloseModal(true);
    setModalKey(prev => prev + 1);
  }, []);

  // Reset loading state when modal closes
  React.useEffect(() => {
    if (!showEditModal) {
      setLoading(false);
    }
  }, [showEditModal]);

  // Safety timeout to prevent infinite loading state
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Safety timeout: resetting loading state');
        setLoading(false);
        if (showEditModal) {
          setShowEditModal(false);
          setSelectedRack(null);
        }
      }, 15000); // 15 second safety timeout

      return () => clearTimeout(timeout);
    }
  }, [loading, showEditModal]);

  // Reset force close flag when modal should be open
  React.useEffect(() => {
    if (showEditModal && forceCloseModal) {
      console.log('Resetting force close flag');
      setForceCloseModal(false);
    }
  }, [showEditModal, forceCloseModal]);

  const handleUpdateRackStatus = async (rackId: string, status: 'empty' | 'occupied', productName?: string, productId?: string) => {
    console.log('handleUpdateRackStatus called:', { rackId, status, productName, productId });
    
    // Prevent multiple simultaneous updates
    if (loading) {
      console.log('Update already in progress, ignoring request');
      return;
    }
    
    if (!authToken) {
      console.log('No auth token available');
      Alert.alert('Error', 'Authentication required');
      return;
    }

    // Store original modal state for cleanup
    const wasModalOpen = showEditModal;

    // Validate required fields for occupied status
    if (status === 'occupied' && (!productName?.trim() || !productId?.trim())) {
      console.log('Validation failed: missing product info');
      Alert.alert(
        'Validation Error',
        'Product name and ID are required when marking rack as occupied.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('Starting API call...');
      setLoading(true);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout triggered');
        controller.abort();
      }, 10000); // 10 second timeout
      
      const requestBody = {
        status,
        productName: status === 'occupied' ? productName?.trim() : undefined,
        productId: status === 'occupied' ? productId?.trim() : undefined,
      };
      
      console.log('Request body:', requestBody);
      console.log('API URL:', API_URLS.UPDATE_RACK(rackId));
      
      const response = await fetch(API_URLS.UPDATE_RACK(rackId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        console.log('Update successful, updating local state...');
        
        // Update local state first
        setRacks(prev =>
          prev.map(rack =>
            rack.id === rackId
              ? {
                  ...rack,
                  status,
                  productName: status === 'occupied' ? productName?.trim() : undefined,
                  productId: status === 'occupied' ? productId?.trim() : undefined,
                  lastUpdated: new Date().toLocaleString(),
                }
              : rack
          )
        );
        
        // Reset loading state
        setLoading(false);
        console.log('Loading state reset to false');
        
        // Close modal and reset state with immediate effect
        console.log('Closing modal with immediate state updates');
        
        // Use setTimeout to ensure state updates happen in next tick
        setTimeout(() => {
          setSelectedRack(null);
          console.log('Selected rack reset to null');
          
          setShowEditModal(false);
          console.log('Modal state reset to false');
          
          // Force close modal
          setForceCloseModal(true);
          console.log('Force close modal set to true');
          
          // Force modal re-render
          setModalKey(prev => prev + 1);
          console.log('Modal key updated to force re-render');
        }, 0);
        
        // Show success message after a small delay to ensure state updates
        setTimeout(() => {
          console.log('Showing success alert');
          Alert.alert('Success', `Rack status updated to ${status}`);
        }, 100);
        
        // Backup: Force close modal after 500ms if still open
        setTimeout(() => {
          if (showEditModal) {
            console.log('Backup: Force closing modal');
            setShowEditModal(false);
            setSelectedRack(null);
            setModalKey(prev => prev + 1);
          }
        }, 500);
        
        // Nuclear option: Force unmount modal after 1 second
        setTimeout(() => {
          console.log('Nuclear option: Force unmounting modal');
          setModalKey(prev => prev + 1000); // Large key change to force complete remount
          setShowEditModal(false);
          setSelectedRack(null);
        }, 1000);
        
        console.log('Update completed successfully');
      } else {
        throw new Error(result.error || 'Failed to update rack');
      }
    } catch (error) {
      console.error('Error updating rack:', error);
      
      // Reset loading state immediately on error
      setLoading(false);
      
      // Show appropriate error message
      if (error.name === 'AbortError') {
        Alert.alert('Error', 'Request timed out. Please check your connection and try again.');
      } else if (error.message.includes('HTTP')) {
        Alert.alert('Error', `Server error: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to update rack status. Please try again.');
      }
      
      console.log('Error handling completed');
    }
  };

  const handleDeleteRack = (rackId: string) => {
    if (!authToken) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    Alert.alert(
      'Delete Rack',
      'Are you sure you want to delete this rack?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await fetch(API_URLS.DELETE_RACK(rackId), {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              const result = await response.json();
              
              if (result.success) {
                setRacks(prev => prev.filter(rack => rack.id !== rackId));
                Alert.alert('Success', 'Rack deleted successfully');
              } else {
                throw new Error(result.error || 'Failed to delete rack');
              }
            } catch (error) {
              console.error('Error deleting rack:', error);
              Alert.alert('Error', 'Failed to delete rack');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const RackCard: React.FC<{ rack: Rack }> = ({ rack }) => (
    <View style={[styles.rackCard, rack.status === 'occupied' ? styles.occupiedCard : styles.emptyCard]}>
      <View style={styles.rackHeader}>
        <View style={styles.rackInfo}>
          <Text style={styles.rackName}>{rack.name}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                rack.status === 'occupied' ? styles.occupiedIndicator : styles.emptyIndicator,
              ]}
            />
            <Text style={styles.statusText}>
              {rack.status === 'occupied' ? 'Occupied' : 'Empty'}
            </Text>
          </View>
        </View>
        <View style={styles.rackActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditRack(rack)}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteRack(rack.id)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rackContent}>
        <Text style={styles.locationText}>
          Location: ({rack.location.x}, {rack.location.y}, {rack.location.z})
        </Text>
        <Text style={styles.capacityText}>Capacity: {rack.capacity}kg</Text>
        {rack.description && (
          <Text style={styles.descriptionText}>{rack.description}</Text>
        )}
        {rack.status === 'occupied' && (
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{rack.productName}</Text>
            <Text style={styles.productId}>ID: {rack.productId}</Text>
          </View>
        )}
        <Text style={styles.lastUpdated}>Updated: {rack.lastUpdated}</Text>
      </View>
    </View>
  );

  const AddRackModal = () => (
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeAddModal}
          hardwareAccelerated={true}
          statusBarTranslucent={false}
        >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Rack</Text>
          <TouchableOpacity onPress={closeAddModal}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          removeClippedSubviews={false}
          bounces={true}
          alwaysBounceVertical={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rack Name *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={rackNameRef}
                style={styles.textInput}
                value={newRack.name}
                onChangeText={handleRackNameChange}
                placeholder="e.g., Rack A1"
                placeholderTextColor={COLORS.gray}
                blurOnSubmit={false}
                returnKeyType="next"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                textContentType="none"
                onSubmitEditing={() => locationXRef.current?.focus()}
                onFocus={() => console.log('Rack name focused')}
                onBlur={() => console.log('Rack name blurred')}
                selectTextOnFocus={false}
                caretHidden={false}
                multiline={false}
                numberOfLines={1}
                keyboardType="default"
                secureTextEntry={false}
                editable={true}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationInputs}>
              <View style={styles.locationInput}>
                <Text style={styles.locationLabel}>X</Text>
                <TextInput
                  ref={locationXRef}
                  style={styles.numberInput}
                  value={newRack.location.x.toString()}
                  onChangeText={(text) => setNewRack(prev => ({
                    ...prev,
                    location: { ...prev.location, x: parseInt(text) || 1 }
                  }))}
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => locationYRef.current?.focus()}
                />
              </View>
              <View style={styles.locationInput}>
                <Text style={styles.locationLabel}>Y</Text>
                <TextInput
                  ref={locationYRef}
                  style={styles.numberInput}
                  value={newRack.location.y.toString()}
                  onChangeText={(text) => setNewRack(prev => ({
                    ...prev,
                    location: { ...prev.location, y: parseInt(text) || 1 }
                  }))}
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => locationZRef.current?.focus()}
                />
              </View>
              <View style={styles.locationInput}>
                <Text style={styles.locationLabel}>Z</Text>
                <TextInput
                  ref={locationZRef}
                  style={styles.numberInput}
                  value={newRack.location.z.toString()}
                  onChangeText={(text) => setNewRack(prev => ({
                    ...prev,
                    location: { ...prev.location, z: parseInt(text) || 1 }
                  }))}
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => capacityRef.current?.focus()}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Capacity (kg)</Text>
            <TextInput
              ref={capacityRef}
              style={styles.textInput}
              value={newRack.capacity.toString()}
              onChangeText={(text) => setNewRack(prev => ({ ...prev, capacity: parseInt(text) || 100 }))}
              keyboardType="numeric"
              placeholder="100"
              blurOnSubmit={false}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              ref={descriptionRef}
              style={[styles.textInput, styles.textArea]}
              value={newRack.description}
              onChangeText={(text) => setNewRack(prev => ({ ...prev, description: text }))}
              placeholder="Optional description"
              multiline
              numberOfLines={3}
              blurOnSubmit={false}
              returnKeyType="default"
              autoCapitalize="sentences"
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={closeAddModal}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddRack}
          >
            <Text style={styles.saveButtonText}>Add Rack</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const EditRackModal = () => {
    const [productName, setProductName] = useState(selectedRack?.productName || '');
    const [productId, setProductId] = useState(selectedRack?.productId || '');
    
    // Refs for TextInput focus management in EditRackModal
    const productNameRef = useRef<TextInput>(null);
    const productIdRef = useRef<TextInput>(null);
    
    // Debug log for modal visibility
    console.log('EditRackModal render - showEditModal:', showEditModal, 'selectedRack:', selectedRack?.id);

    return (
      <Modal 
        visible={showEditModal && !forceCloseModal} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Rack: {selectedRack?.name}</Text>
            <TouchableOpacity onPress={closeEditModal}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Current Status</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    selectedRack?.status === 'empty' && styles.activeStatusButton,
                    loading && styles.disabledButton
                  ]}
                  onPress={() => {
                    console.log('Empty button pressed, loading:', loading);
                    if (loading) return; // Prevent multiple taps
                    handleUpdateRackStatus(selectedRack!.id, 'empty');
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={[
                      styles.statusButtonText,
                      selectedRack?.status === 'empty' && styles.activeStatusButtonText
                    ]}>Updating...</Text>
                  ) : (
                    <>
                      <Ionicons name="cube-outline" size={20} color={selectedRack?.status === 'empty' ? COLORS.white : COLORS.warning} />
                      <Text style={[
                        styles.statusButtonText,
                        selectedRack?.status === 'empty' && styles.activeStatusButtonText
                      ]}>Empty</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    selectedRack?.status === 'occupied' && styles.activeStatusButton,
                    loading && styles.disabledButton
                  ]}
                  onPress={() => {
                    console.log('Occupied button pressed, loading:', loading, 'selectedRack:', selectedRack?.status);
                    if (loading) return; // Prevent multiple taps
                    
                    if (selectedRack?.status === 'occupied') {
                      // If already occupied, just update with current values
                      console.log('Updating existing occupied rack');
                      handleUpdateRackStatus(selectedRack.id, 'occupied', productName, productId);
                    } else {
                      // If changing to occupied, require product info
                      console.log('Changing to occupied, checking product info:', { productName, productId });
                      if (!productName.trim() || !productId.trim()) {
                        Alert.alert(
                          'Product Information Required',
                          'Please enter product name and ID before marking as occupied.',
                          [{ text: 'OK' }]
                        );
                        return;
                      }
                      handleUpdateRackStatus(selectedRack!.id, 'occupied', productName, productId);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={[
                      styles.statusButtonText,
                      selectedRack?.status === 'occupied' && styles.activeStatusButtonText
                    ]}>Updating...</Text>
                  ) : (
                    <>
                      <Ionicons name="cube" size={20} color={selectedRack?.status === 'occupied' ? COLORS.white : COLORS.success} />
                      <Text style={[
                        styles.statusButtonText,
                        selectedRack?.status === 'occupied' && styles.activeStatusButtonText
                      ]}>Occupied</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {selectedRack?.status === 'occupied' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name</Text>
                <TextInput
                  ref={productNameRef}
                  style={styles.textInput}
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="Enter product name"
                  blurOnSubmit={false}
                  returnKeyType="next"
                  autoCapitalize="words"
                  onSubmitEditing={() => productIdRef.current?.focus()}
                />
              </View>
            )}

            {selectedRack?.status === 'occupied' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product ID</Text>
                <TextInput
                  ref={productIdRef}
                  style={styles.textInput}
                  value={productId}
                  onChangeText={setProductId}
                  placeholder="Enter product ID"
                  blurOnSubmit={false}
                  returnKeyType="done"
                  autoCapitalize="characters"
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, loading && styles.disabledButton]}
              onPress={closeEditModal}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={() => {
                if (loading) return; // Prevent multiple taps
                
                if (selectedRack?.status === 'occupied' && (!productName.trim() || !productId.trim())) {
                  Alert.alert('Error', 'Please enter both product name and ID for occupied racks');
                  return;
                }
                handleUpdateRackStatus(selectedRack!.id, selectedRack!.status, productName, productId);
              }}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Updating...' : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.toggleDrawer()}
        >
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rack Management</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={emergencyReset}
          >
            <Ionicons name="refresh" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{racks.length}</Text>
          <Text style={styles.statLabel}>Total Racks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.primary }]}>
            {racks.filter(r => r.status === 'occupied').length}
          </Text>
          <Text style={styles.statLabel}>Occupied</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.gray }]}>
            {racks.filter(r => r.status === 'empty').length}
          </Text>
          <Text style={styles.statLabel}>Empty</Text>
        </View>
      </View>

      {/* Racks List */}
      <FlatList
        data={racks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RackCard rack={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyStateText}>No racks found</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Rack</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {showAddModal && (
        <RackForm
          newRack={newRack}
          onRackChange={setNewRack}
          onClose={closeAddModal}
          onSubmit={handleAddRack}
        />
      )}
      <EditRackModal key={modalKey} />
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    padding: SIZES.padding,
  },
  rackCard: {
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
    borderLeftColor: COLORS.primary,
  },
  emptyCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gray,
  },
  rackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rackInfo: {
    flex: 1,
  },
  rackName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  occupiedIndicator: {
    backgroundColor: COLORS.primary,
  },
  emptyIndicator: {
    backgroundColor: COLORS.gray,
  },
  statusText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  rackActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  rackContent: {
    marginBottom: 10,
  },
  locationText: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  capacityText: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginBottom: 8,
    fontStyle: 'italic',
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
  lastUpdated: {
    fontSize: SIZES.body4,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: SIZES.body2,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addFirstButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.statusBarHeight + 10,
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
    minHeight: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.body,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  locationLabel: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginBottom: 5,
    textAlign: 'center',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.body,
    backgroundColor: COLORS.inputBackground,
    textAlign: 'center',
  },
  statusSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.card,
  },
  activeStatusButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    marginLeft: 8,
    color: COLORS.text,
  },
  disabledButton: {
    opacity: 0.6,
  },
  activeStatusButtonText: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.body2,
    color: COLORS.gray,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.body2,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default RackManagementScreen;
