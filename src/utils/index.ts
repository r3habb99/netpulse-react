/**
 * Centralized Utils Index
 * Export all utility functions from a single entry point
 */

// Constants
export * from './constants';

// Math utilities
export * from './mathUtils';

// Error handling
export * from './errorHandler';

// Device detection
export * from './deviceDetection';

// Formatters
export * from './formatters';

// WebRTC utilities
export * from './webrtcUtils';

// Re-export commonly used constants for convenience
export { CONSTANTS } from './constants';

// Re-export commonly used math functions
export {
  calculateSpeedMbps,
  applyOverheadCompensation,
  round,
  calculateAverage,
  calculateMedian,
  calculateStatistics,
  calculateQualityScore,
  calculateMin,
  calculateMax,
  calculateStandardDeviation,
  calculateJitter,
  calculatePacketLoss,
  calculatePercentile,
  calculate95thPercentile,
  calculate99thPercentile
} from './mathUtils';

// Re-export commonly used error functions
export {
  logError,
  logInfo,
  createError,
  ErrorType,
  ErrorSeverity,
  handleUnknownError,
  handleNetworkError,
  handleTimeoutError,
  handlePermissionError,
  handleValidationError,
  reportError,
  handleComponentError,
  withRetry,
  withTimeout,
  safeAsync,
  getUserFriendlyMessage,
  isRecoverableError,
  setupGlobalErrorHandling
} from './errorHandler';

// Re-export commonly used device detection functions
export {
  getDeviceInfo,
  getDeviceInfoAsync,
  getNetworkInfo,
  isMobileDevice,
  isTabletDevice,
  hasTouchSupport,
  isStandaloneMode,
  canInstallPWA,
  detectOS,
  detectBrowser,
  hasOrientationSupport,
  hasGeolocationSupport,
  getPerformanceInfo,
  getDeviceFingerprint,
  meetsMinimumRequirements,
  getDeviceModel,
  getArchitecture,
  getOrientation,
  hasCameraSupport,
  hasMicrophoneSupport,
  hasBluetoothSupport,
  hasWebGLSupport,
  hasWebRTCSupport,
  getStorageQuota,
  getLocalStorageSize,
  getBatteryInfo
} from './deviceDetection';

// Re-export enhanced network detection functions
export {
  getEnhancedNetworkInfo,
  getBasicNetworkInfo,
  getISPInfo,
  calculateNetworkQuality,
  checkConnectionStability,
  getConnectionTypeDisplayName,
  getEffectiveTypeDisplayName,
  monitorNetworkChanges
} from './networkDetection';
export type { NetworkConnectionInfo, ISPInfo } from './networkDetection';

// Re-export commonly used formatter functions
export {
  formatSpeed,
  formatLatency,
  formatFileSize,
  formatDuration,
  formatPercentage,
  formatRelativeTime,
  formatJitter,
  formatPacketLoss,
  formatTimestamp,
  formatNumber,
  getLatencyQuality,
  getDownloadSpeedQuality,
  getUploadSpeedQuality,
  getJitterQuality,
  getPacketLossQuality,
  getOverallQuality,
  getQualityDescription,
  getQualityColor
} from './formatters';

// Re-export WebRTC functions
export {
  createPeerConnection,
  setupDataChannel,
  isWebRTCSupported,
  getWebRTCCapabilities
} from './webrtcUtils';
