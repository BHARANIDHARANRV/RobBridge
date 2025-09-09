import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { API_URLS } from '../config/server';

interface ScanResult {
  id: string;
  barcode: string;
  type: string;
  timestamp: string;
  timestampMs: number; // Milliseconds timestamp for accurate comparison
  product?: string;
  productName?: string;
  productId?: string;
  price?: string;
  location?: string;
  category?: string;
  source?: string;
}

const { width, height } = Dimensions.get('window');

// Generate unique ID for scan results
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Parse barcode data to extract product information
const parseBarcodeData = (data: string) => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(data);
    
    // Check if this is our structured data format
    if (parsed.original_data && parsed.product_name) {
      return {
        productName: parsed.product_name || 'Unknown',
        productId: parsed.product_id || parsed.original_data,
        price: parsed.price || 'N/A',
        location: parsed.location || 'N/A',
        category: parsed.category || 'Unknown',
        source: parsed.source || 'mobile'
      };
    }
    
    // Handle other JSON formats
    return {
      productName: parsed.product_name || 'Unknown',
      productId: parsed.product_id || data,
      price: parsed.price || parsed.price_value || 'N/A',
      location: parsed.location ? 
        (typeof parsed.location === 'object' ? 
          `${parsed.location.x}, ${parsed.location.y}, ${parsed.location.z}` : 
          parsed.location) : 'N/A',
      category: parsed.category || 'Unknown',
      source: parsed.source || 'mobile'
    };
  } catch (error) {
    // If not JSON, try to parse as pipe-separated values
    if (data.includes('|')) {
      const parts = data.split('|');
      return {
        productName: parts[1] || 'Unknown',
        productId: parts[0] || data,
        price: parts[3] || 'N/A',
        location: parts[4] || 'N/A',
        category: parts[2] || 'Unknown',
        source: 'mobile'
      };
    }
    
    // If not JSON or pipe-separated, treat as simple string
    return {
      productName: 'Unknown Product',
      productId: data,
      price: 'N/A',
      location: 'N/A',
      category: 'Unknown',
      source: 'mobile'
    };
  }
};

// Function to lookup barcode data from database
const lookupBarcodeData = async (barcodeData: string) => {
  try {
    // First login to get token
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
      throw new Error('Login failed');
    }
    
    const token = loginResult.token;

    // Get list of barcodes and find matching one
    const response = await fetch(API_URLS.LIST_BARCODES, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log('API response not ok:', response.status);
      return { found: false };
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      // Find barcode with matching data
      const matchingBarcode = result.data.find((barcode: any) => 
        barcode.barcode_data === barcodeData
      );
      
      if (matchingBarcode) {
        // Parse metadata if it exists
        let metadata = {};
        if (matchingBarcode.metadata) {
          try {
            metadata = JSON.parse(matchingBarcode.metadata);
          } catch (e) {
            console.log('Could not parse metadata:', e);
          }
        }
        
        return {
          found: true,
          productName: metadata.product_name || 'Unknown Product',
          productId: metadata.product_id || matchingBarcode.barcode_data,
          price: metadata.price || 'N/A',
          location: metadata.location || 'N/A',
          category: metadata.category || 'Unknown',
          source: matchingBarcode.source || 'database'
        };
      }
    }
    
    return { found: false };
  } catch (error) {
    console.error('Error looking up barcode data:', error);
    return { found: false };
  }
};

// Function to save scanned barcode to database
const saveScannedBarcodeToDatabase = async (scanResult: ScanResult) => {
  try {
    // First login to get token
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
      throw new Error('Login failed');
    }
    
    const token = loginResult.token;

    const response = await fetch(API_URLS.SAVE_SCANNED_BARCODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: scanResult.barcode,
        type: scanResult.type,
        source: scanResult.source || 'mobile',
        product_name: scanResult.productName,
        product_id: scanResult.productId,
        price: scanResult.price,
        location: scanResult.location,
        category: scanResult.category,
      }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('Scanned barcode saved to database:', result.barcode_id);
    } else {
      console.error('Failed to save scanned barcode:', result.error);
    }
  } catch (error) {
    console.error('Error saving scanned barcode to database:', error);
  }
};

const BarcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [flashMode, setFlashMode] = useState<'off' | 'torch'>('off');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<RootDrawerNavigationProp>();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Camera permission error:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const openDrawer = () => {
    console.log('Menu button pressed - attempting to open drawer');
    try {
      navigation.openDrawer();
      console.log('Drawer opened successfully');
    } catch (error) {
      console.error('Error opening drawer:', error);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleBarCodeScanned = async (scanResult: any) => {
    if (!isScanning) return;
    
    const { data, type } = scanResult;
    const now = Date.now();
    
    // Debounce: prevent scans within 1 second of each other
    if (now - lastScanTime < 1000) {
      console.log('Scan debounced, too soon after last scan');
      return;
    }
    
    // Check if this barcode was already scanned recently (within 3 seconds)
    const recentScan = scanResults.find(result => 
      result.barcode === data && 
      (now - result.timestampMs) < 3000
    );
    
    if (recentScan) {
      console.log('Duplicate scan detected, ignoring:', data);
      return;
    }
    
    console.log('New scan detected:', { data, type });
    
    // Update last scan time
    setLastScanTime(now);
    
    // First try to lookup the barcode data from database
    const lookupResult = await lookupBarcodeData(data);
    
    let parsedData;
    if (lookupResult.found) {
      // Use data from database lookup
      parsedData = {
        productName: lookupResult.productName,
        productId: lookupResult.productId,
        price: lookupResult.price,
        location: lookupResult.location,
        category: lookupResult.category,
        source: lookupResult.source,
      };
    } else {
      // Fallback to parsing the raw data
      parsedData = parseBarcodeData(data);
    }
    
    const newResult: ScanResult = {
      id: generateUniqueId(),
      barcode: data,
      type: type || 'Unknown',
      timestamp: new Date().toLocaleTimeString(),
      timestampMs: now, // Store milliseconds for accurate comparison
      product: parsedData.productName,
      productName: parsedData.productName,
      productId: parsedData.productId,
      price: parsedData.price,
      location: parsedData.location,
      category: parsedData.category,
      source: parsedData.source,
    };
    
    // Temporarily disable scanning to prevent multiple detections
    setIsScanning(false);
    
    setScanResults(prev => [newResult, ...prev]);
    
    // Save scanned barcode to database
    saveScannedBarcodeToDatabase(newResult);
    
    // Directly show the product information modal instead of alert
    setSelectedResult(newResult);
    
    // Re-enable scanning after a delay
    setTimeout(() => {
      setIsScanning(true);
    }, 2000);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'torch' : 'off');
  };

  const clearResults = () => {
    Alert.alert(
      'Clear Results',
      'Are you sure you want to clear all scan results?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setScanResults([]) },
      ]
    );
  };

  const viewResultDetails = (result: ScanResult) => {
    setSelectedResult(result);
    // Disable scanning when viewing results
    setIsScanning(false);
  };

  const closeResultModal = () => {
    setSelectedResult(null);
    // Re-enable scanning when modal is closed
    setTimeout(() => {
      setIsScanning(true);
    }, 500);
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={28} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <Ionicons name="camera" size={64} color={COLORS.gray} />
            <Text style={styles.loadingText}>Requesting camera permission...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={28} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.content}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera" size={80} color={COLORS.error} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              This app needs camera access to scan barcodes. Please grant camera permission in your device settings.
            </Text>
            <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Barcode Scanner</Text>
        <TouchableOpacity style={styles.resultsButton} onPress={() => setShowResults(true)}>
          <Ionicons name="list" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
            }}
          >
            {/* Camera Overlay */}
            <View style={styles.cameraOverlay}>
              {/* Scan Frame */}
              <View style={styles.scanFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              
              {/* Instructions */}
              <View style={styles.instructions}>
                <Text style={styles.instructionText}>
                  Position barcode within the frame
                </Text>
              </View>
            </View>
          </CameraView>
        </View>

        {/* Debug Info */}
        {isScanning && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>🔍 Scanning Active</Text>
            <Text style={styles.debugText}>Supported: QR, Code128, EAN13, etc.</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
            onPress={isScanning ? stopScanning : startScanning}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isScanning ? "stop" : "scan"} 
              size={32} 
              color={COLORS.textLight} 
            />
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Stop Scan' : 'Start Scan'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={toggleFlash}>
              <Ionicons 
                name={flashMode === 'torch' ? "flash" : "flash-off"} 
                size={20} 
                color={flashMode === 'torch' ? COLORS.warning : COLORS.primary} 
              />
              <Text style={[styles.secondaryButtonText, { color: flashMode === 'torch' ? COLORS.warning : COLORS.primary }]}>
                {flashMode === 'torch' ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowResults(true)}>
              <Ionicons name="list" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Results ({scanResults.length})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={clearResults}>
              <Ionicons name="trash" size={20} color={COLORS.error} />
              <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Scans */}
        {scanResults.length > 0 && (
          <View style={styles.recentScans}>
            <Text style={styles.recentTitle}>Recent Scans</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {scanResults.slice(0, 5).map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.recentItem}
                  onPress={() => viewResultDetails(result)}
                >
                  <Ionicons name="barcode" size={24} color={COLORS.primary} />
                  <Text style={styles.recentBarcode}>{result.barcode.slice(-6)}</Text>
                  <Text style={styles.recentTime}>{result.timestamp}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Results</Text>
            <TouchableOpacity onPress={() => {
              setShowResults(false);
              // Re-enable scanning when results modal is closed
              setTimeout(() => {
                setIsScanning(true);
              }, 500);
            }}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {scanResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="scan" size={64} color={COLORS.gray} />
                <Text style={styles.emptyText}>No scans yet</Text>
                <Text style={styles.emptySubtext}>Start scanning to see results here</Text>
              </View>
            ) : (
              scanResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultItem}
                  onPress={() => viewResultDetails(result)}
                >
                  <View style={styles.resultHeader}>
                    <Ionicons name="barcode" size={24} color={COLORS.primary} />
                    <Text style={styles.resultBarcode}>{result.barcode}</Text>
                    <Text style={styles.resultType}>{result.type}</Text>
                  </View>
                  {result.product && (
                    <Text style={styles.resultProduct}>{result.product}</Text>
                  )}
                  <Text style={styles.resultTime}>{result.timestamp}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Product Information Modal */}
      <Modal
        visible={!!selectedResult}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.productInfoHeader}>
              <View style={styles.productIconContainer}>
                <Ionicons name="cube" size={32} color={COLORS.success} />
              </View>
              <Text style={styles.productInfoTitle}>Product Information</Text>
            </View>
            <TouchableOpacity onPress={closeResultModal}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          {selectedResult && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.productInfoList}>
                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: '#8B4513' }]}>
                      <Ionicons name="cube" size={20} color="white" />
                    </View>
                    <Text style={styles.productInfoLabel}>Product:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.productName || selectedResult.product || 'Unknown'}</Text>
                </View>

                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: '#6A0DAD' }]}>
                      <Text style={styles.productInfoIconText}>ID</Text>
                    </View>
                    <Text style={styles.productInfoLabel}>ID:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.productId || selectedResult.barcode}</Text>
                </View>

                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: '#FFD700' }]}>
                      <Ionicons name="cash" size={20} color="white" />
                    </View>
                    <Text style={styles.productInfoLabel}>Price:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.price || 'N/A'}</Text>
                </View>

                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: '#FF0000' }]}>
                      <Ionicons name="location" size={20} color="white" />
                    </View>
                    <Text style={styles.productInfoLabel}>Location:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.location || 'N/A'}</Text>
                </View>

                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: '#D2B48C' }]}>
                      <Ionicons name="pricetag" size={20} color="white" />
                    </View>
                    <Text style={styles.productInfoLabel}>Category:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.category || 'Unknown'}</Text>
                </View>

                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: '#4CAF50' }]}>
                      <Ionicons name="phone-portrait" size={20} color="white" />
                    </View>
                    <Text style={styles.productInfoLabel}>Source:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.source || 'mobile'}</Text>
                </View>

                <View style={styles.productInfoItem}>
                  <View style={styles.productInfoLeft}>
                    <View style={[styles.productInfoIcon, { backgroundColor: COLORS.secondary }]}>
                      <Ionicons name="time" size={20} color="white" />
                    </View>
                    <Text style={styles.productInfoLabel}>Scanned:</Text>
                  </View>
                  <Text style={styles.productInfoValue}>{selectedResult.timestamp}</Text>
                </View>
              </View>
            </ScrollView>
          )}
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
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginLeft: -40,
  },
  resultsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: SIZES.margin,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.6,
    height: width * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: COLORS.primary,
  },
  cornerTopRight: {
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructions: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.marginSmall,
    borderRadius: SIZES.radius,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  permissionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
    textAlign: 'center',
    lineHeight: 24,
  },
  settingsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.marginLarge,
  },
  settingsButtonText: {
    color: COLORS.textLight,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  controls: {
    marginTop: SIZES.marginLarge,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
  },
  scanButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  scanButtonText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginLeft: SIZES.marginSmall,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  secondaryButtonText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    marginLeft: SIZES.marginSmall,
  },
  recentScans: {
    marginTop: SIZES.marginLarge,
  },
  recentTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  recentItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.margin,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentBarcode: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
  },
  recentTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
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
  resultItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginSmall,
  },
  resultBarcode: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginLeft: SIZES.marginSmall,
  },
  resultType: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: SIZES.marginSmall,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSmall,
  },
  resultProduct: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  resultTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
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
    marginTop: SIZES.margin,
  },
  detailRow: {
    flexDirection: 'row',
  },
  debugInfo: {
    backgroundColor: COLORS.primary + '20',
    padding: SIZES.marginSmall,
    marginHorizontal: SIZES.margin,
    borderRadius: SIZES.radiusSmall,
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  debugText: {
    color: COLORS.primary,
    fontSize: SIZES.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailValue: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: SIZES.margin,
  },
  productInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productIconContainer: {
    marginRight: SIZES.margin,
  },
  productInfoTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productInfoList: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  productInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  productInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  productInfoIconText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfoLabel: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productInfoValue: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'right',
    flex: 1,
    marginLeft: SIZES.margin,
  },
});

export default BarcodeScannerScreen;
