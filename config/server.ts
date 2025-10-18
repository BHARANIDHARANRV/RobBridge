// Server configuration for the Robridge app
export const SERVER_CONFIG = {
  // Base URL for the Python barcode server
  BASE_URL: 'http://192.168.137.182:5001',
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    LOGIN: '/api/auth/login',
    GENERATE_BARCODE: '/api/barcode/generate',
    SAVE_SCANNED_BARCODE: '/api/barcode/save_scanned',
    LIST_BARCODES: '/api/barcode/list',
    GET_BARCODE: '/api/barcode',
    GET_BARCODE_BY_ID: '/api/barcode',
    GET_BARCODE_DATA: '/api/barcode',
    GET_BARCODE_IMAGE: '/api/barcode/image',
              ROBOT_STATUS: '/api/robot/status',
              ROBOT_CONNECT: '/api/robot/connect',
              ROBOT_MOVE: '/api/robot/move',
              DASHBOARD_STATS: '/api/dashboard/stats',
              // Rack Management endpoints
              GET_RACKS: '/api/racks',
              CREATE_RACK: '/api/racks',
              UPDATE_RACK: '/api/racks',
              DELETE_RACK: '/api/racks',
              RACK_STATS: '/api/racks/stats',
              // Product Movement endpoints
              RECORD_PRODUCT_MOVEMENT: '/api/products/movement',
              GET_PRODUCT_MOVEMENTS: '/api/products/movements',
              // Report endpoints
              GENERATE_EXCEL_REPORT: '/api/reports/outbound/excel',
              GENERATE_PDF_REPORT: '/api/reports/outbound/pdf',
              DOWNLOAD_REPORT: '/api/reports/download',
  },
  
  // Connection settings
  CONNECTION: {
    TIMEOUT: 3000, // 3 seconds
    RETRY_INTERVAL: 10000, // 10 seconds
  }
};

// Helper function to build full URLs
export const buildUrl = (endpoint: string): string => {
  return `${SERVER_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get full API URLs
export const API_URLS = {
  HEALTH: buildUrl(SERVER_CONFIG.ENDPOINTS.HEALTH),
  LOGIN: buildUrl(SERVER_CONFIG.ENDPOINTS.LOGIN),
  GENERATE_BARCODE: buildUrl(SERVER_CONFIG.ENDPOINTS.GENERATE_BARCODE),
  SAVE_SCANNED_BARCODE: buildUrl(SERVER_CONFIG.ENDPOINTS.SAVE_SCANNED_BARCODE),
  LIST_BARCODES: buildUrl(SERVER_CONFIG.ENDPOINTS.LIST_BARCODES),
  GET_BARCODE: (filename: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.GET_BARCODE}/${filename}`),
  GET_BARCODE_BY_ID: (id: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.GET_BARCODE_BY_ID}/${id}`),
  GET_BARCODE_DATA: (id: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.GET_BARCODE_DATA}/${id}`),
  GET_BARCODE_IMAGE: (filename: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.GET_BARCODE_IMAGE}/${filename}`),
  ROBOT_STATUS: buildUrl(SERVER_CONFIG.ENDPOINTS.ROBOT_STATUS),
  ROBOT_CONNECT: buildUrl(SERVER_CONFIG.ENDPOINTS.ROBOT_CONNECT),
  ROBOT_MOVE: buildUrl(SERVER_CONFIG.ENDPOINTS.ROBOT_MOVE),
  DASHBOARD_STATS: buildUrl(SERVER_CONFIG.ENDPOINTS.DASHBOARD_STATS),
  // Rack Management URLs
  GET_RACKS: buildUrl(SERVER_CONFIG.ENDPOINTS.GET_RACKS),
  CREATE_RACK: buildUrl(SERVER_CONFIG.ENDPOINTS.CREATE_RACK),
  UPDATE_RACK: (rackId: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.UPDATE_RACK}/${rackId}`),
  DELETE_RACK: (rackId: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.DELETE_RACK}/${rackId}`),
  RACK_STATS: buildUrl(SERVER_CONFIG.ENDPOINTS.RACK_STATS),
  // Product Movement URLs
  RECORD_PRODUCT_MOVEMENT: buildUrl(SERVER_CONFIG.ENDPOINTS.RECORD_PRODUCT_MOVEMENT),
  GET_PRODUCT_MOVEMENTS: buildUrl(SERVER_CONFIG.ENDPOINTS.GET_PRODUCT_MOVEMENTS),
  // Report URLs
  GENERATE_EXCEL_REPORT: buildUrl(SERVER_CONFIG.ENDPOINTS.GENERATE_EXCEL_REPORT),
  GENERATE_PDF_REPORT: buildUrl(SERVER_CONFIG.ENDPOINTS.GENERATE_PDF_REPORT),
  DOWNLOAD_REPORT: (filename: string) => buildUrl(`${SERVER_CONFIG.ENDPOINTS.DOWNLOAD_REPORT}/${filename}`),
};
