/**
 * Enhanced Network Detection Utilities
 * Advanced network information detection and ISP identification
 */

export interface NetworkConnectionInfo {
  // Connection type
  type: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'unknown';
  
  // Network performance
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  
  // ISP/Operator information
  isp?: string;
  organization?: string;
  country?: string;
  region?: string;
  city?: string;
  
  // Connection quality
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
  isOnline: boolean;
  isStable: boolean;
}

export interface ISPInfo {
  isp: string;
  organization: string;
  country: string;
  region: string;
  city: string;
  ip: string;
  timezone: string;
}

/**
 * Get enhanced network connection information (without external API calls)
 */
export const getEnhancedNetworkInfo = async (): Promise<NetworkConnectionInfo> => {
  const basicInfo = getBasicNetworkInfo();

  return {
    type: basicInfo.type || 'unknown',
    effectiveType: basicInfo.effectiveType || 'unknown',
    downlink: basicInfo.downlink || 0,
    rtt: basicInfo.rtt || 0,
    saveData: basicInfo.saveData || false,
    isp: 'Unknown ISP', // Removed external API call
    organization: 'Unknown',
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    quality: calculateNetworkQuality(basicInfo),
    isOnline: navigator.onLine,
    isStable: await checkConnectionStability()
  };
};

/**
 * Get basic network information from Navigator API
 */
export const getBasicNetworkInfo = (): Partial<NetworkConnectionInfo> => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (!connection) {
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false
    };
  }
  
  // Map connection types to our standardized types
  const typeMapping: Record<string, NetworkConnectionInfo['type']> = {
    'wifi': 'wifi',
    'cellular': 'cellular',
    'ethernet': 'ethernet',
    'bluetooth': 'bluetooth',
    'wimax': 'wifi',
    'other': 'unknown',
    'none': 'unknown',
    'unknown': 'unknown'
  };
  
  const effectiveTypeMapping: Record<string, NetworkConnectionInfo['effectiveType']> = {
    'slow-2g': '2g',
    '2g': '2g',
    '3g': '3g',
    '4g': '4g',
    '5g': '5g'
  };
  
  return {
    type: typeMapping[connection.type] || 'unknown',
    effectiveType: effectiveTypeMapping[connection.effectiveType] || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false
  };
};

/**
 * Get ISP information (simplified - no external API calls)
 */
export const getISPInfo = async (): Promise<Partial<ISPInfo>> => {
  // Return default values to avoid external API calls that cause rate limiting
  return {
    isp: 'Unknown ISP',
    organization: 'Unknown',
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    ip: 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
  };
};

/**
 * Calculate network quality based on connection metrics
 */
export const calculateNetworkQuality = (info: Partial<NetworkConnectionInfo>): NetworkConnectionInfo['quality'] => {
  const { downlink = 0, rtt = 0, effectiveType = 'unknown' } = info;
  
  // Quality scoring based on multiple factors
  let score = 0;
  
  // Downlink speed scoring (0-40 points)
  if (downlink >= 25) score += 40;
  else if (downlink >= 10) score += 30;
  else if (downlink >= 5) score += 20;
  else if (downlink >= 1) score += 10;
  
  // RTT scoring (0-30 points)
  if (rtt <= 50) score += 30;
  else if (rtt <= 100) score += 20;
  else if (rtt <= 200) score += 10;
  else if (rtt <= 500) score += 5;
  
  // Effective type scoring (0-30 points)
  switch (effectiveType) {
    case '5g': score += 30; break;
    case '4g': score += 25; break;
    case '3g': score += 15; break;
    case '2g': score += 5; break;
  }
  
  // Convert score to quality rating
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'poor';
  return 'very-poor';
};

/**
 * Get the correct URL for connectivity testing
 * Handles GitHub Pages subdirectory deployment correctly
 */
const getConnectivityTestUrl = (): string => {
  const isGitHubPages = window.location.hostname.includes('github.io');

  if (isGitHubPages) {
    // For GitHub Pages, use the base app URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      // Use the app's base URL (e.g., https://username.github.io/repo-name/)
      return `${window.location.origin}/${pathSegments[0]}/`;
    }
  }

  // For other deployments, use origin
  return window.location.origin;
};

/**
 * Check connection stability by performing multiple quick tests
 */
export const checkConnectionStability = async (): Promise<boolean> => {
  try {
    // For GitHub Pages, skip the fetch tests to prevent infinite requests
    // and rely on navigator.onLine instead
    const isGitHubPages = window.location.hostname.includes('github.io');

    if (isGitHubPages) {
      // For GitHub Pages, use a simpler approach
      return navigator.onLine;
    }

    const tests = [];
    const testUrl = getConnectivityTestUrl();

    // Perform 3 quick connectivity tests
    for (let i = 0; i < 3; i++) {
      tests.push(
        fetch(testUrl, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(2000)
        }).then(response => response.ok).catch(() => false)
      );
    }

    const results = await Promise.all(tests);
    const successCount = results.filter(Boolean).length;

    // Consider stable if at least 2 out of 3 tests succeed
    return successCount >= 2;
  } catch (error) {
    return false;
  }
};

/**
 * Get connection type display name
 */
export const getConnectionTypeDisplayName = (type: NetworkConnectionInfo['type']): string => {
  const displayNames: Record<NetworkConnectionInfo['type'], string> = {
    'wifi': 'Wi-Fi',
    'cellular': 'Mobile Data',
    'ethernet': 'Ethernet',
    'bluetooth': 'Bluetooth',
    'unknown': 'Unknown'
  };
  
  return displayNames[type] || 'Unknown';
};

/**
 * Get effective type display name
 */
export const getEffectiveTypeDisplayName = (effectiveType: NetworkConnectionInfo['effectiveType']): string => {
  const displayNames: Record<NetworkConnectionInfo['effectiveType'], string> = {
    '2g': '2G',
    '3g': '3G',
    '4g': '4G/LTE',
    '5g': '5G',
    'unknown': 'Unknown'
  };
  
  return displayNames[effectiveType] || 'Unknown';
};

/**
 * Monitor network changes and call callback when connection changes (simplified)
 */
export const monitorNetworkChanges = (callback: (info: NetworkConnectionInfo) => void): (() => void) => {
  let lastCallTime = 0;
  const THROTTLE_DELAY = 2000; // Throttle to max once every 2 seconds

  const handleNetworkChange = () => {
    const now = Date.now();
    if (now - lastCallTime < THROTTLE_DELAY) {
      return; // Throttle rapid calls
    }
    lastCallTime = now;

    // Use basic info only to avoid async calls
    const basicInfo = getBasicNetworkInfo();
    const info: NetworkConnectionInfo = {
      type: basicInfo.type || 'unknown',
      effectiveType: basicInfo.effectiveType || 'unknown',
      downlink: basicInfo.downlink || 0,
      rtt: basicInfo.rtt || 0,
      saveData: basicInfo.saveData || false,
      isp: 'Unknown ISP',
      organization: 'Unknown',
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      quality: calculateNetworkQuality(basicInfo),
      isOnline: navigator.onLine,
      isStable: true // Simplified
    };

    callback(info);
  };

  // Listen for online/offline events
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);

  // Listen for connection changes
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', handleNetworkChange);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);

    if (connection) {
      connection.removeEventListener('change', handleNetworkChange);
    }
  };
};
