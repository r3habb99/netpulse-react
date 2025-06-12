/**
 * Connection Hook
 * Custom hook for managing network connection status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { NetworkStatus, UseConnectionReturn } from '../types';
import { useAppContext } from '../context/AppContext';
import {
  getBasicNetworkInfo,
  calculateNetworkQuality,
  NetworkConnectionInfo,
  getConnectionTypeDisplayName,
  getEffectiveTypeDisplayName
} from '../utils/networkDetection';

export const useConnection = (): UseConnectionReturn => {
  const { state, setConnectionStatus, setBackendConnection, setNetworkAvailable } = useAppContext();
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [networkInfo, setNetworkInfo] = useState<NetworkConnectionInfo | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringRef = useRef<boolean>(false);
  const lastCheckTimeRef = useRef<number>(0);

  // Store stable references to context functions to prevent infinite loops
  const setConnectionStatusRef = useRef(setConnectionStatus);
  const setBackendConnectionRef = useRef(setBackendConnection);
  const setNetworkAvailableRef = useRef(setNetworkAvailable);

  // Update refs when context functions change
  useEffect(() => {
    setConnectionStatusRef.current = setConnectionStatus;
    setBackendConnectionRef.current = setBackendConnection;
    setNetworkAvailableRef.current = setNetworkAvailable;
  }, [setConnectionStatus, setBackendConnection, setNetworkAvailable]);

  /**
   * Get the correct URL for connectivity testing
   * Handles GitHub Pages subdirectory deployment correctly
   */
  const getConnectivityTestUrl = useCallback((): string => {
    // For GitHub Pages, use the current page URL instead of origin
    // This ensures we test the actual app URL, not just the domain
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
  }, []);

  /**
   * Enhanced network connectivity check with detailed information
   */
  const checkConnection = useCallback(async (): Promise<void> => {
    // Throttle rapid successive calls (prevent more than once per 10 seconds for production)
    const now = Date.now();
    const throttleDelay = window.location.hostname.includes('github.io') ? 10000 : 5000;

    if (now - lastCheckTimeRef.current < throttleDelay) {
      return;
    }
    lastCheckTimeRef.current = now;

    console.log('🔍 Starting connection check...', {
      hostname: window.location.hostname,
      navigatorOnline: navigator.onLine,
      timestamp: new Date().toISOString()
    });

    try {
      // Get basic network information (simplified to avoid API calls)
      const basicInfo = getBasicNetworkInfo();
      const simpleNetworkInfo = {
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
        isStable: true
      };
      setNetworkInfo(simpleNetworkInfo);

      console.log('📊 Network info:', simpleNetworkInfo);

      // Update network availability flag
      setNetworkAvailableRef.current(navigator.onLine);

      // Check basic network availability
      if (!navigator.onLine) {
        console.log('❌ Navigator reports offline');
        setConnectionStatusRef.current('disconnected');
        setBackendConnectionRef.current(false);
        setLastChecked(Date.now());
        return;
      }

      // For GitHub Pages, rely more on navigator.onLine and skip fetch requests
      // to prevent infinite requests due to GitHub Pages routing issues
      const isGitHubPages = window.location.hostname.includes('github.io');

      if (isGitHubPages) {
        // For GitHub Pages, use a simpler approach
        if (navigator.onLine) {
          if (simpleNetworkInfo.quality === 'excellent' || simpleNetworkInfo.quality === 'good') {
            setConnectionStatusRef.current('connected');
          } else if (simpleNetworkInfo.quality === 'fair') {
            setConnectionStatusRef.current('slow');
          } else {
            setConnectionStatusRef.current('limited');
          }
          setBackendConnectionRef.current(true);
          setNetworkAvailableRef.current(true);
        } else {
          setConnectionStatusRef.current('disconnected');
          setBackendConnectionRef.current(false);
          setNetworkAvailableRef.current(false);
        }
        setLastChecked(Date.now());
        console.log('✅ GitHub Pages connection check completed:', {
          status: navigator.onLine ? 'connected' : 'disconnected',
          quality: simpleNetworkInfo.quality
        });
        return;
      }

      // For non-GitHub Pages deployments, perform actual connectivity test
      const testUrl = getConnectivityTestUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(testUrl, {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // Use quality assessment if available
          if (simpleNetworkInfo.quality === 'excellent' || simpleNetworkInfo.quality === 'good') {
            setConnectionStatusRef.current('connected');
          } else if (simpleNetworkInfo.quality === 'fair') {
            setConnectionStatusRef.current('slow');
          } else {
            setConnectionStatusRef.current('limited');
          }
          setBackendConnectionRef.current(true);
          setNetworkAvailableRef.current(true);
          console.log('✅ Fetch connection test successful');
        } else {
          setConnectionStatusRef.current('limited');
          setBackendConnectionRef.current(false);
          setNetworkAvailableRef.current(true); // Still online, just limited
          console.log('⚠️ Fetch connection test returned non-OK status:', response.status);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.log('❌ Fetch connection test failed:', error);

        if (error instanceof Error && error.name === 'AbortError') {
          setConnectionStatusRef.current('slow');
          setBackendConnectionRef.current(false);
          setNetworkAvailableRef.current(true); // Timeout suggests network is available but slow
        } else {
          setConnectionStatusRef.current('disconnected');
          setBackendConnectionRef.current(false);
          setNetworkAvailableRef.current(false);
        }
      }

      setLastChecked(Date.now());
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatusRef.current('disconnected');
      setBackendConnectionRef.current(false);
      setLastChecked(Date.now());
    }
  }, [getConnectivityTestUrl]); // Add getConnectivityTestUrl as dependency

  /**
   * Start monitoring connection status with real-time updates
   */
  const startMonitoring = useCallback(() => {
    // Prevent multiple monitoring instances
    if (isMonitoringRef.current) {
      return;
    }

    isMonitoringRef.current = true;

    // Initial check
    checkConnection();

    // Set up periodic checks - longer interval for GitHub Pages to prevent rate limiting
    const isGitHubPages = window.location.hostname.includes('github.io');
    const checkInterval = isGitHubPages ? 60000 : 30000; // 60 seconds for GitHub Pages, 30 for others

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      checkConnection();
    }, checkInterval);

    // Set up simplified network change monitoring (removed to prevent infinite loops)
    // Network monitoring is now handled by the periodic checks only
  }, [checkConnection]);

  /**
   * Stop periodic connection monitoring
   */
  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false;
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // Store refs to functions to avoid dependency issues
  const startMonitoringRef = useRef(startMonitoring);
  const stopMonitoringRef = useRef(stopMonitoring);
  const checkConnectionRef = useRef(checkConnection);

  // Update refs when functions change
  useEffect(() => {
    startMonitoringRef.current = startMonitoring;
    stopMonitoringRef.current = stopMonitoring;
    checkConnectionRef.current = checkConnection;
  }, [startMonitoring, stopMonitoring, checkConnection]);

  /**
   * Handle online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      checkConnectionRef.current();
    };

    const handleOffline = () => {
      setConnectionStatusRef.current('disconnected');
      setBackendConnectionRef.current(false);
      setNetworkAvailableRef.current(false);
      setLastChecked(Date.now());
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start monitoring on mount - only run once
    if (!isMonitoringRef.current) {
      startMonitoringRef.current();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopMonitoringRef.current();
    };
  }, []); // Empty dependency array to run only once on mount

  /**
   * Force connection check
   */
  const forceCheck = useCallback(async (): Promise<void> => {
    await checkConnection();
  }, [checkConnection]);

  /**
   * Get connection quality description
   */
  const getConnectionDescription = useCallback((status: NetworkStatus): string => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'limited':
        return 'Limited connectivity';
      case 'slow':
        return 'Slow connection';
      default:
        return 'Unknown';
    }
  }, []);

  /**
   * Check if connection is stable
   */
  const isConnectionStable = useCallback((): boolean => {
    return state.connection.status === 'connected' && 
           state.connection.backendConnected &&
           (Date.now() - lastChecked) < 60000; // Checked within last minute
  }, [state.connection.status, state.connection.backendConnected, lastChecked]);

  /**
   * Get network information display
   */
  const getNetworkInfoDisplay = useCallback(() => {
    if (!networkInfo) return null;

    return {
      connectionType: getConnectionTypeDisplayName(networkInfo.type),
      effectiveType: getEffectiveTypeDisplayName(networkInfo.effectiveType),
      isp: networkInfo.isp || 'Unknown ISP',
      quality: networkInfo.quality,
      downlink: networkInfo.downlink,
      rtt: networkInfo.rtt
    };
  }, [networkInfo]);

  return {
    status: state.connection.status,
    isOnline: state.connection.networkAvailable,
    backendConnected: state.connection.backendConnected,
    checkConnection: forceCheck,
    lastChecked,
    startMonitoring,
    stopMonitoring,
    getConnectionDescription,
    isConnectionStable,
    networkInfo: getNetworkInfoDisplay()
  };
};
