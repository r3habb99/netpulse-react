/**
 * NetPulse Mathematical Utilities
 * Statistical and mathematical functions for network data analysis
 */

/**
 * Calculate average of an array of numbers
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/**
 * Calculate median of an array of numbers
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

/**
 * Calculate minimum value from an array
 */
export const calculateMin = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.min(...values);
};

/**
 * Calculate maximum value from an array
 */
export const calculateMax = (values: number[]): number => {
  if (values.length === 0) return 0;
  return Math.max(...values);
};

/**
 * Calculate standard deviation
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const average = calculateAverage(values);
  const squaredDifferences = values.map(value => Math.pow(value - average, 2));
  const variance = calculateAverage(squaredDifferences);
  
  return Math.sqrt(variance);
};

/**
 * Calculate jitter (standard deviation of latency measurements)
 */
export const calculateJitter = (latencyValues: number[]): number => {
  return calculateStandardDeviation(latencyValues);
};

/**
 * Calculate packet loss percentage
 */
export const calculatePacketLoss = (totalPackets: number, lostPackets: number): number => {
  if (totalPackets === 0) return 0;
  return (lostPackets / totalPackets) * 100;
};

/**
 * Calculate percentile value
 */
export const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Number.isInteger(index)) {
    return sorted[index];
  } else {
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
};

/**
 * Calculate 95th percentile (commonly used in network analysis)
 */
export const calculate95thPercentile = (values: number[]): number => {
  return calculatePercentile(values, 95);
};

/**
 * Calculate 99th percentile
 */
export const calculate99thPercentile = (values: number[]): number => {
  return calculatePercentile(values, 99);
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (values: number[], windowSize: number): number[] => {
  if (values.length === 0 || windowSize <= 0) return [];
  
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    result.push(calculateAverage(window));
  }
  
  return result;
};

/**
 * Calculate exponential moving average
 */
export const calculateExponentialMovingAverage = (values: number[], alpha: number = 0.3): number[] => {
  if (values.length === 0) return [];
  
  const result: number[] = [values[0]];
  
  for (let i = 1; i < values.length; i++) {
    const ema = alpha * values[i] + (1 - alpha) * result[i - 1];
    result.push(ema);
  }
  
  return result;
};

/**
 * Smooth data using moving average
 */
export const smoothData = (values: number[], windowSize: number = 5): number[] => {
  return calculateMovingAverage(values, windowSize);
};

/**
 * Calculate rate of change between two values
 */
export const calculateRateOfChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Calculate throughput in bits per second
 */
export const calculateThroughput = (bytesTransferred: number, timeMs: number): number => {
  if (timeMs === 0) return 0;
  return (bytesTransferred * 8) / (timeMs / 1000); // Convert to bits per second
};

/**
 * Calculate download speed from test data
 */
export const calculateDownloadSpeed = (bytesDownloaded: number, durationMs: number): number => {
  return calculateThroughput(bytesDownloaded, durationMs);
};

/**
 * Calculate upload speed from test data
 */
export const calculateUploadSpeed = (bytesUploaded: number, durationMs: number): number => {
  return calculateThroughput(bytesUploaded, durationMs);
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Map a value from one range to another
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Round to specified decimal places
 */
export const roundToDecimals = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Calculate confidence interval for a dataset
 */
export const calculateConfidenceInterval = (
  values: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; margin: number } => {
  if (values.length === 0) {
    return { lower: 0, upper: 0, margin: 0 };
  }
  
  const mean = calculateAverage(values);
  const stdDev = calculateStandardDeviation(values);
  const n = values.length;
  
  // Using t-distribution approximation for small samples
  const tValue = confidenceLevel === 0.95 ? 1.96 : 2.576; // 95% or 99%
  const marginOfError = tValue * (stdDev / Math.sqrt(n));
  
  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    margin: marginOfError
  };
};

/**
 * Detect outliers using IQR method
 */
export const detectOutliers = (values: number[]): number[] => {
  if (values.length < 4) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(value => value < lowerBound || value > upperBound);
};

/**
 * Remove outliers from dataset
 */
export const removeOutliers = (values: number[]): number[] => {
  if (values.length < 4) return values;
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(value => value >= lowerBound && value <= upperBound);
};

/**
 * Calculate network quality score (0-100)
 */
export const calculateQualityScore = (metrics: {
  latency: number;
  downloadSpeed: number;
  uploadSpeed: number;
  jitter: number;
  packetLoss: number;
}): number => {
  // Normalize each metric to 0-100 scale
  const latencyScore = clamp(mapRange(metrics.latency, 200, 0, 0, 100), 0, 100);
  const downloadScore = clamp(mapRange(metrics.downloadSpeed / (1024 * 1024), 0, 100, 0, 100), 0, 100);
  const uploadScore = clamp(mapRange(metrics.uploadSpeed / (1024 * 1024), 0, 50, 0, 100), 0, 100);
  const jitterScore = clamp(mapRange(metrics.jitter, 50, 0, 0, 100), 0, 100);
  const packetLossScore = clamp(mapRange(metrics.packetLoss, 5, 0, 0, 100), 0, 100);

  // Weighted average (latency and download speed are more important)
  const weights = {
    latency: 0.3,
    download: 0.3,
    upload: 0.2,
    jitter: 0.1,
    packetLoss: 0.1
  };

  const weightedScore =
    latencyScore * weights.latency +
    downloadScore * weights.download +
    uploadScore * weights.upload +
    jitterScore * weights.jitter +
    packetLossScore * weights.packetLoss;

  return roundToDecimals(weightedScore, 1);
};

/**
 * Calculate comprehensive statistics for a dataset
 */
export const calculateStatistics = (values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  standardDeviation: number;
  jitter: number;
} => {
  return {
    min: calculateMin(values),
    max: calculateMax(values),
    mean: calculateAverage(values),
    median: calculateMedian(values),
    standardDeviation: calculateStandardDeviation(values),
    jitter: calculateJitter(values)
  };
};

/**
 * Round to specified decimal places (alias for roundToDecimals)
 */
export const round = (value: number, decimals: number): number => {
  return roundToDecimals(value, decimals);
};

/**
 * Calculate speed in Mbps from bytes and time
 */
export const calculateSpeedMbps = (bytes: number, timeMs: number): number => {
  if (timeMs === 0) return 0;
  const bitsPerSecond = (bytes * 8) / (timeMs / 1000);
  return bitsPerSecond / (1024 * 1024); // Convert to Mbps
};

/**
 * Apply overhead compensation to speed measurements
 */
export const applyOverheadCompensation = (speed: number, compensation: number): number => {
  return speed * (1 + compensation);
};

/**
 * Compensate for TCP slow start in speed calculations
 */
export const compensateForTcpSlowStart = (
  bytesTransferred: number, 
  elapsedTime: number,
  connectionCount: number
): number => {
  // TCP slow start typically affects first ~10% of transfer
  const slowStartPortion = 0.1;
  const slowStartPenalty = 0.3; // Transfer is ~30% slower during slow start
  
  // Calculate effective time accounting for slow start
  const slowStartTime = elapsedTime * slowStartPortion;
  const normalTime = elapsedTime * (1 - slowStartPortion);
  const effectiveTime = (slowStartTime * (1 + slowStartPenalty)) + normalTime;
  
  // Apply connection count adjustment (diminishing returns after 4-6 connections)
  const connectionFactor = Math.min(connectionCount, 6) / 6;
  
  return calculateSpeedMbps(bytesTransferred, effectiveTime * (1 - (0.1 * connectionFactor)));
}
