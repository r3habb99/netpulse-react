/**
 * NetPulse Test View Component
 * Interactive network testing interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNetworkTest } from '../../hooks';
import { formatSpeed, formatLatency } from '../../utils';
import '../../styles/components/SharedComponents.css';
import '../../styles/components/Animations.css';
import '../../styles/components/TestView.css';

const TestView: React.FC = () => {
  const { state } = useAppContext();
  const { startTest, stopTest, status, progress, result, error } = useNetworkTest();
  const [showResults, setShowResults] = useState(false);

  const handleStartTest = useCallback(async () => {
    try {
      setShowResults(false);
      await startTest();
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  }, [startTest]);



  // Show results when test completes
  useEffect(() => {
    if (status === 'completed' && result) {
      setShowResults(true);
    }
  }, [status, result]);

  const handleStopTest = () => {
    stopTest();
    setShowResults(false);
  };

  const handleTestAgain = () => {
    setShowResults(false);
    handleStartTest();
  };

  const isTestRunning = status === 'running';
  const canStartTest = status === 'idle' || status === 'completed' || status === 'error';

  return (
    <div className="test-view">
      <div className="container">
        {/* Test Header */}
        <div className="test-header fade-in-down">
          <h2 className="test-title">Network Speed Test</h2>
          <p className="test-subtitle">
            Measure your internet connection speed and quality
          </p>
        </div>

        {/* Test Controls */}
        <div className="test-controls fade-in-up stagger-1">
          {canStartTest && !showResults && (
            <button
              className="mobile-btn mobile-btn-primary test-start-btn mobile-touch-feedback hover-glow"
              onClick={handleStartTest}
              disabled={!state.connection.networkAvailable}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Start Test
            </button>
          )}

          {isTestRunning && (
            <button
              className="mobile-btn mobile-btn-danger test-stop-btn mobile-touch-feedback"
              onClick={handleStopTest}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h12v12H6z"/>
              </svg>
              Stop Test
            </button>
          )}


        </div>

        {/* Connection Status */}
        {!state.connection.networkAvailable && (
          <div className="mobile-card error-card fade-in-up shake">
            <div className="error-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="pulse">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <h3>No Internet Connection</h3>
                <p>Please check your network connection and try again.</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Progress */}
        {isTestRunning && (
          <div className="mobile-card test-progress-card fade-in-up stagger-2 hover-lift">
            <div className="test-progress-header">
              <h3>Running Test...</h3>
              <span className="progress-percentage pulse">{Math.round(progress.percentage)}%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <div className="progress-details">
              <div className="current-test fade-in">{progress.currentTest}</div>
              <div className="progress-phase-info fade-in">
                {progress.phase === 'initializing' && (
                  <span className="phase-label">Preparing test environment</span>
                )}
                {progress.phase === 'latency' && (
                  <span className="phase-label">Measuring connection latency</span>
                )}
                {progress.phase === 'download' && (
                  <span className="phase-label">Testing download speed</span>
                )}
                {progress.phase === 'upload' && (
                  <span className="phase-label">Testing upload speed</span>
                )}
              </div>
              {progress.estimatedTimeRemaining > 0 && (
                <div className="time-remaining fade-in">
                  ~{Math.round(progress.estimatedTimeRemaining)}s remaining
                </div>
              )}
            </div>

            {/* Real-time metrics during test */}
            {progress.phase === 'download' && progress.currentSpeed !== undefined && (
              <div className="realtime-metrics fade-in-up stagger-3">
                <div className="realtime-metric pulse">
                  <div className="metric-label">Download Speed</div>
                  <div className="metric-value download-speed">
                    {formatSpeed(progress.currentSpeed)}
                  </div>
                </div>
              </div>
            )}

            {progress.phase === 'upload' && progress.currentSpeed !== undefined && (
              <div className="realtime-metrics fade-in-up stagger-3">
                <div className="realtime-metric pulse">
                  <div className="metric-label">Upload Speed</div>
                  <div className="metric-value upload-speed">
                    {formatSpeed(progress.currentSpeed)}
                  </div>
                </div>
              </div>
            )}

            {progress.phase === 'latency' && progress.currentLatency !== undefined && (
              <div className="realtime-metrics fade-in-up stagger-3">
                <div className="realtime-metric pulse">
                  <div className="metric-label">Current Latency</div>
                  <div className="metric-value latency-value">
                    {formatLatency(progress.currentLatency)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results */}
        {showResults && result && (
          <div className="test-results">
            <div className="mobile-card results-card fade-in-up scale-in-bounce hover-lift">
              <div className="results-header">
                <h3>Test Results</h3>
                <div className={`quality-badge quality-${result.quality.overall} bounce`}>
                  {result.quality.overall.replace('-', ' ')}
                </div>
              </div>

              <div className="results-metrics">
                <div className="result-metric fade-in-left stagger-1 hover-scale">
                  <div className="metric-icon download-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{formatSpeed(result.speed.download)}</div>
                    <div className="metric-label">Download</div>
                  </div>
                </div>

                <div className="result-metric fade-in-left stagger-2 hover-scale">
                  <div className="metric-icon upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{formatSpeed(result.speed.upload)}</div>
                    <div className="metric-label">Upload</div>
                  </div>
                </div>

                <div className="result-metric fade-in-left stagger-3 hover-scale">
                  <div className="metric-icon latency-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{formatLatency(result.latency.average)}</div>
                    <div className="metric-label">Latency</div>
                  </div>
                </div>
              </div>

              <div className="results-actions fade-in-up stagger-4">
                <button
                  className="mobile-btn mobile-btn-primary mobile-touch-feedback hover-glow"
                  onClick={handleTestAgain}
                >
                  Test Again
                </button>

                <button
                  className="mobile-btn mobile-btn-secondary mobile-touch-feedback hover-lift"
                  onClick={() => {/* TODO: Implement share functionality */}}
                >
                  Share Results
                </button>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="mobile-card details-card fade-in-up stagger-5 hover-lift">
              <h4>Detailed Results</h4>
              <div className="details-grid">
                <div className="detail-item fade-in-right stagger-1">
                  <span className="detail-label">Jitter:</span>
                  <span className="detail-value">{formatLatency(result.latency.jitter)}</span>
                </div>
                <div className="detail-item fade-in-right stagger-2">
                  <span className="detail-label">Packet Loss:</span>
                  <span className="detail-value">{result.latency.packetLoss.toFixed(1)}%</span>
                </div>
                <div className="detail-item fade-in-right stagger-3">
                  <span className="detail-label">Test Duration:</span>
                  <span className="detail-value">{result.duration}s</span>
                </div>
                <div className="detail-item fade-in-right stagger-4">
                  <span className="detail-label">Quality Score:</span>
                  <span className="detail-value">{result.quality.score}/5</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mobile-card error-card fade-in-up shake">
            <div className="error-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="pulse">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div>
                <h3>Test Failed</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestView;
