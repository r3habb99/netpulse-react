/**
 * Network Test Hook
 * Custom hook for managing network testing functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { NetworkTestResult, TestStatus, TestProgress, UseNetworkTestReturn } from '../types';
import { NetworkTestService } from '../services/NetworkTestService';
import { useAppContext } from '../context/AppContext';

export const useNetworkTest = (): UseNetworkTestReturn => {
  const { setTestStatus, setTestProgress, setTestResult, addResult } = useAppContext();
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<NetworkTestResult | undefined>();
  
  const networkTestRef = useRef<NetworkTestService | null>(null);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [progress, setProgress] = useState<TestProgress>({
    phase: 'initializing',
    percentage: 0,
    currentTest: '',
    estimatedTimeRemaining: 0
  });

  // Initialize network test service
  useEffect(() => {
    if (!networkTestRef.current) {
      networkTestRef.current = new NetworkTestService();
    }
  }, []);

  /**
   * Start network test
   */
  const startTest = useCallback(async (): Promise<void> => {
    if (!networkTestRef.current) {
      throw new Error('Network test service not initialized');
    }

    if (status === 'running') {
      throw new Error('Test is already running');
    }

    try {
      setError(undefined);
      setStatus('running');
      setTestStatus('running');
      
      // Reset progress
      const initialProgress: TestProgress = {
        phase: 'initializing',
        percentage: 0,
        currentTest: 'Initializing test...',
        estimatedTimeRemaining: 30
      };
      setProgress(initialProgress);
      setTestProgress(initialProgress);

      await networkTestRef.current.startCompleteTest({}, {
        onTestStart: () => {
          const startProgress: TestProgress = {
            phase: 'latency',
            percentage: 0,
            currentTest: 'Testing latency...',
            estimatedTimeRemaining: 25
          };
          setProgress(startProgress);
          setTestProgress(startProgress);
        },

        onTestProgress: (progressData) => {
          // The NetworkTestService now provides properly formatted progress data
          let phase: TestProgress['phase'] = 'initializing';
          let currentTest = progressData.currentTest || '';
          let percentage = progressData.progress || 0;
          let estimatedTimeRemaining = progressData.estimatedTimeRemaining || 30;
          let currentSpeed: number | undefined;
          let currentLatency: number | undefined;

          // Map the progress type to our phase
          if (progressData.type === 'initializing') {
            phase = 'initializing';
          } else if (progressData.type === 'transition') {
            phase = 'initializing'; // Keep as initializing for UI consistency
          } else if (progressData.type === 'latency') {
            phase = 'latency';
            currentLatency = progressData.latency;
          } else if (progressData.type === 'download') {
            phase = 'download';
            currentSpeed = progressData.currentSpeed;
          } else if (progressData.type === 'upload') {
            phase = 'upload';
            currentSpeed = progressData.currentSpeed;
          }

          const newProgress: TestProgress = {
            phase,
            percentage: Math.min(percentage, 99),
            currentTest,
            estimatedTimeRemaining: Math.max(0, estimatedTimeRemaining),
            currentSpeed,
            currentLatency
          };

          setProgress(newProgress);
          setTestProgress(newProgress);
        },

        onTestComplete: (testResult) => {
          const completedProgress: TestProgress = {
            phase: 'completed',
            percentage: 100,
            currentTest: 'Test completed!',
            estimatedTimeRemaining: 0
          };
          
          setProgress(completedProgress);
          setTestProgress(completedProgress);
          setResult(testResult);
          setTestResult(testResult);
          addResult(testResult);
          setStatus('completed');
          setTestStatus('completed');
        },

        onTestError: (error) => {
          setError(error.message || 'Test failed');
          setStatus('error');
          setTestStatus('error');
        }
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start network test';
      setError(errorMessage);
      setStatus('error');
      setTestStatus('error');
      throw new Error(errorMessage);
    }
  }, [status, setTestStatus, setTestProgress, setTestResult, addResult]);

  /**
   * Stop network test
   */
  const stopTest = useCallback((): void => {
    if (networkTestRef.current) {
      networkTestRef.current.stop();
    }
    
    setStatus('idle');
    setTestStatus('idle');
    
    // Reset progress
    const resetProgress: TestProgress = {
      phase: 'initializing',
      percentage: 0,
      currentTest: '',
      estimatedTimeRemaining: 0
    };
    setProgress(resetProgress);
    setTestProgress(resetProgress);
  }, [setTestStatus, setTestProgress]);

  /**
   * Get test history
   */
  const getTestHistory = useCallback((): NetworkTestResult[] => {
    if (!networkTestRef.current) {
      return [];
    }
    return networkTestRef.current.getTestHistory();
  }, []);

  /**
   * Clear test history
   */
  const clearTestHistory = useCallback((): void => {
    if (networkTestRef.current) {
      networkTestRef.current.clearTestHistory();
    }
  }, []);

  /**
   * Check if test is running
   */
  const isTestRunning = useCallback((): boolean => {
    return status === 'running';
  }, [status]);

  return {
    startTest,
    stopTest,
    status,
    progress,
    result,
    error,
    getTestHistory,
    clearTestHistory,
    isTestRunning
  };
};
