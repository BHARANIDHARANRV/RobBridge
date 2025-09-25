import BleManager from 'react-native-ble-manager';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ESP32Device {
  id: string;
  name: string;
  rssi: number;
  advertising: any;
}

export interface RobotCommand {
  action: string;
  direction?: 'forward' | 'backward' | 'left' | 'right' | 'stop';
  speed?: number;
  angle?: number;
  duration?: number;
}

class ESP32Service {
  private connectedDevice: string | null = null;
  private isConnected: boolean = false;
  private isScanning: boolean = false;

  // ESP32 Service UUIDs (you'll need to match these with your ESP32 code)
  private readonly ESP32_SERVICE_UUID = '12345678-1234-1234-1234-123456789ABC';
  private readonly ESP32_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-CBA987654321';

  constructor() {
    this.initializeBluetooth();
  }

  private async initializeBluetooth() {
    try {
      await BleManager.start({ showAlert: false });
      console.log('Bluetooth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Bluetooth permissions are required to connect to ESP32 devices.'
          );
          return false;
        }
        return true;
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return true; // iOS permissions are handled automatically
  }

  async startScan(): Promise<void> {
    if (this.isScanning) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    try {
      this.isScanning = true;
      await BleManager.scan([], 10, true); // Scan for 10 seconds
      console.log('Started scanning for ESP32 devices');
    } catch (error) {
      console.error('Failed to start scan:', error);
      this.isScanning = false;
    }
  }

  async stopScan(): Promise<void> {
    try {
      await BleManager.stopScan();
      this.isScanning = false;
      console.log('Stopped scanning');
    } catch (error) {
      console.error('Failed to stop scan:', error);
    }
  }

  async getDiscoveredDevices(): Promise<ESP32Device[]> {
    try {
      const peripherals = await BleManager.getDiscoveredPeripherals();
      return peripherals.map(peripheral => ({
        id: peripheral.id,
        name: peripheral.name || 'Unknown Device',
        rssi: peripheral.rssi,
        advertising: peripheral.advertising,
      }));
    } catch (error) {
      console.error('Failed to get discovered devices:', error);
      return [];
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      await BleManager.connect(deviceId);
      this.connectedDevice = deviceId;
      this.isConnected = true;
      
      // Save connected device
      await AsyncStorage.setItem('connectedESP32', deviceId);
      
      console.log('Connected to ESP32:', deviceId);
      return true;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await BleManager.disconnect(this.connectedDevice);
        this.connectedDevice = null;
        this.isConnected = false;
        
        // Clear saved device
        await AsyncStorage.removeItem('connectedESP32');
        
        console.log('Disconnected from ESP32');
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  }

  async sendCommand(command: RobotCommand): Promise<boolean> {
    if (!this.isConnected || !this.connectedDevice) {
      console.error('No ESP32 connected');
      return false;
    }

    try {
      // Convert command to JSON string
      const commandString = JSON.stringify(command);
      
      // Convert to byte array
      const commandBytes = Buffer.from(commandString, 'utf8');
      
      // Send command via Bluetooth
      await BleManager.write(
        this.connectedDevice,
        this.ESP32_SERVICE_UUID,
        this.ESP32_CHARACTERISTIC_UUID,
        Array.from(commandBytes)
      );
      
      console.log('Command sent to ESP32:', command);
      return true;
    } catch (error) {
      console.error('Failed to send command:', error);
      return false;
    }
  }

  // Predefined robot commands
  async moveForward(speed: number = 100): Promise<boolean> {
    return this.sendCommand({
      action: 'move',
      direction: 'forward',
      speed: speed,
    });
  }

  async moveBackward(speed: number = 100): Promise<boolean> {
    return this.sendCommand({
      action: 'move',
      direction: 'backward',
      speed: speed,
    });
  }

  async turnLeft(angle: number = 90): Promise<boolean> {
    return this.sendCommand({
      action: 'turn',
      direction: 'left',
      angle: angle,
    });
  }

  async turnRight(angle: number = 90): Promise<boolean> {
    return this.sendCommand({
      action: 'turn',
      direction: 'right',
      angle: angle,
    });
  }

  async stop(): Promise<boolean> {
    return this.sendCommand({
      action: 'stop',
      direction: 'stop',
    });
  }

  async setLED(color: string, brightness: number = 255): Promise<boolean> {
    return this.sendCommand({
      action: 'led',
      color: color,
      brightness: brightness,
    });
  }

  async getStatus(): Promise<any> {
    if (!this.isConnected || !this.connectedDevice) {
      return null;
    }

    try {
      const data = await BleManager.read(
        this.connectedDevice,
        this.ESP32_SERVICE_UUID,
        this.ESP32_CHARACTERISTIC_UUID
      );
      
      // Parse response data
      const responseString = Buffer.from(data).toString('utf8');
      return JSON.parse(responseString);
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }

  // Getters
  getConnectedDevice(): string | null {
    return this.connectedDevice;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getScanningStatus(): boolean {
    return this.isScanning;
  }

  async getLastConnectedDevice(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('connectedESP32');
    } catch (error) {
      console.error('Failed to get last connected device:', error);
      return null;
    }
  }
}

export default new ESP32Service();
