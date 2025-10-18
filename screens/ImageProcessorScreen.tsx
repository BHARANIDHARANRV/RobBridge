import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { useAuth } from '../contexts/AuthContext';

interface ProcessedImage {
  id: string;
  originalUri: string;
  processedUri: string;
  filter: string;
  timestamp: string;
  size: string;
}

interface ImageFilter {
  id: string;
  name: string;
  icon: string;
  description: string;
  intensity: number;
}

const { width } = Dimensions.get('window');

// Generate unique ID for processed images
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const ImageProcessorScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ImageFilter | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ProcessedImage | null>(null);
  
  const navigation = useNavigation<RootDrawerNavigationProp>();
  const { logout } = useAuth();

  const imageFilters: ImageFilter[] = [
    {
      id: 'grayscale',
      name: 'Grayscale',
      icon: 'contrast',
      description: 'Convert to black and white',
      intensity: 1.0,
    },
    {
      id: 'sepia',
      name: 'Sepia',
      icon: 'color-palette',
      description: 'Apply vintage sepia tone',
      intensity: 0.8,
    },
    {
      id: 'blur',
      name: 'Blur',
      icon: 'eye-off',
      description: 'Apply blur effect',
      intensity: 0.6,
    },
    {
      id: 'sharpen',
      name: 'Sharpen',
      icon: 'eye',
      description: 'Enhance image sharpness',
      intensity: 0.7,
    },
    {
      id: 'invert',
      name: 'Invert',
      icon: 'swap-horizontal',
      description: 'Invert image colors',
      intensity: 1.0,
    },
    {
      id: 'brightness',
      name: 'Brightness',
      icon: 'sunny',
      description: 'Adjust brightness',
      intensity: 0.5,
    },
  ];

  const toggleDrawer = () => {
    console.log('ImageProcessorScreen: Menu button pressed - attempting to toggle drawer');
    console.log('ImageProcessorScreen: navigation object:', navigation);
    try {
      if (navigation && navigation.toggleDrawer) {
        navigation.toggleDrawer();
        console.log('ImageProcessorScreen: Drawer toggled successfully');
      } else {
        console.error('ImageProcessorScreen: navigation.toggleDrawer is not available');
      }
    } catch (error) {
      console.error('ImageProcessorScreen: Error toggling drawer:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: logout },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setSelectedFilter(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setSelectedFilter(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const selectFilter = (filter: ImageFilter) => {
    setSelectedFilter(filter);
    setShowFilters(false);
  };

  const processImage = async () => {
    if (!selectedImage || !selectedFilter) {
      Alert.alert('Error', 'Please select an image and a filter');
      return;
    }

    setIsProcessing(true);

    // Simulate image processing
    setTimeout(() => {
      const newProcessedImage: ProcessedImage = {
        id: generateUniqueId(),
        originalUri: selectedImage,
        processedUri: selectedImage, // In real app, this would be the processed image
        filter: selectedFilter.name,
        timestamp: new Date().toLocaleTimeString(),
        size: '2.4 MB',
      };

      setProcessedImages(prev => [newProcessedImage, ...prev]);
      setIsProcessing(false);

      Alert.alert(
        'Processing Complete!',
        `Image processed with ${selectedFilter.name} filter`,
        [
          { text: 'Process Another', onPress: () => {} },
          { text: 'View History', onPress: () => setShowHistory(true) },
          { text: 'OK', style: 'default' },
        ]
      );
    }, 2000);
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all processed images?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setProcessedImages([]) },
      ]
    );
  };

  const deleteImage = (id: string) => {
    setProcessedImages(prev => prev.filter(img => img.id !== id));
  };

  const viewImageDetails = (image: ProcessedImage) => {
    setSelectedHistoryItem(image);
  };

  const closeImageModal = () => {
    setSelectedHistoryItem(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDrawer}
          activeOpacity={0.5}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Processor</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
            <Ionicons name="time" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Image</Text>
          <View style={styles.imageSelection}>
            <TouchableOpacity style={styles.selectionButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color={COLORS.primary} />
              <Text style={styles.selectionButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={32} color={COLORS.primary} />
              <Text style={styles.selectionButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Image */}
        {selectedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Image</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter Selection */}
        {selectedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Filter</Text>
            <TouchableOpacity
              style={styles.filterSelector}
              onPress={() => setShowFilters(true)}
              activeOpacity={0.7}
            >
              <View style={styles.filterInfo}>
                <Text style={styles.filterName}>
                  {selectedFilter ? selectedFilter.name : 'Select a filter'}
                </Text>
                <Text style={styles.filterDescription}>
                  {selectedFilter ? selectedFilter.description : 'Choose an effect to apply'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Process Button */}
        {selectedImage && selectedFilter && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.processButton, isProcessing && styles.processButtonDisabled]}
              onPress={processImage}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={COLORS.textLight} size="small" />
              ) : (
                <Ionicons name="color-wand" size={32} color={COLORS.textLight} />
              )}
              <Text style={styles.processButtonText}>
                {isProcessing ? 'Processing...' : 'Process Image'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{processedImages.length}</Text>
              <Text style={styles.statLabel}>Processed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={COLORS.secondary} />
              <Text style={styles.statNumber}>
                {processedImages.length > 0 ? 'Today' : 'None'}
              </Text>
              <Text style={styles.statLabel}>Last Processed</Text>
            </View>
          </View>
        </View>

        {/* Recent Processing */}
        {processedImages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Processing</Text>
              <TouchableOpacity onPress={() => setShowHistory(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {processedImages.slice(0, 3).map((image) => (
              <TouchableOpacity
                key={image.id}
                style={styles.recentItem}
                onPress={() => viewImageDetails(image)}
              >
                <Image source={{ uri: image.processedUri }} style={styles.recentThumbnail} />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentFilter}>{image.filter}</Text>
                  <Text style={styles.recentTime}>{image.timestamp}</Text>
                  <Text style={styles.recentSize}>{image.size}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteImage(image.id)}
                >
                  <Ionicons name="trash" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Selection Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Filter</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {imageFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  selectedFilter?.id === filter.id && styles.filterOptionSelected
                ]}
                onPress={() => selectFilter(filter)}
              >
                <View style={styles.filterOptionContent}>
                  <Ionicons name={filter.icon as any} size={24} color={COLORS.primary} />
                  <View style={styles.filterOptionText}>
                    <Text style={styles.filterOptionName}>{filter.name}</Text>
                    <Text style={styles.filterOptionDescription}>{filter.description}</Text>
                  </View>
                </View>
                {selectedFilter?.id === filter.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Processing History</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={clearHistory}>
                <Ionicons name="trash" size={24} color={COLORS.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {processedImages.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="images" size={64} color={COLORS.gray} />
                <Text style={styles.emptyText}>No images processed yet</Text>
                <Text style={styles.emptySubtext}>Start processing images to see them here</Text>
              </View>
            ) : (
              processedImages.map((image) => (
                <TouchableOpacity
                  key={image.id}
                  style={styles.historyItem}
                  onPress={() => viewImageDetails(image)}
                >
                  <Image source={{ uri: image.processedUri }} style={styles.historyThumbnail} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyFilter}>{image.filter}</Text>
                    <Text style={styles.historyTime}>{image.timestamp}</Text>
                    <Text style={styles.historySize}>{image.size}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteImage(image.id)}
                  >
                    <Ionicons name="trash" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Image Details Modal */}
      <Modal
        visible={!!selectedHistoryItem}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Image Details</Text>
              <TouchableOpacity onPress={closeImageModal}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {selectedHistoryItem && (
              <View style={styles.detailContent}>
                <Image source={{ uri: selectedHistoryItem.processedUri }} style={styles.detailImage} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Filter Applied: {selectedHistoryItem.filter}</Text>
                  <Text style={styles.detailLabel}>Processed: {selectedHistoryItem.timestamp}</Text>
                  <Text style={styles.detailLabel}>Size: {selectedHistoryItem.size}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginLeft: -40,
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  viewAllText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  imageSelection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  selectionButton: {
    backgroundColor: COLORS.surface,
    padding: SIZES.paddingLarge,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionButtonText: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: width - 32,
    height: (width - 32) * 0.75,
    borderRadius: SIZES.radius,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  filterSelector: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterInfo: {
    flex: 1,
  },
  filterName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterDescription: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  processButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  processButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  processButtonText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginLeft: SIZES.marginSmall,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  recentItem: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusSmall,
  },
  recentInfo: {
    flex: 1,
    marginLeft: SIZES.margin,
  },
  recentFilter: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recentTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentSize: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: SIZES.marginSmall,
    backgroundColor: COLORS.error + '20',
    borderRadius: SIZES.radiusSmall,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  filterOption: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterOptionText: {
    marginLeft: SIZES.margin,
    flex: 1,
  },
  filterOptionName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterOptionDescription: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.marginLarge * 2,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.marginSmall,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusSmall,
  },
  historyInfo: {
    flex: 1,
    marginLeft: SIZES.margin,
  },
  historyFilter: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historySize: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '90%',
    maxWidth: 400,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  detailTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailContent: {
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
  },
  detailInfo: {
    width: '100%',
  },
  detailLabel: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
});

export default ImageProcessorScreen;
