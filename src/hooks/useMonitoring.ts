/**
 * Monitoring Hook
 * Custom hook for real-time network monitoring
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { MonitoringSession, MonitoringDataPoint, UseMonitoringReturn, QualityLevel } from '../types';
import { LatencyTestService } from '../services/LatencyTestService';
import { useAppContext } from '../context/AppContext';
import { round } from '../utils';

export const useMonitoring = (): UseMonitoringReturn => {
  const { state, setMonitoringStatus, setMonitoringSession } = useAppContext();
  const [error, setError] = useState<string | undefined>();
  const [currentData, setCurrentData] = useState<MonitoringDataPoint | undefined>();
  
  const latencyTestRef = useRef<LatencyTestService | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<MonitoringSession | null>(null);

  // Initialize latency test service
  useEffect(() => {
    if (!latencyTestRef.current) {
      latencyTestRef.current = new LatencyTestService({
        samples: 1, // Single ping for real-time monitoring
        timeout: 3000
      });
    }
  }, []);

  /**
   * Assess quality level based on latency
   */
  const assessQuality = useCallback((latency: number): QualityLevel => {
    if (latency <= 50) return 'excellent';
    if (latency <= 100) return 'good';
    if (latency <= 200) return 'fair';
    if (latency <= 500) return 'poor';
    return 'very-poor';
  }, []);

  /**
   * Generate monitoring data point
   */
  const generateDataPoint = useCallback(async (): Promise<MonitoringDataPoint | null> => {
    if (!latencyTestRef.current) {
      return null;
    }

    try {
      const latency = await latencyTestRef.current.getCurrentLatency();
      
      if (latency === null) {
        return null;
      }

      // For real-time monitoring, we simulate speed values based on latency
      // In a real implementation, you might use different techniques
      const baseDownloadSpeed = Math.max(5, 100 - latency); // Rough correlation
      const baseUploadSpeed = baseDownloadSpeed * 0.6; // Upload typically slower
      
      // Add some realistic variation
      const downloadSpeed = baseDownloadSpeed + (Math.random() - 0.5) * 10;
      const uploadSpeed = baseUploadSpeed + (Math.random() - 0.5) * 5;
      
      // Calculate jitter (simplified for real-time)
      const jitter = Math.random() * 20;
      
      // Simulate packet loss (rare events)
      const packetLoss = Math.random() < 0.05 ? Math.random() * 2 : 0;

      const dataPoint: MonitoringDataPoint = {
        timestamp: Date.now(),
        latency: round(latency, 1),
        downloadSpeed: round(Math.max(1, downloadSpeed), 1),
        uploadSpeed: round(Math.max(0.5, uploadSpeed), 1),
        jitter: round(jitter, 1),
        packetLoss: round(packetLoss, 2),
        quality: assessQuality(latency)
      };

      return dataPoint;
    } catch (error) {
      console.error('Failed to generate monitoring data point:', error);
      return null;
    }
  }, [assessQuality]);

  /**
   * Update session statistics
   */
  const updateSessionStatistics = useCallback((session: MonitoringSession): void => {
    if (session.dataPoints.length === 0) {
      return;
    }

    const latencies = session.dataPoints.map(dp => dp.latency);
    const downloadSpeeds = session.dataPoints.map(dp => dp.downloadSpeed);
    const uploadSpeeds = session.dataPoints.map(dp => dp.uploadSpeed);
    const jitters = session.dataPoints.map(dp => dp.jitter);
    const packetLosses = session.dataPoints.map(dp => dp.packetLoss);

    session.statistics = {
      averageLatency: round(latencies.reduce((a, b) => a + b, 0) / latencies.length, 1),
      averageDownload: round(downloadSpeeds.reduce((a, b) => a + b, 0) / downloadSpeeds.length, 1),
      averageUpload: round(uploadSpeeds.reduce((a, b) => a + b, 0) / uploadSpeeds.length, 1),
      averageJitter: round(jitters.reduce((a, b) => a + b, 0) / jitters.length, 1),
      averagePacketLoss: round(packetLosses.reduce((a, b) => a + b, 0) / packetLosses.length, 2),
      overallQuality: assessQuality(session.statistics.averageLatency)
    };
  }, [assessQuality]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(async (): Promise<void> => {
    console.log('🚀 Starting monitoring...', {
      currentStatus: state.monitoring.status,
      networkAvailable: state.connection.networkAvailable,
      timestamp: new Date().toISOString()
    });

    if (state.monitoring.status === 'running') {
      console.log('⚠️ Monitoring already running, skipping start');
      return;
    }

    try {
      setError(undefined);

      // Test network connectivity first
      console.log('🔍 Testing initial network connectivity...');
      const testDataPoint = await generateDataPoint();

      if (!testDataPoint) {
        throw new Error('Failed to establish network connection for monitoring');
      }

      console.log('✅ Initial network test successful:', testDataPoint);
      setMonitoringStatus('running');

      // Create new monitoring session
      const newSession: MonitoringSession = {
        id: `monitoring_${Date.now()}`,
        startTime: Date.now(),
        status: 'running',
        dataPoints: [testDataPoint], // Start with initial data point
        config: {
          interval: 2000, // 2 seconds
          maxDataPoints: 50
        },
        statistics: {
          averageLatency: testDataPoint.latency,
          averageDownload: testDataPoint.downloadSpeed,
          averageUpload: testDataPoint.uploadSpeed,
          averageJitter: testDataPoint.jitter,
          averagePacketLoss: testDataPoint.packetLoss,
          overallQuality: testDataPoint.quality
        }
      };

      sessionRef.current = newSession;
      setMonitoringSession(newSession);
      setCurrentData(testDataPoint);

      console.log('📊 Monitoring session created:', {
        sessionId: newSession.id,
        interval: newSession.config.interval,
        initialDataPoint: testDataPoint
      });

      // Start monitoring interval
      monitoringIntervalRef.current = setInterval(async () => {
        if (!sessionRef.current || sessionRef.current.status !== 'running') {
          console.log('⏹️ Monitoring interval stopped - session not running');
          return;
        }

        try {
          const dataPoint = await generateDataPoint();

          if (dataPoint) {
            // Add to session
            sessionRef.current.dataPoints.push(dataPoint);

            // Limit data points
            if (sessionRef.current.dataPoints.length > sessionRef.current.config.maxDataPoints) {
              sessionRef.current.dataPoints.shift();
            }

            // Update statistics
            updateSessionStatistics(sessionRef.current);

            // Update current data
            setCurrentData(dataPoint);

            // Update session in context
            setMonitoringSession({ ...sessionRef.current });

            console.log('📈 Data point collected:', {
              latency: dataPoint.latency,
              quality: dataPoint.quality,
              totalPoints: sessionRef.current.dataPoints.length
            });
          } else {
            console.warn('⚠️ Failed to generate data point, continuing monitoring...');
          }
        } catch (intervalError) {
          console.error('❌ Error in monitoring interval:', intervalError);
          // Don't stop monitoring for individual failures, just log them
        }
      }, newSession.config.interval);

      console.log('✅ Monitoring started successfully');

    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while starting monitoring';
      setError(errorMessage);
      setMonitoringStatus('stopped');

      // Clean up if there was an error
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }

      throw error;
    }
  }, [state.monitoring.status, state.connection.networkAvailable, setMonitoringStatus, setMonitoringSession, generateDataPoint, updateSessionStatistics]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback((): void => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (sessionRef.current) {
      sessionRef.current.status = 'stopped';
      sessionRef.current.endTime = Date.now();
      setMonitoringSession({ ...sessionRef.current });
    }

    setMonitoringStatus('stopped');
  }, [setMonitoringStatus, setMonitoringSession]);

  /**
   * Pause monitoring
   */
  const pauseMonitoring = useCallback((): void => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (sessionRef.current) {
      sessionRef.current.status = 'paused';
      setMonitoringSession({ ...sessionRef.current });
    }

    setMonitoringStatus('paused');
  }, [setMonitoringStatus, setMonitoringSession]);

  /**
   * Resume monitoring
   */
  const resumeMonitoring = useCallback((): void => {
    if (state.monitoring.status !== 'paused' || !sessionRef.current) {
      return;
    }

    sessionRef.current.status = 'running';
    setMonitoringStatus('running');
    setMonitoringSession({ ...sessionRef.current });

    // Restart monitoring interval
    monitoringIntervalRef.current = setInterval(async () => {
      if (!sessionRef.current || sessionRef.current.status !== 'running') {
        return;
      }

      const dataPoint = await generateDataPoint();
      
      if (dataPoint) {
        sessionRef.current.dataPoints.push(dataPoint);
        
        if (sessionRef.current.dataPoints.length > sessionRef.current.config.maxDataPoints) {
          sessionRef.current.dataPoints.shift();
        }

        updateSessionStatistics(sessionRef.current);
        setCurrentData(dataPoint);
        setMonitoringSession({ ...sessionRef.current });
      }
    }, sessionRef.current.config.interval);

  }, [state.monitoring.status, setMonitoringStatus, setMonitoringSession, generateDataPoint, updateSessionStatistics]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  return {
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    status: state.monitoring.status,
    session: state.monitoring.currentSession,
    currentData,
    error
  };
};
