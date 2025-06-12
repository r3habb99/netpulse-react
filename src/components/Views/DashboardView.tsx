/**
 * NetPulse Dashboard View Component
 * Real-time network monitoring interface
 */

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useMonitoring } from '../../hooks';
import { formatSpeed, formatLatency, formatRelativeTime, getLatencyQuality } from '../../utils';
import { LatencyChart } from '../Charts';
import type { ChartDataPoint } from '../Charts';
import MonitoringDebug from '../Debug/MonitoringDebug';
import '../../styles/components/DashboardView.css';

const DashboardView: React.FC = () => {
  const { state } = useAppContext();
  const { 
    startMonitoring, 
    stopMonitoring, 
    pauseMonitoring, 
    resumeMonitoring,
    status, 
    session, 
    currentData, 
    error 
  } = useMonitoring();

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Update chart data when session changes
  useEffect(() => {
    if (session && session.dataPoints.length > 0) {
      const latestPoints = session.dataPoints.slice(-50); // Show last 50 points for better trend
      const enhancedData: ChartDataPoint[] = latestPoints.map(point => ({
        timestamp: point.timestamp,
        latency: point.latency,
        quality: getLatencyQuality(point.latency)
      }));
      setChartData(enhancedData);
    }
  }, [session]);

  // Add keyboard shortcut for debug (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDebug(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartMonitoring = async () => {
    console.log('🎯 Start monitoring button clicked');
    try {
      await startMonitoring();
    } catch (error) {
      console.error('❌ Failed to start monitoring from UI:', error);
      // Error is already handled in the hook, just log here
    }
  };

  const handleStopMonitoring = () => {
    stopMonitoring();
  };

  const handlePauseMonitoring = () => {
    if (status === 'running') {
      pauseMonitoring();
    } else if (status === 'paused') {
      resumeMonitoring();
    }
  };

  const isMonitoring = status === 'running';
  const isPaused = status === 'paused';
  const canStart = status === 'stopped' || status === 'idle';

  return (
    <div className="dashboard-view">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h2 className="dashboard-title">Real-time Monitor</h2>
          <p className="dashboard-subtitle">
            Continuous network performance monitoring
          </p>
          {/* Debug button - only show in development or when needed */}
          <button
            onClick={() => setShowDebug(true)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '5px 10px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🐛 Debug
          </button>
        </div>

        {/* Monitoring Controls */}
        <div className="monitoring-controls">
          {canStart && (
            <button 
              className="mobile-btn mobile-btn-primary"
              onClick={handleStartMonitoring}
              disabled={!state.connection.networkAvailable}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Start Monitoring
            </button>
          )}

          {(isMonitoring || isPaused) && (
            <div className="active-controls">
              <button 
                className="mobile-btn mobile-btn-secondary"
                onClick={handlePauseMonitoring}
              >
                {isPaused ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                    Pause
                  </>
                )}
              </button>

              <button 
                className="mobile-btn mobile-btn-outline"
                onClick={handleStopMonitoring}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!state.connection.networkAvailable && (
          <div className="mobile-card error-card">
            <div className="error-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <h3>No Internet Connection</h3>
                <p>Please check your network connection to start monitoring.</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Metrics */}
        {currentData && isMonitoring && (
          <div className="mobile-card current-metrics-card">
            <div className="card-header">
              <h3>Current Metrics</h3>
              <div className={`status-indicator status-${status}`}>
                <div className="status-dot"></div>
                {status === 'running' ? 'Live' : 'Paused'}
              </div>
            </div>

            <div className="current-metrics">
              <div className="metric-item">
                <div className="metric-icon latency-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{formatLatency(currentData.latency)}</div>
                  <div className="metric-label">Latency</div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-icon download-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{formatSpeed(currentData.downloadSpeed)}</div>
                  <div className="metric-label">Download</div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-icon upload-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{formatSpeed(currentData.uploadSpeed)}</div>
                  <div className="metric-label">Upload</div>
                </div>
              </div>

              <div className="metric-item">
                <div className={`quality-badge quality-${currentData.quality}`}>
                  {currentData.quality.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Statistics */}
        {session && session.dataPoints.length > 0 && (
          <div className="mobile-card session-stats-card">
            <div className="card-header">
              <h3>Session Statistics</h3>
              <span className="session-duration">
                {formatRelativeTime(session.startTime)}
              </span>
            </div>

            <div className="session-stats">
              <div className="stat-item">
                <div className="stat-label">Avg Latency</div>
                <div className="stat-value">{formatLatency(session.statistics.averageLatency)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Avg Download</div>
                <div className="stat-value">{formatSpeed(session.statistics.averageDownload)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Avg Upload</div>
                <div className="stat-value">{formatSpeed(session.statistics.averageUpload)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Data Points</div>
                <div className="stat-value">{session.dataPoints.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Chart Visualization */}
        {chartData.length > 0 && (
          <div className="mobile-card chart-card">
            <div className="card-header">
              <h3>Latency Trend</h3>
              <span className="chart-info">Interactive chart with {chartData.length} data points</span>
            </div>

            <div className="enhanced-chart-container">
              <LatencyChart
                data={chartData}
                width={350}
                height={200}
                showGrid={true}
                showTooltip={true}
                maxDataPoints={50}
                className="latency-trend-chart"
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mobile-card error-card">
            <div className="error-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div>
                <h3>Monitoring Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!session && status === 'stopped' && (
          <div className="mobile-card empty-state-card">
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <h3>Start Real-time Monitoring</h3>
              <p>Monitor your network performance continuously and see live metrics and trends.</p>
            </div>
          </div>
        )}

        {/* Debug Component */}
        {showDebug && <MonitoringDebug />}
      </div>
    </div>
  );
};

export default DashboardView;
