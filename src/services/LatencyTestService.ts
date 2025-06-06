/**
 * Latency Testing Service
 * TypeScript/React version of the latency testing functionality
 */

import {
  CONSTANTS,
  calculateStatistics,
  round,
  logError,
  createError,
  ErrorType,
  ErrorSeverity,
  handleUnknownError
} from '../utils';

export interface LatencyTestConfig {
  samples?: number;
  timeout?: number;
  interval?: number;
  endpoint?: string;
}

export interface LatencyTestCallbacks {
  onProgress?: (progress: LatencyProgressData) => void;
  onComplete?: (results: LatencyTestResults) => void;
  onError?: (error: any) => void;
}

export interface LatencyProgressData {
  current: number;
  total: number;
  latency: number;
  jitter: number;
  progress: number;
}

export interface LatencyTestResults {
  samples: number;
  min: number;
  max: number;
  avg: number;
  median: number;
  jitter: number;
  packetLoss: number;
  quality: {
    level: string;
    score: number;
    description: string;
  };
  rawData: number[];
}

export class LatencyTestService {
  private config: Required<LatencyTestConfig>;
  private isRunning: boolean = false;
  private results: number[] = [];
  private callbacks: LatencyTestCallbacks = {};

  constructor(config: LatencyTestConfig = {}) {
    // Enhanced configuration for more realistic and engaging latency testing
    this.config = {
      samples: config.samples || 15, // More samples for better accuracy and longer test
      timeout: config.timeout || CONSTANTS.NETWORK.LATENCY.TIMEOUT,
      interval: config.interval || 300, // Longer interval between samples (300ms)
      endpoint: config.endpoint || window.location.origin
    };
  }

  /**
   * Start latency test
   */
  async start(callbacks: LatencyTestCallbacks = {}): Promise<LatencyTestResults> {
    if (this.isRunning) {
      throw new Error('Latency test is already running');
    }

    this.callbacks = callbacks;
    this.isRunning = true;
    this.results = [];

    try {
      logError(createError(ErrorType.UNKNOWN, `Starting latency test with ${this.config.samples} samples`, ErrorSeverity.LOW));

      for (let i = 0; i < this.config.samples; i++) {
        if (!this.isRunning) {
          break; // Test was stopped
        }

        try {
          const latency = await this.measureSinglePing();
          this.results.push(latency);

          // Report progress
          if (this.callbacks.onProgress) {
            let currentJitter = 0;
            if (this.results.length >= 2) {
              const stats = calculateStatistics(this.results);
              currentJitter = stats.jitter;
            }

            this.callbacks.onProgress({
              current: i + 1,
              total: this.config.samples,
              latency: latency,
              jitter: currentJitter,
              progress: ((i + 1) / this.config.samples) * 100
            });
          }

          // Wait between samples (except for last sample)
          if (i < this.config.samples - 1) {
            await this.delay(this.config.interval);
          }
        } catch (error) {
          logError(createError(ErrorType.NETWORK, `Ping sample ${i + 1} failed`, ErrorSeverity.LOW));
          // Continue with next sample
        }
      }

      const statistics = this.calculateStatistics();
      
      logError(createError(ErrorType.UNKNOWN, 'Latency test completed', ErrorSeverity.LOW));

      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(statistics);
      }

      return statistics;

    } catch (error) {
      const errorInfo = handleUnknownError(error, 'LatencyTestService');

      if (this.callbacks.onError) {
        this.callbacks.onError(errorInfo);
      }

      throw errorInfo;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the latency test
   */
  stop(): void {
    this.isRunning = false;
    logError(createError(ErrorType.UNKNOWN, 'Latency test stopped by user', ErrorSeverity.LOW));
  }

  /**
   * Measure single ping latency
   */
  private async measureSinglePing(): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const controller = new AbortController();
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Ping timeout'));
      }, this.config.timeout);

      // Create a unique URL to prevent caching
      const url = `${this.config.endpoint}?t=${Date.now()}&r=${Math.random()}`;

      fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      .then(response => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        if (response.ok) {
          resolve(latency);
        } else {
          reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          reject(new Error('Ping timeout'));
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Calculate statistics from ping results
   */
  private calculateStatistics(): LatencyTestResults {
    if (this.results.length === 0) {
      return {
        samples: 0,
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        jitter: 0,
        packetLoss: 100,
        quality: this.assessConnectionQuality(0),
        rawData: []
      };
    }

    const stats = calculateStatistics(this.results);
    const packetLoss = ((this.config.samples - this.results.length) / this.config.samples) * 100;
    const quality = this.assessConnectionQuality(stats.mean);

    return {
      samples: this.results.length,
      min: round(stats.min, 1),
      max: round(stats.max, 1),
      avg: round(stats.mean, 1),
      median: round(stats.median, 1),
      jitter: round(stats.jitter, 1),
      packetLoss: round(packetLoss, 1),
      quality: quality,
      rawData: this.results
    };
  }

  /**
   * Assess connection quality based on latency
   */
  private assessConnectionQuality(latency: number): { level: string; score: number; description: string } {
    if (latency <= CONSTANTS.QUALITY_THRESHOLDS.LATENCY.EXCELLENT) {
      return { level: 'excellent', score: 5, description: 'Excellent connection' };
    } else if (latency <= CONSTANTS.QUALITY_THRESHOLDS.LATENCY.GOOD) {
      return { level: 'good', score: 4, description: 'Good connection' };
    } else if (latency <= CONSTANTS.QUALITY_THRESHOLDS.LATENCY.FAIR) {
      return { level: 'fair', score: 3, description: 'Fair connection' };
    } else if (latency <= CONSTANTS.QUALITY_THRESHOLDS.LATENCY.POOR) {
      return { level: 'poor', score: 2, description: 'Poor connection' };
    } else {
      return { level: 'very-poor', score: 1, description: 'Very poor connection' };
    }
  }

  /**
   * Get current latency (single ping)
   */
  async getCurrentLatency(): Promise<number | null> {
    try {
      return await this.measureSinglePing();
    } catch (error) {
      logError(createError(ErrorType.NETWORK, 'Failed to get current latency', ErrorSeverity.LOW));
      return null;
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if test is currently running
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get test configuration
   */
  getConfig(): Required<LatencyTestConfig> {
    return { ...this.config };
  }

  /**
   * Update test configuration
   */
  updateConfig(newConfig: Partial<LatencyTestConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
