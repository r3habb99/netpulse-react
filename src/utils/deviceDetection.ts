/**
 * NetPulse Device Detection Utilities
 * Functions for detecting device capabilities, browser info, and network conditions
 */

export interface DeviceInfo {
  // Device type
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceModel: string;

  // Operating system
  os: string;
  osVersion: string;
  architecture: string;

  // Browser information
  browser: string;
  browserVersion: string;
  userAgent: string;

  // Screen information
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  colorDepth: number;
  orientation: string;

  // Network capabilities
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;

  // Device capabilities
  touchSupport: boolean;
  orientationSupport: boolean;
  geolocationSupport: boolean;
  cameraSupport: boolean;
  microphoneSupport: boolean;
  bluetoothSupport: boolean;

  // Performance information
  hardwareConcurrency: number;
  memory: number;
  storageQuota: number;

  // PWA capabilities
  isStandalone: boolean;
  canInstall: boolean;

  // Security & Privacy
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  language: string;
  languages: string[];
  timezone: string;

  // Battery information (if available)
  batteryLevel?: number;
  batteryCharging?: boolean;

  // Additional features
  webGLSupport: boolean;
  webRTCSupport: boolean;
  localStorageSize: number;
}

/**
 * Detect if device is mobile
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
         /Mobi|Android/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

/**
 * Detect if device is tablet
 */
export const isTabletDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (userAgent.includes('ipad') || 
          (userAgent.includes('android') && !userAgent.includes('mobile'))) &&
         window.innerWidth > 768 && window.innerWidth <= 1024;
};

/**
 * Detect operating system
 */
export const detectOS = (): { os: string; version: string } => {
  const userAgent = navigator.userAgent;
  
  // iOS
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    const version = match ? `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}` : 'Unknown';
    return { os: 'iOS', version };
  }
  
  // Android
  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android (\d+(?:\.\d+)?)/);
    const version = match ? match[1] : 'Unknown';
    return { os: 'Android', version };
  }
  
  // Windows
  if (/Windows/.test(userAgent)) {
    if (/Windows NT 10/.test(userAgent)) return { os: 'Windows', version: '10' };
    if (/Windows NT 6.3/.test(userAgent)) return { os: 'Windows', version: '8.1' };
    if (/Windows NT 6.2/.test(userAgent)) return { os: 'Windows', version: '8' };
    if (/Windows NT 6.1/.test(userAgent)) return { os: 'Windows', version: '7' };
    return { os: 'Windows', version: 'Unknown' };
  }
  
  // macOS
  if (/Mac OS X/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X (\d+)_(\d+)_?(\d+)?/);
    const version = match ? `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}` : 'Unknown';
    return { os: 'macOS', version };
  }
  
  // Linux
  if (/Linux/.test(userAgent)) {
    return { os: 'Linux', version: 'Unknown' };
  }
  
  return { os: 'Unknown', version: 'Unknown' };
};

/**
 * Detect browser information
 */
export const detectBrowser = (): { browser: string; version: string } => {
  const userAgent = navigator.userAgent;
  
  // Chrome
  if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) {
    const match = userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/);
    const version = match ? match[1] : 'Unknown';
    return { browser: 'Chrome', version };
  }
  
  // Firefox
  if (/Firefox/.test(userAgent)) {
    const match = userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/);
    const version = match ? match[1] : 'Unknown';
    return { browser: 'Firefox', version };
  }
  
  // Safari
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    const match = userAgent.match(/Version\/(\d+(?:\.\d+)?)/);
    const version = match ? match[1] : 'Unknown';
    return { browser: 'Safari', version };
  }
  
  // Edge
  if (/Edg/.test(userAgent)) {
    const match = userAgent.match(/Edg\/(\d+(?:\.\d+)?)/);
    const version = match ? match[1] : 'Unknown';
    return { browser: 'Edge', version };
  }
  
  return { browser: 'Unknown', version: 'Unknown' };
};

/**
 * Get network connection information
 */
export const getNetworkInfo = (): {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
} => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (connection) {
    return {
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    };
  }
  
  return {
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  };
};

/**
 * Check if device supports touch
 */
export const hasTouchSupport = (): boolean => {
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0;
};

/**
 * Check if device supports orientation changes
 */
export const hasOrientationSupport = (): boolean => {
  return 'orientation' in window || 'onorientationchange' in window;
};

/**
 * Check if geolocation is supported
 */
export const hasGeolocationSupport = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Check if app is running in standalone mode (PWA)
 */
export const isStandaloneMode = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

/**
 * Check if PWA can be installed
 */
export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};

/**
 * Detect device model/name
 */
export const getDeviceModel = (): string => {
  const userAgent = navigator.userAgent;

  // iPhone models
  if (/iPhone/.test(userAgent)) {
    if (/iPhone14/.test(userAgent)) return 'iPhone 14';
    if (/iPhone13/.test(userAgent)) return 'iPhone 13';
    if (/iPhone12/.test(userAgent)) return 'iPhone 12';
    if (/iPhone11/.test(userAgent)) return 'iPhone 11';
    if (/iPhoneX/.test(userAgent)) return 'iPhone X';
    return 'iPhone';
  }

  // iPad models
  if (/iPad/.test(userAgent)) {
    if (/iPad13/.test(userAgent)) return 'iPad Pro';
    if (/iPad11/.test(userAgent)) return 'iPad Air';
    return 'iPad';
  }

  // Android devices
  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/;\s*([^;)]+)\s*\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return 'Android Device';
  }

  return 'Unknown Device';
};

/**
 * Get system architecture
 */
export const getArchitecture = (): string => {
  const userAgent = navigator.userAgent;

  if (/WOW64|Win64|x64/.test(userAgent)) return 'x64';
  if (/arm64|aarch64/.test(userAgent)) return 'ARM64';
  if (/arm/.test(userAgent)) return 'ARM';
  if (/x86/.test(userAgent)) return 'x86';

  return 'Unknown';
};

/**
 * Get screen orientation
 */
export const getOrientation = (): string => {
  if (window.screen.orientation) {
    return window.screen.orientation.type;
  }

  const orientation = window.orientation;
  if (orientation === 0 || orientation === 180) return 'portrait';
  if (orientation === 90 || orientation === -90) return 'landscape';

  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

/**
 * Check camera support
 */
export const hasCameraSupport = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Check microphone support
 */
export const hasMicrophoneSupport = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Check Bluetooth support
 */
export const hasBluetoothSupport = (): boolean => {
  return 'bluetooth' in navigator;
};

/**
 * Check WebGL support
 */
export const hasWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
};

/**
 * Check WebRTC support
 */
export const hasWebRTCSupport = (): boolean => {
  return !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection);
};

/**
 * Get storage quota information
 */
export const getStorageQuota = async (): Promise<number> => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.quota || 0;
    }
  } catch (error) {
    console.warn('Storage quota not available:', error);
  }
  return 0;
};

/**
 * Get local storage size
 */
export const getLocalStorageSize = (): number => {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    return 0;
  }
};

/**
 * Get battery information
 */
export const getBatteryInfo = async (): Promise<{ level?: number; charging?: boolean }> => {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging
      };
    }
  } catch (error) {
    console.warn('Battery API not available:', error);
  }
  return {};
};

/**
 * Get device performance information
 */
export const getPerformanceInfo = (): { hardwareConcurrency: number; memory: number } => {
  return {
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    memory: (navigator as any).deviceMemory || 0
  };
};

/**
 * Get comprehensive device information (synchronous version)
 */
export const getDeviceInfo = (): Omit<DeviceInfo, 'storageQuota' | 'batteryLevel' | 'batteryCharging'> => {
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const { os, version: osVersion } = detectOS();
  const { browser, version: browserVersion } = detectBrowser();
  const networkInfo = getNetworkInfo();
  const performanceInfo = getPerformanceInfo();

  return {
    // Device type
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    deviceModel: getDeviceModel(),

    // Operating system
    os,
    osVersion,
    architecture: getArchitecture(),

    // Browser information
    browser,
    browserVersion,
    userAgent: navigator.userAgent,

    // Screen information
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth || 24,
    orientation: getOrientation(),

    // Network capabilities
    connectionType: networkInfo.connectionType,
    effectiveType: networkInfo.effectiveType,
    downlink: networkInfo.downlink,
    rtt: networkInfo.rtt,

    // Device capabilities
    touchSupport: hasTouchSupport(),
    orientationSupport: hasOrientationSupport(),
    geolocationSupport: hasGeolocationSupport(),
    cameraSupport: hasCameraSupport(),
    microphoneSupport: hasMicrophoneSupport(),
    bluetoothSupport: hasBluetoothSupport(),

    // Performance information
    hardwareConcurrency: performanceInfo.hardwareConcurrency,
    memory: performanceInfo.memory,

    // PWA capabilities
    isStandalone: isStandaloneMode(),
    canInstall: canInstallPWA(),

    // Security & Privacy
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Additional features
    webGLSupport: hasWebGLSupport(),
    webRTCSupport: hasWebRTCSupport(),
    localStorageSize: getLocalStorageSize()
  };
};

/**
 * Get comprehensive device information (async version with all features)
 */
export const getDeviceInfoAsync = async (): Promise<DeviceInfo> => {
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const { os, version: osVersion } = detectOS();
  const { browser, version: browserVersion } = detectBrowser();
  const networkInfo = getNetworkInfo();
  const performanceInfo = getPerformanceInfo();
  const batteryInfo = await getBatteryInfo();
  const storageQuota = await getStorageQuota();

  return {
    // Device type
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    deviceModel: getDeviceModel(),

    // Operating system
    os,
    osVersion,
    architecture: getArchitecture(),

    // Browser information
    browser,
    browserVersion,
    userAgent: navigator.userAgent,

    // Screen information
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth || 24,
    orientation: getOrientation(),

    // Network capabilities
    connectionType: networkInfo.connectionType,
    effectiveType: networkInfo.effectiveType,
    downlink: networkInfo.downlink,
    rtt: networkInfo.rtt,

    // Device capabilities
    touchSupport: hasTouchSupport(),
    orientationSupport: hasOrientationSupport(),
    geolocationSupport: hasGeolocationSupport(),
    cameraSupport: hasCameraSupport(),
    microphoneSupport: hasMicrophoneSupport(),
    bluetoothSupport: hasBluetoothSupport(),

    // Performance information
    hardwareConcurrency: performanceInfo.hardwareConcurrency,
    memory: performanceInfo.memory,
    storageQuota,

    // PWA capabilities
    isStandalone: isStandaloneMode(),
    canInstall: canInstallPWA(),

    // Security & Privacy
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Battery information
    batteryLevel: batteryInfo.level,
    batteryCharging: batteryInfo.charging,

    // Additional features
    webGLSupport: hasWebGLSupport(),
    webRTCSupport: hasWebRTCSupport(),
    localStorageSize: getLocalStorageSize()
  };
};

/**
 * Get device fingerprint for analytics
 */
export const getDeviceFingerprint = (): string => {
  const deviceInfo = getDeviceInfo();
  const fingerprint = [
    deviceInfo.os,
    deviceInfo.osVersion,
    deviceInfo.browser,
    deviceInfo.browserVersion,
    deviceInfo.screenWidth,
    deviceInfo.screenHeight,
    deviceInfo.pixelRatio,
    deviceInfo.hardwareConcurrency,
    deviceInfo.touchSupport ? 'touch' : 'no-touch'
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Check if device meets minimum requirements for NetPulse
 */
export const meetsMinimumRequirements = (): { meets: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for modern browser features
  if (!window.fetch) {
    issues.push('Fetch API not supported');
  }
  
  if (!window.Promise) {
    issues.push('Promises not supported');
  }
  
  if (!window.localStorage) {
    issues.push('Local Storage not supported');
  }
  
  if (!('serviceWorker' in navigator)) {
    issues.push('Service Workers not supported');
  }
  
  // Check for minimum screen size
  if (window.innerWidth < 320) {
    issues.push('Screen too small (minimum 320px width required)');
  }
  
  return {
    meets: issues.length === 0,
    issues
  };
};
