/**
 * Network Testing Service
 * Main controller for coordinating network tests and managing results
 */

import { NetworkTestResult, QualityLevel } from '../types';
import { LatencyTestService, LatencyTestResults } from './LatencyTestService';
import { SpeedTestService, SpeedTestResults } from './SpeedTestService';
import {
  getNetworkInfo,
  round,
  logError,
  createError,
  ErrorType,
  ErrorSeverity,
  handleUnknownError
} from '../utils';

export interface NetworkTestConfig {
  autoDetectConnection?: boolean;
  saveResults?: boolean;
  maxHistoryEntries?: number;
  latency?: any;
  speed?: any;
}

export interface NetworkTestCallbacks {
  onTestStart?: (data: { type: string }) => void;
  onTestProgress?: (progress: any) => void;
  onTestComplete?: (results: NetworkTestResult) => void;
  onTestError?: (error: any) => void;
}

export class NetworkTestService {
  private config: Required<NetworkTestConfig>;
  private latencyTest: LatencyTestService;
  private speedTest: SpeedTestService;
  private isRunning: boolean = false;
  private currentTest: string | null = null;
  private callbacks: NetworkTestCallbacks = {};
  private connectionInfo: any;

  constructor(config: NetworkTestConfig = {}) {
    this.config = {
      autoDetectConnection: config.autoDetectConnection !== false,
      saveResults: config.saveResults !== false,
      maxHistoryEntries: config.maxHistoryEntries || 50,
      latency: config.latency || {},
      speed: config.speed || {}
    };

    // Initialize test services
    this.latencyTest = new LatencyTestService(this.config.latency);
    this.speedTest = new SpeedTestService(this.config.speed);
    
    // Initialize connection detection
    this.connectionInfo = this.detectConnection();
  }

  /**
   * Start comprehensive network test with realistic timing and phases
   */
  async startCompleteTest(
    _options: any = {},
    callbacks: NetworkTestCallbacks = {}
  ): Promise<NetworkTestResult> {
    if (this.isRunning) {
      throw new Error('Network test is already running');
    }

    this.callbacks = callbacks;
    this.isRunning = true;
    this.currentTest = 'complete';

    try {
      logError(createError(ErrorType.UNKNOWN, 'Starting complete network test', ErrorSeverity.LOW));

      if (this.callbacks.onTestStart) {
        this.callbacks.onTestStart({ type: 'complete' });
      }

      // Phase 1: Initialization (2-3 seconds)
      await this.runInitializationPhase();

      if (!this.isRunning) {
        throw new Error('Test was stopped');
      }

      // Phase 2: Test latency (5-8 seconds)
      const latencyResult = await this.runLatencyTest();

      if (!this.isRunning) {
        throw new Error('Test was stopped');
      }

      // Phase 3: Transition delay (1 second)
      await this.runPhaseTransition('Preparing speed test...');

      // Phase 4: Test speed (15-20 seconds total)
      const speedResult = await this.runSpeedTest();

      // Phase 5: Final analysis and completion
      if (this.callbacks.onTestProgress) {
        this.callbacks.onTestProgress({
          type: 'completing',
          progress: 100,
          currentTest: 'Analyzing results...',
          estimatedTimeRemaining: 0
        });
      }

      // Step 3: Analyze connection
      const connectionAnalysis = this.analyzeConnection(latencyResult, speedResult);

      const completeResults: NetworkTestResult = {
        id: this.generateTestId(),
        timestamp: Date.now(),
        duration: 30, // Placeholder - would calculate actual duration
        
        latency: {
          average: latencyResult.avg,
          min: latencyResult.min,
          max: latencyResult.max,
          median: latencyResult.median,
          jitter: latencyResult.jitter,
          samples: latencyResult.rawData.map((value, index) => ({
            timestamp: Date.now() - (latencyResult.rawData.length - index) * 1000,
            latency: value,
            success: true
          })),
          packetLoss: latencyResult.packetLoss
        },
        
        speed: {
          download: speedResult.download.speed,
          upload: speedResult.upload.speed,
          downloadSamples: speedResult.download.speedHistory,
          uploadSamples: speedResult.upload.speedHistory
        },
        
        quality: {
          overall: connectionAnalysis.quality.level as QualityLevel,
          latency: latencyResult.quality.level as QualityLevel,
          download: this.assessSpeedQuality(speedResult.download.speed, 'download') as QualityLevel,
          upload: this.assessSpeedQuality(speedResult.upload.speed, 'upload') as QualityLevel,
          jitter: this.assessJitterQuality(latencyResult.jitter) as QualityLevel,
          packetLoss: this.assessPacketLossQuality(latencyResult.packetLoss) as QualityLevel,
          score: connectionAnalysis.quality.score
        },
        
        config: {
          latencySamples: this.latencyTest.getConfig().samples,
          speedDuration: this.speedTest.getConfig().downloadDuration / 1000,
          simulationMode: true // Indicates we're using simulation instead of real files
        }
      };

      // Save results
      if (this.config.saveResults) {
        this.saveTestResults(completeResults);
      }

      logError(createError(ErrorType.UNKNOWN, 'Complete network test finished', ErrorSeverity.LOW));

      if (this.callbacks.onTestComplete) {
        this.callbacks.onTestComplete(completeResults);
      }

      return completeResults;

    } catch (error) {
      const errorInfo = handleUnknownError(error, 'NetworkTestService');
      
      if (this.callbacks.onTestError) {
        this.callbacks.onTestError(errorInfo);
      }
      
      throw errorInfo;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  /**
   * Run initialization phase with realistic timing
   */
  private async runInitializationPhase(): Promise<void> {
    const phases = [
      { message: 'Initializing test environment...', duration: 800 },
      { message: 'Checking network connectivity...', duration: 1000 },
      { message: 'Optimizing test parameters...', duration: 700 },
      { message: 'Preparing test servers...', duration: 500 }
    ];

    for (let i = 0; i < phases.length; i++) {
      if (!this.isRunning) {
        throw new Error('Test was stopped');
      }

      const phase = phases[i];
      const progress = ((i + 1) / phases.length) * 10; // 10% of total progress

      if (this.callbacks.onTestProgress) {
        this.callbacks.onTestProgress({
          type: 'initializing',
          progress: progress,
          currentTest: phase.message,
          estimatedTimeRemaining: 30 - (progress / 100) * 30
        });
      }

      await this.delay(phase.duration);
    }
  }

  /**
   * Run phase transition with delay
   */
  private async runPhaseTransition(message: string, duration: number = 1000): Promise<void> {
    if (this.callbacks.onTestProgress) {
      this.callbacks.onTestProgress({
        type: 'transition',
        progress: 30, // Between latency and speed tests
        currentTest: message,
        estimatedTimeRemaining: 20
      });
    }

    await this.delay(duration);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run latency test with enhanced progress reporting
   */
  private async runLatencyTest(): Promise<LatencyTestResults> {
    this.currentTest = 'latency';

    return new Promise((resolve, reject) => {
      this.latencyTest.start({
        onProgress: (progress) => {
          if (this.callbacks.onTestProgress) {
            // Latency test takes 20% of total progress (10-30%)
            const baseProgress = 10; // After initialization
            const latencyProgress = baseProgress + (progress.progress * 0.2);

            this.callbacks.onTestProgress({
              type: 'latency',
              current: progress.current,
              total: progress.total,
              progress: latencyProgress,
              latency: progress.latency,
              currentTest: `Testing latency... (${progress.current}/${progress.total})`,
              estimatedTimeRemaining: 30 - (latencyProgress / 100) * 30
            });
          }
        },
        onComplete: (results) => {
          resolve(results);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Run speed test with enhanced progress reporting
   */
  private async runSpeedTest(): Promise<SpeedTestResults> {
    this.currentTest = 'speed';

    return new Promise((resolve, reject) => {
      this.speedTest.start({
        onProgress: (progress) => {
          if (this.callbacks.onTestProgress) {
            // Speed test takes 70% of total progress (30-100%)
            let baseProgress = 30; // After latency test
            let speedProgress = 0;
            let currentTest = '';

            if (progress.type === 'download') {
              // Download takes 40% of total (30-70%)
              speedProgress = baseProgress + (progress.progress * 0.4);
              currentTest = `Testing download speed... ${progress.speed.toFixed(1)} Mbps`;
            } else if (progress.type === 'upload') {
              // Upload takes 30% of total (70-100%)
              baseProgress = 70;
              speedProgress = baseProgress + (progress.progress * 0.3);
              currentTest = `Testing upload speed... ${progress.speed.toFixed(1)} Mbps`;
            }

            this.callbacks.onTestProgress({
              type: progress.type,
              progress: Math.min(speedProgress, 99),
              currentTest: currentTest,
              estimatedTimeRemaining: Math.max(0, 30 - (speedProgress / 100) * 30),
              currentSpeed: progress.speed,
              bytesTransferred: progress.bytesTransferred
            });
          }
        },
        onComplete: (results) => {
          resolve(results);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * Analyze connection quality and characteristics
   */
  private analyzeConnection(latencyResult: LatencyTestResults, speedResult: SpeedTestResults): any {
    const analysis = {
      type: this.connectionInfo.connectionType,
      effectiveType: this.connectionInfo.effectiveType,
      quality: this.determineOverallQuality(latencyResult, speedResult),
      characteristics: this.analyzeCharacteristics(latencyResult, speedResult),
      recommendations: this.generateRecommendations(latencyResult, speedResult)
    };

    return analysis;
  }

  /**
   * Determine overall connection quality
   */
  private determineOverallQuality(latencyResult: LatencyTestResults, speedResult: SpeedTestResults): any {
    const latencyScore = latencyResult.quality.score;
    const downloadSpeed = speedResult.download.speed;
    const uploadSpeed = speedResult.upload.speed;

    // Calculate speed scores (simplified scoring)
    const downloadScore = Math.min(5, Math.floor(downloadSpeed / 10) + 1);
    const uploadScore = Math.min(5, Math.floor(uploadSpeed / 5) + 1);

    // Weighted average (latency 40%, download 40%, upload 20%)
    const overallScore = Math.round(
      (latencyScore * 0.4) + (downloadScore * 0.4) + (uploadScore * 0.2)
    );

    const qualityLevels: Record<number, { level: string; description: string }> = {
      5: { level: 'excellent', description: 'Excellent connection quality' },
      4: { level: 'good', description: 'Good connection quality' },
      3: { level: 'fair', description: 'Fair connection quality' },
      2: { level: 'poor', description: 'Poor connection quality' },
      1: { level: 'very-poor', description: 'Very poor connection quality' }
    };

    return {
      score: overallScore,
      ...qualityLevels[overallScore],
      components: {
        latency: latencyScore,
        download: downloadScore,
        upload: uploadScore
      }
    };
  }

  /**
   * Analyze connection characteristics
   */
  private analyzeCharacteristics(latencyResult: LatencyTestResults, speedResult: SpeedTestResults): any {
    return {
      latency: {
        avg: latencyResult.avg,
        stability: latencyResult.jitter < 10 ? 'stable' : 'unstable',
        packetLoss: latencyResult.packetLoss
      },
      speed: {
        download: speedResult.download.speed,
        upload: speedResult.upload.speed,
        ratio: round(speedResult.download.speed / speedResult.upload.speed, 2)
      },
      suitability: this.assessSuitability(latencyResult, speedResult)
    };
  }

  /**
   * Assess connection suitability for different activities
   */
  private assessSuitability(latencyResult: LatencyTestResults, speedResult: SpeedTestResults): any {
    const latency = latencyResult.avg;
    const downloadSpeed = speedResult.download.speed;
    const uploadSpeed = speedResult.upload.speed;

    return {
      browsing: downloadSpeed > 1 && latency < 500,
      streaming: downloadSpeed > 5 && latency < 200,
      gaming: latency < 50 && downloadSpeed > 3,
      videoCall: uploadSpeed > 1 && downloadSpeed > 1 && latency < 150,
      fileTransfer: downloadSpeed > 10 || uploadSpeed > 5
    };
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(latencyResult: LatencyTestResults, speedResult: SpeedTestResults): any[] {
    const recommendations: any[] = [];

    if (latencyResult.avg > 100) {
      recommendations.push({
        type: 'latency',
        message: 'High latency detected. Consider moving closer to your router or using a wired connection.',
        priority: 'high'
      });
    }

    if (speedResult.download.speed < 5) {
      recommendations.push({
        type: 'speed',
        message: 'Low download speed. Contact your ISP or consider upgrading your plan.',
        priority: 'medium'
      });
    }

    if (latencyResult.jitter > 20) {
      recommendations.push({
        type: 'stability',
        message: 'Connection instability detected. Check for interference or network congestion.',
        priority: 'medium'
      });
    }

    if (latencyResult.packetLoss > 1) {
      recommendations.push({
        type: 'reliability',
        message: 'Packet loss detected. Check your network equipment and connections.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Detect connection information
   */
  private detectConnection(): any {
    return getNetworkInfo();
  }

  /**
   * Generate unique test ID
   */
  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Assess speed quality
   */
  private assessSpeedQuality(speed: number, type: 'download' | 'upload'): string {
    const thresholds = type === 'download'
      ? { excellent: 100, good: 50, fair: 25, poor: 10 }
      : { excellent: 50, good: 25, fair: 10, poor: 5 };

    if (speed >= thresholds.excellent) return 'excellent';
    if (speed >= thresholds.good) return 'good';
    if (speed >= thresholds.fair) return 'fair';
    if (speed >= thresholds.poor) return 'poor';
    return 'very-poor';
  }

  /**
   * Assess jitter quality
   */
  private assessJitterQuality(jitter: number): string {
    if (jitter <= 5) return 'excellent';
    if (jitter <= 10) return 'good';
    if (jitter <= 20) return 'fair';
    if (jitter <= 50) return 'poor';
    return 'very-poor';
  }

  /**
   * Assess packet loss quality
   */
  private assessPacketLossQuality(packetLoss: number): string {
    if (packetLoss === 0) return 'excellent';
    if (packetLoss <= 1) return 'good';
    if (packetLoss <= 3) return 'fair';
    if (packetLoss <= 5) return 'poor';
    return 'very-poor';
  }

  /**
   * Save test results to local storage
   */
  private saveTestResults(results: NetworkTestResult): void {
    try {
      const history = this.getTestHistory();
      history.unshift(results);

      // Limit history size
      if (history.length > this.config.maxHistoryEntries) {
        history.splice(this.config.maxHistoryEntries);
      }

      localStorage.setItem('netpulse_test_history', JSON.stringify(history));

      logError(createError(ErrorType.UNKNOWN, 'Test results saved to history', ErrorSeverity.LOW));
    } catch (error) {
      logError(createError(ErrorType.UNKNOWN, 'Failed to save test results', ErrorSeverity.LOW));
    }
  }

  /**
   * Get test history from local storage
   */
  getTestHistory(): NetworkTestResult[] {
    try {
      const history = localStorage.getItem('netpulse_test_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      logError(createError(ErrorType.UNKNOWN, 'Failed to load test history', ErrorSeverity.LOW));
      return [];
    }
  }

  /**
   * Clear test history
   */
  clearTestHistory(): void {
    try {
      localStorage.removeItem('netpulse_test_history');
      logError(createError(ErrorType.UNKNOWN, 'Test history cleared', ErrorSeverity.LOW));
    } catch (error) {
      logError(createError(ErrorType.UNKNOWN, 'Failed to clear test history', ErrorSeverity.LOW));
    }
  }

  /**
   * Stop all running tests
   */
  stop(): void {
    this.isRunning = false;

    if (this.latencyTest.isTestRunning()) {
      this.latencyTest.stop();
    }

    if (this.speedTest.isTestRunning()) {
      this.speedTest.stop();
    }

    logError(createError(ErrorType.UNKNOWN, 'All network tests stopped', ErrorSeverity.LOW));
  }

  /**
   * Get current test status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      currentTest: this.currentTest,
      latencyRunning: this.latencyTest.isTestRunning(),
      speedRunning: this.speedTest.isTestRunning()
    };
  }

  /**
   * Check if test is currently running
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }
}
