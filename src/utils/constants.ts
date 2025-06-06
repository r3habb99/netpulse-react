/**
 * NetPulse Application Constants
 * Centralized constants for consistent usage across the React application
 */

export const CONSTANTS = {
  // Application Information
  APP: {
    NAME: 'NetPulse',
    VERSION: '1.0.0',
    DESCRIPTION: 'Mobile Network Monitoring Application',
    AUTHOR: 'NetPulse Team'
  },

  // Timing Constants (in milliseconds)
  TIMING: {
    ANIMATION_FAST: 200,
    ANIMATION_NORMAL: 400,
    ANIMATION_SLOW: 800,
    DEBOUNCE_DEFAULT: 300,
    THROTTLE_DEFAULT: 100,
    TIMEOUT_SHORT: 5000,
    TIMEOUT_MEDIUM: 10000,
    TIMEOUT_LONG: 30000,
    RETRY_DELAY: 1000,
    HAPTIC_FEEDBACK_DURATION: 200,
    SCALE_PULSE_DURATION: 300,
    SWIPE_INDICATOR_DURATION: 1000,
    PULL_REFRESH_DURATION: 1500,
    VIEW_TRANSITION_DELAY: 1000
  },

  // Network Testing Configuration
  NETWORK: {
    // Latency test settings
    LATENCY: {
      DEFAULT_SAMPLES: 10,
      MAX_SAMPLES: 50,
      MIN_SAMPLES: 3,
      TIMEOUT: 5000,
      RETRY_ATTEMPTS: 3,
      CONCURRENT_REQUESTS: 3
    },

    // Speed test settings - Enhanced for better user experience
    SPEED: {
      DOWNLOAD_DURATION: 15000, // 15 seconds for more realistic testing
      UPLOAD_DURATION: 12000,   // 12 seconds for more realistic testing
      WARMUP_DURATION: 2000,    // 2 seconds
      MIN_TEST_DURATION: 8000,  // 8 seconds minimum
      MAX_TEST_DURATION: 45000, // 45 seconds maximum
      CHUNK_SIZE: 1024 * 1024,  // 1MB chunks
      CONCURRENT_CONNECTIONS: 4,
      PROGRESS_UPDATE_INTERVAL: 100 // ms
    },

    // Continuous monitoring
    MONITORING: {
      DEFAULT_INTERVAL: 5000,   // 5 seconds
      MIN_INTERVAL: 1000,       // 1 second
      MAX_INTERVAL: 60000,      // 1 minute
      MAX_DATA_POINTS: 100,
      ALERT_THRESHOLD_LATENCY: 200, // ms
      ALERT_THRESHOLD_PACKET_LOSS: 5 // %
    }
  },

  // Quality Assessment Thresholds
  QUALITY: {
    LATENCY: {
      EXCELLENT: 20,  // < 20ms
      GOOD: 50,       // 20-50ms
      FAIR: 100,      // 50-100ms
      POOR: 200       // 100-200ms
      // > 200ms = Very Poor
    },
    
    DOWNLOAD_SPEED: {
      EXCELLENT: 100, // > 100 Mbps
      GOOD: 25,       // 25-100 Mbps
      FAIR: 10,       // 10-25 Mbps
      POOR: 5         // 5-10 Mbps
      // < 5 Mbps = Very Poor
    },
    
    UPLOAD_SPEED: {
      EXCELLENT: 50,  // > 50 Mbps
      GOOD: 10,       // 10-50 Mbps
      FAIR: 5,        // 5-10 Mbps
      POOR: 1         // 1-5 Mbps
      // < 1 Mbps = Very Poor
    },
    
    JITTER: {
      EXCELLENT: 5,   // < 5ms
      GOOD: 15,       // 5-15ms
      FAIR: 30,       // 15-30ms
      POOR: 50        // 30-50ms
      // > 50ms = Very Poor
    },
    
    PACKET_LOSS: {
      EXCELLENT: 0,   // 0%
      GOOD: 1,        // 0-1%
      FAIR: 3,        // 1-3%
      POOR: 5         // 3-5%
      // > 5% = Very Poor
    }
  },

  // UI Configuration
  UI: {
    // Animation durations
    ANIMATIONS: {
      FAST: 200,
      NORMAL: 400,
      SLOW: 800
    },

    // Chart configuration
    CHARTS: {
      MAX_DATA_POINTS: 50,
      UPDATE_INTERVAL: 100
    },

    // Responsive breakpoints
    BREAKPOINTS: {
      MOBILE: 768,
      TABLET: 1024,
      DESKTOP: 1200
    },

    // Mobile navigation
    MOBILE_NAV: {
      SWIPE_THRESHOLD: 50,
      SWIPE_VELOCITY_THRESHOLD: 0.3,
      PULL_REFRESH_THRESHOLD: 80
    }
  },

  // Test File URLs (for speed testing)
  TEST_FILES: {
    SMALL: '/test-files/1kb.bin',
    MEDIUM: '/test-files/10kb.bin',
    LARGE: '/test-files/100kb.bin',
    small: '/test-files/1kb.bin',
    medium: '/test-files/10kb.bin',
    large: '/test-files/100kb.bin'
  },

  // Status Messages
  STATUS: {
    NETWORK: {
      CONNECTED: 'Connected',
      DISCONNECTED: 'Disconnected',
      TESTING: 'Testing...',
      ERROR: 'Connection Error'
    },
    
    TEST: {
      IDLE: 'Ready to test',
      INITIALIZING: 'Initializing...',
      RUNNING: 'Running test...',
      COMPLETED: 'Test completed',
      FAILED: 'Test failed',
      CANCELLED: 'Test cancelled'
    },
    
    MONITORING: {
      STOPPED: 'Monitoring stopped',
      RUNNING: 'Monitoring active',
      PAUSED: 'Monitoring paused',
      ERROR: 'Monitoring error'
    }
  },

  // Error Messages
  ERRORS: {
    NETWORK_UNAVAILABLE: 'Network connection unavailable',
    TEST_TIMEOUT: 'Test timed out',
    INVALID_RESPONSE: 'Invalid server response',
    PERMISSION_DENIED: 'Permission denied',
    UNKNOWN_ERROR: 'An unknown error occurred'
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    TEST_RESULTS: 'netpulse_test_results',
    USER_PREFERENCES: 'netpulse_preferences',
    MONITORING_DATA: 'netpulse_monitoring_data',
    DEVICE_INFO: 'netpulse_device_info'
  },

  // PWA Configuration
  PWA: {
    CACHE_NAME: 'netpulse-v1',
    CACHE_URLS: [
      '/',
      '/static/js/bundle.js',
      '/static/css/main.css',
      '/manifest.json'
    ]
  },

  // Quality Thresholds
  QUALITY_THRESHOLDS: {
    LATENCY: {
      EXCELLENT: 50,
      GOOD: 100,
      FAIR: 200,
      POOR: 500
    },
    SPEED: {
      DOWNLOAD: {
        EXCELLENT: 100,
        GOOD: 50,
        FAIR: 25,
        POOR: 10
      },
      UPLOAD: {
        EXCELLENT: 50,
        GOOD: 25,
        FAIR: 10,
        POOR: 5
      }
    },
    JITTER: {
      EXCELLENT: 5,
      GOOD: 10,
      FAIR: 20,
      POOR: 50
    },
    PACKET_LOSS: {
      EXCELLENT: 0,
      GOOD: 1,
      FAIR: 3,
      POOR: 5
    }
  }
} as const;

// Export individual sections for convenience
export const { APP, TIMING, NETWORK, QUALITY, UI, TEST_FILES, STATUS, ERRORS, STORAGE_KEYS, PWA, QUALITY_THRESHOLDS } = CONSTANTS;

// Type definitions for better TypeScript support
export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
export type TestStatus = 'idle' | 'initializing' | 'running' | 'completed' | 'stopped' | 'error';
export type MonitoringStatus = 'idle' | 'stopped' | 'running' | 'paused' | 'error';
export type NetworkStatus = 'connected' | 'disconnected' | 'limited' | 'slow';
