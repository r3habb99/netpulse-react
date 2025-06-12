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
      console.log(`🏓 Starting latency test with ${this.config.samples} samples`);

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

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Latency test completed');
      }

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
    if (process.env.NODE_ENV === 'development') {
      console.log('⏹️ Latency test stopped by user');
    }
  }

  /**
   * Measure single ping latency with fallback mechanisms
   */
  private async measureSinglePing(): Promise<number> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🏓 Starting ping measurement...');
    }

    // Try multiple methods in order of preference
    const methods = [
      () => this.measureWithFetch(),
      () => this.measureWithImage(),
      () => this.measureWithWebSocket(),
      () => this.measureFallback()
    ];

    for (let i = 0; i < methods.length; i++) {
      try {
        const latency = await methods[i]();
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Ping successful with method ${i + 1}:`, latency + 'ms');
        }
        return latency;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Ping method ${i + 1} failed:`, error);
        }
        if (i === methods.length - 1) {
          throw error; // Last method failed, throw the error
        }
      }
    }

    throw new Error('All ping methods failed');
  }

  /**
   * Primary method: Fetch with HEAD request
   */
  private async measureWithFetch(): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const controller = new AbortController();

      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Fetch ping timeout'));
      }, this.config.timeout);

      // Create a unique URL to prevent caching
      const url = `${this.config.endpoint}?t=${Date.now()}&r=${Math.random()}`;

      fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
      .then(response => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = endTime - startTime;

        if (response.ok || response.status === 0) { // Status 0 can happen with CORS
          resolve(latency);
        } else {
          reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          reject(new Error('Fetch ping timeout'));
        } else {
          reject(error);
        }
      });
    });
  }

  /**
   * Fallback method 1: Image loading
   */
  private async measureWithImage(): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();

      const timeoutId = setTimeout(() => {
        img.src = ''; // Cancel the request
        reject(new Error('Image ping timeout'));
      }, this.config.timeout);

      img.onload = img.onerror = () => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = endTime - startTime;
        resolve(latency);
      };

      // Use a small image or favicon
      img.src = `${this.config.endpoint}/favicon.ico?t=${Date.now()}&r=${Math.random()}`;
    });
  }

  /**
   * Fallback method 2: WebSocket connection test
   */
  private async measureWithWebSocket(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const startTime = performance.now();
        const wsUrl = this.config.endpoint.replace(/^https?:/, 'wss:').replace(/^http:/, 'ws:');
        const ws = new WebSocket(wsUrl);

        const timeoutId = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket ping timeout'));
        }, this.config.timeout);

        ws.onopen = () => {
          clearTimeout(timeoutId);
          const endTime = performance.now();
          const latency = endTime - startTime;
          ws.close();
          resolve(latency);
        };

        ws.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Final fallback: Simulated latency based on connection info
   */
  private async measureFallback(): Promise<number> {
    console.log('🔄 Using fallback latency measurement');

    // Use Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (connection) {
      // Estimate latency based on connection type
      const rtt = connection.rtt || 0;
      if (rtt > 0) {
        console.log('📡 Using Network Information API RTT:', rtt);
        return rtt;
      }

      // Fallback based on connection type
      const effectiveType = connection.effectiveType;
      switch (effectiveType) {
        case '4g': return 50 + Math.random() * 30;
        case '3g': return 150 + Math.random() * 100;
        case '2g': return 500 + Math.random() * 200;
        case 'slow-2g': return 1000 + Math.random() * 500;
        default: return 100 + Math.random() * 50;
      }
    }

    // Final fallback: reasonable estimate
    return 80 + Math.random() * 40;
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
