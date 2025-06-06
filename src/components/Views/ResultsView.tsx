/**
 * NetPulse Results View Component
 * Test history and detailed results display
 */

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNetworkTest } from '../../hooks';
import { NetworkTestResult } from '../../types';
import { formatSpeed, formatLatency, formatRelativeTime } from '../../utils';
import '../../styles/components/ResultsView.css';

const ResultsView: React.FC = () => {
  const { state, clearResults } = useAppContext();
  const { getTestHistory, clearTestHistory } = useNetworkTest();
  const [selectedResult, setSelectedResult] = useState<NetworkTestResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get test history from localStorage as well
  const [allResults, setAllResults] = useState<NetworkTestResult[]>([]);

  useEffect(() => {
    // Combine results from context and localStorage
    const historyResults = getTestHistory();
    const contextResults = state.results;
    
    // Merge and deduplicate results
    const combined = [...contextResults, ...historyResults];
    const unique = combined.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    );
    
    // Sort by timestamp (newest first)
    unique.sort((a, b) => b.timestamp - a.timestamp);
    
    setAllResults(unique);
  }, [state.results, getTestHistory]);

  const handleResultClick = (result: NetworkTestResult) => {
    setSelectedResult(result);
  };

  const handleBackToList = () => {
    setSelectedResult(null);
  };

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    clearResults();
    clearTestHistory();
    setAllResults([]);
    setSelectedResult(null);
    setShowClearConfirm(false);
  };

  const cancelClearHistory = () => {
    setShowClearConfirm(false);
  };



  // If a specific result is selected, show detailed view
  if (selectedResult) {
    return (
      <div className="results-view">
        <div className="container">
          {/* Result Detail Header */}
          <div className="result-detail-header">
            <button 
              className="back-button"
              onClick={handleBackToList}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Results
            </button>
            <h2>Test Details</h2>
          </div>

          {/* Detailed Result Card */}
          <div className="mobile-card result-detail-card">
            <div className="result-detail-header-info">
              <div className="result-timestamp">
                {new Date(selectedResult.timestamp).toLocaleString()}
              </div>
              <div className={`quality-badge quality-${selectedResult.quality.overall}`}>
                {selectedResult.quality.overall.replace('-', ' ')}
              </div>
            </div>

            {/* Main Metrics */}
            <div className="result-detail-metrics">
              <div className="detail-metric">
                <div className="metric-icon download-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{formatSpeed(selectedResult.speed.download)}</div>
                  <div className="metric-label">Download Speed</div>
                  <div className={`metric-quality quality-${selectedResult.quality.download}`}>
                    {selectedResult.quality.download.replace('-', ' ')}
                  </div>
                </div>
              </div>

              <div className="detail-metric">
                <div className="metric-icon upload-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{formatSpeed(selectedResult.speed.upload)}</div>
                  <div className="metric-label">Upload Speed</div>
                  <div className={`metric-quality quality-${selectedResult.quality.upload}`}>
                    {selectedResult.quality.upload.replace('-', ' ')}
                  </div>
                </div>
              </div>

              <div className="detail-metric">
                <div className="metric-icon latency-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value">{formatLatency(selectedResult.latency.average)}</div>
                  <div className="metric-label">Average Latency</div>
                  <div className={`metric-quality quality-${selectedResult.quality.latency}`}>
                    {selectedResult.quality.latency.replace('-', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="additional-details">
              <h4>Additional Metrics</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Min Latency:</span>
                  <span className="detail-value">{formatLatency(selectedResult.latency.min)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Max Latency:</span>
                  <span className="detail-value">{formatLatency(selectedResult.latency.max)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Jitter:</span>
                  <span className="detail-value">{formatLatency(selectedResult.latency.jitter)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Packet Loss:</span>
                  <span className="detail-value">{selectedResult.latency.packetLoss.toFixed(1)}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Test Duration:</span>
                  <span className="detail-value">{selectedResult.duration}s</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Quality Score:</span>
                  <span className="detail-value">{selectedResult.quality.score}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main results list view
  return (
    <div className="results-view">
      <div className="container">
        {/* Results Header */}
        <div className="results-header">
          <h2 className="results-title">Test Results</h2>
          <p className="results-subtitle">
            History of your network speed tests
          </p>
        </div>

        {/* Results Actions */}
        {allResults.length > 0 && (
          <div className="results-actions">
            <button 
              className="mobile-btn mobile-btn-outline"
              onClick={handleClearHistory}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Clear History
            </button>
          </div>
        )}

        {/* Results List */}
        {allResults.length > 0 ? (
          <div className="results-list">
            {allResults.map((result) => (
              <div 
                key={result.id}
                className="mobile-card result-card"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-card-header">
                  <div className="result-timestamp">
                    {formatRelativeTime(result.timestamp)}
                  </div>
                  <div className={`quality-badge quality-${result.quality.overall}`}>
                    {result.quality.overall.replace('-', ' ')}
                  </div>
                </div>

                <div className="result-card-metrics">
                  <div className="result-metric">
                    <div className="metric-label">Download</div>
                    <div className="metric-value">{formatSpeed(result.speed.download)}</div>
                  </div>
                  <div className="result-metric">
                    <div className="metric-label">Upload</div>
                    <div className="metric-value">{formatSpeed(result.speed.upload)}</div>
                  </div>
                  <div className="result-metric">
                    <div className="metric-label">Latency</div>
                    <div className="metric-value">{formatLatency(result.latency.average)}</div>
                  </div>
                </div>

                <div className="result-card-footer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mobile-card empty-state-card">
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              <h3>No Test Results</h3>
              <p>Run a speed test to see your results here.</p>
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Clear Test History</h3>
              <p>Are you sure you want to clear all test results? This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="mobile-btn mobile-btn-outline"
                  onClick={cancelClearHistory}
                >
                  Cancel
                </button>
                <button 
                  className="mobile-btn mobile-btn-primary"
                  onClick={confirmClearHistory}
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
