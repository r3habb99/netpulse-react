/**
 * NetPulse Type Definitions
 * Centralized type definitions for the React application
 */

import { QualityLevel, TestStatus, MonitoringStatus, NetworkStatus } from '../utils';

// Re-export types from constants for convenience
export type { QualityLevel, TestStatus, MonitoringStatus, NetworkStatus };

// Network Test Results
export interface LatencyResult {
  timestamp: number;
  latency: number;
  success: boolean;
}

export interface SpeedTestResult {
  timestamp: number;
  downloadSpeed: number;
  uploadSpeed: number;
  duration: number;
  bytesTransferred: number;
}

export interface NetworkTestResult {
  id: string;
  timestamp: number;
  duration: number;
  
  // Latency metrics
  latency: {
    average: number;
    min: number;
    max: number;
    median: number;
    jitter: number;
    samples: LatencyResult[];
    packetLoss: number;
  };
  
  // Speed metrics
  speed: {
    download: number;
    upload: number;
    downloadSamples: number[];
    uploadSamples: number[];
  };
  
  // Quality assessment
  quality: {
    overall: QualityLevel;
    latency: QualityLevel;
    download: QualityLevel;
    upload: QualityLevel;
    jitter: QualityLevel;
    packetLoss: QualityLevel;
    score: number;
  };
  
  // Test configuration
  config: {
    latencySamples: number;
    speedDuration: number;
    simulationMode: boolean;
  };
}

// Real-time Monitoring Data
export interface MonitoringDataPoint {
  timestamp: number;
  latency: number;
  downloadSpeed: number;
  uploadSpeed: number;
  jitter: number;
  packetLoss: number;
  quality: QualityLevel;
}

export interface MonitoringSession {
  id: string;
  startTime: number;
  endTime?: number;
  status: MonitoringStatus;
  dataPoints: MonitoringDataPoint[];
  config: {
    interval: number;
    maxDataPoints: number;
  };
  statistics: {
    averageLatency: number;
    averageDownload: number;
    averageUpload: number;
    averageJitter: number;
    averagePacketLoss: number;
    overallQuality: QualityLevel;
  };
}

// UI State Types
export interface TestProgress {
  phase: 'initializing' | 'latency' | 'download' | 'upload' | 'completed';
  percentage: number;
  currentTest: string;
  estimatedTimeRemaining: number;
  // Real-time speed values for display during testing
  currentSpeed?: number;
  currentLatency?: number;
}

export interface ConnectionState {
  status: NetworkStatus;
  lastChecked: number;
  backendConnected: boolean;
  networkAvailable: boolean;
}

// Application State
export interface AppState {
  // Current view
  currentView: 'home' | 'test' | 'dashboard' | 'results';
  
  // Connection state
  connection: ConnectionState;
  
  // Test state
  test: {
    status: TestStatus;
    progress: TestProgress;
    currentResult?: NetworkTestResult;
    isRunning: boolean;
    autoStart: boolean;
  };
  
  // Monitoring state
  monitoring: {
    status: MonitoringStatus;
    currentSession?: MonitoringSession;
    isActive: boolean;
  };
  
  // Results history
  results: NetworkTestResult[];
  
  // UI state
  ui: {
    loading: boolean;
    error?: string;
    showPullRefresh: boolean;
    fabVisible: boolean;
  };
  
  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
    autoStart: boolean;
    notifications: boolean;
  };
}

// Component Props Types
export interface HeaderProps {
  title: string;
  connectionStatus: NetworkStatus;
  onRefresh?: () => void;
}

export interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  hasNewResults: boolean;
}

export interface TestControlsProps {
  status: TestStatus;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export interface ProgressIndicatorProps {
  progress: TestProgress;
  visible: boolean;
}

export interface MetricsDisplayProps {
  latency: number;
  downloadSpeed: number;
  uploadSpeed: number;
  jitter: number;
  packetLoss?: number;
  realTime?: boolean;
}

export interface ResultsDisplayProps {
  result: NetworkTestResult;
  onTestAgain: () => void;
  onShare: () => void;
}

export interface DashboardProps {
  session?: MonitoringSession;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface ChartConfig {
  maxDataPoints: number;
  updateInterval: number;
  showGrid: boolean;
  showLabels: boolean;
  colors: {
    line: string;
    fill: string;
    grid: string;
  };
}

// Hook Return Types
export interface UseNetworkTestReturn {
  startTest: () => Promise<void>;
  stopTest: () => void;
  status: TestStatus;
  progress: TestProgress;
  result?: NetworkTestResult;
  error?: string;
  getTestHistory: () => NetworkTestResult[];
  clearTestHistory: () => void;
  isTestRunning: () => boolean;
}

export interface NetworkInfoDisplay {
  connectionType: string;
  effectiveType: string;
  isp: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
  downlink: number;
  rtt: number;
}

export interface UseMonitoringReturn {
  startMonitoring: () => void;
  stopMonitoring: () => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
  status: MonitoringStatus;
  session?: MonitoringSession;
  currentData?: MonitoringDataPoint;
  error?: string;
}

export interface UseConnectionReturn {
  status: NetworkStatus;
  isOnline: boolean;
  backendConnected: boolean;
  checkConnection: () => Promise<void>;
  lastChecked: number;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getConnectionDescription: (status: NetworkStatus) => string;
  isConnectionStable: () => boolean;
  networkInfo: NetworkInfoDisplay | null;
}

// Service Types
export interface NetworkTestService {
  runLatencyTest: (samples: number) => Promise<LatencyResult[]>;
  runSpeedTest: (duration: number) => Promise<SpeedTestResult>;
  runCompleteTest: () => Promise<NetworkTestResult>;
}

export interface MonitoringService {
  start: (config: { interval: number }) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getCurrentData: () => MonitoringDataPoint | null;
  getSession: () => MonitoringSession | null;
}

// Storage Types
export interface StorageService {
  saveResult: (result: NetworkTestResult) => Promise<void>;
  getResults: () => Promise<NetworkTestResult[]>;
  clearResults: () => Promise<void>;
  savePreferences: (preferences: any) => Promise<void>;
  getPreferences: () => Promise<any>;
}

// Event Types
export interface TestEvent {
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel';
  data?: any;
  timestamp: number;
}

export interface MonitoringEvent {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'data' | 'error';
  data?: any;
  timestamp: number;
}

// Configuration Types
export interface TestConfiguration {
  latency: {
    samples: number;
    timeout: number;
    concurrent: number;
  };
  speed: {
    duration: number;
    warmupDuration: number;
    chunkSize: number;
    concurrent: number;
  };
  files: string[];
}

export interface MonitoringConfiguration {
  interval: number;
  maxDataPoints: number;
  alertThresholds: {
    latency: number;
    packetLoss: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    [key: string]: 'up' | 'down';
  };
}

// PWA Types
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAUpdateAvailable {
  waiting: ServiceWorker;
  skipWaiting: () => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
