/**
 * NetPulse Data Formatting Utilities
 * Functions for formatting network data, numbers, and time values
 */

import { QualityLevel } from './constants';

/**
 * Format speed values with appropriate units
 * @param speedMbps Speed value in Mbps
 */
export const formatSpeed = (speedMbps: number): string => {
  if (speedMbps === 0) return '0 Mbps';

  if (speedMbps >= 1000) {
    return `${(speedMbps / 1000).toFixed(2)} Gbps`;
  } else if (speedMbps >= 1) {
    return `${speedMbps.toFixed(2)} Mbps`;
  } else {
    const kbps = speedMbps * 1024;
    return `${kbps.toFixed(0)} Kbps`;
  }
};

/**
 * Format latency values
 */
export const formatLatency = (milliseconds: number): string => {
  if (milliseconds === 0) return '0 ms';
  
  if (milliseconds >= 1000) {
    return `${(milliseconds / 1000).toFixed(2)} s`;
  }
  
  return `${Math.round(milliseconds)} ms`;
};

/**
 * Format jitter values
 */
export const formatJitter = (milliseconds: number): string => {
  return formatLatency(milliseconds);
};

/**
 * Format packet loss percentage
 */
export const formatPacketLoss = (percentage: number): string => {
  if (percentage === 0) return '0%';
  return `${percentage.toFixed(1)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
};

/**
 * Format duration in milliseconds to human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format timestamp to readable date/time
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format numbers with thousand separators
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Get quality level based on latency
 */
export const getLatencyQuality = (latency: number): QualityLevel => {
  if (latency < 20) return 'excellent';
  if (latency < 50) return 'good';
  if (latency < 100) return 'fair';
  if (latency < 200) return 'poor';
  return 'very-poor';
};

/**
 * Get quality level based on download speed (Mbps)
 */
export const getDownloadSpeedQuality = (speedMbps: number): QualityLevel => {
  if (speedMbps > 100) return 'excellent';
  if (speedMbps > 25) return 'good';
  if (speedMbps > 10) return 'fair';
  if (speedMbps > 5) return 'poor';
  return 'very-poor';
};

/**
 * Get quality level based on upload speed (Mbps)
 */
export const getUploadSpeedQuality = (speedMbps: number): QualityLevel => {
  if (speedMbps > 50) return 'excellent';
  if (speedMbps > 10) return 'good';
  if (speedMbps > 5) return 'fair';
  if (speedMbps > 1) return 'poor';
  return 'very-poor';
};

/**
 * Get quality level based on jitter
 */
export const getJitterQuality = (jitter: number): QualityLevel => {
  if (jitter < 5) return 'excellent';
  if (jitter < 15) return 'good';
  if (jitter < 30) return 'fair';
  if (jitter < 50) return 'poor';
  return 'very-poor';
};

/**
 * Get quality level based on packet loss percentage
 */
export const getPacketLossQuality = (packetLoss: number): QualityLevel => {
  if (packetLoss === 0) return 'excellent';
  if (packetLoss < 1) return 'good';
  if (packetLoss < 3) return 'fair';
  if (packetLoss < 5) return 'poor';
  return 'very-poor';
};

/**
 * Get overall connection quality based on multiple metrics
 */
export const getOverallQuality = (metrics: {
  latency: number;
  downloadSpeed: number;
  uploadSpeed: number;
  jitter: number;
  packetLoss: number;
}): QualityLevel => {
  const qualities = [
    getLatencyQuality(metrics.latency),
    getDownloadSpeedQuality(metrics.downloadSpeed), // Already in Mbps
    getUploadSpeedQuality(metrics.uploadSpeed), // Already in Mbps
    getJitterQuality(metrics.jitter),
    getPacketLossQuality(metrics.packetLoss)
  ];

  // Convert quality levels to numeric scores
  const qualityScores = qualities.map(quality => {
    switch (quality) {
      case 'excellent': return 5;
      case 'good': return 4;
      case 'fair': return 3;
      case 'poor': return 2;
      case 'very-poor': return 1;
      default: return 1;
    }
  });

  // Calculate average score
  const averageScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

  // Convert back to quality level
  if (averageScore >= 4.5) return 'excellent';
  if (averageScore >= 3.5) return 'good';
  if (averageScore >= 2.5) return 'fair';
  if (averageScore >= 1.5) return 'poor';
  return 'very-poor';
};

/**
 * Get quality description text
 */
export const getQualityDescription = (quality: QualityLevel): string => {
  switch (quality) {
    case 'excellent': return 'Excellent connection quality';
    case 'good': return 'Good connection quality';
    case 'fair': return 'Fair connection quality';
    case 'poor': return 'Poor connection quality';
    case 'very-poor': return 'Very poor connection quality';
    default: return 'Unknown connection quality';
  }
};

/**
 * Get quality color for UI display
 */
export const getQualityColor = (quality: QualityLevel): string => {
  switch (quality) {
    case 'excellent': return '#10B981'; // Green
    case 'good': return '#84CC16';      // Light green
    case 'fair': return '#F59E0B';      // Yellow
    case 'poor': return '#F97316';      // Orange
    case 'very-poor': return '#EF4444'; // Red
    default: return '#6B7280';          // Gray
  }
};
