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
  const { state, setConnectionStatus, setBackendConnection } = useAppContext();
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [networkInfo, setNetworkInfo] = useState<NetworkConnectionInfo | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Enhanced network connectivity check with detailed information
   */
  const checkConnection = useCallback(async (): Promise<void> => {
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

      // Check basic network availability
      if (!navigator.onLine) {
        setConnectionStatus('disconnected');
        setBackendConnection(false);
        setLastChecked(Date.now());
        return;
      }

      // Test actual connectivity with a simple request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(window.location.origin, {
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
            setConnectionStatus('connected');
          } else if (simpleNetworkInfo.quality === 'fair') {
            setConnectionStatus('slow');
          } else {
            setConnectionStatus('limited');
          }
          setBackendConnection(true);
        } else {
          setConnectionStatus('limited');
          setBackendConnection(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          setConnectionStatus('slow');
          setBackendConnection(false);
        } else {
          setConnectionStatus('disconnected');
          setBackendConnection(false);
        }
      }

      setLastChecked(Date.now());
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
      setBackendConnection(false);
      setLastChecked(Date.now());
    }
  }, [setConnectionStatus, setBackendConnection]);

  /**
   * Start monitoring connection status with real-time updates
   */
  const startMonitoring = useCallback(() => {
    // Initial check
    checkConnection();

    // Set up periodic checks every 30 seconds
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      checkConnection();
    }, 30000);

    // Set up simplified network change monitoring (removed to prevent infinite loops)
    // Network monitoring is now handled by the periodic checks only
  }, [checkConnection]);

  /**
   * Stop periodic connection monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setConnectionStatus('disconnected');
      setBackendConnection(false);
      setLastChecked(Date.now());
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start monitoring on mount
    startMonitoring();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopMonitoring();
    };
  }, [checkConnection, setConnectionStatus, setBackendConnection, startMonitoring, stopMonitoring]);

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
