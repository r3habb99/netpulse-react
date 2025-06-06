/**
 * NetPulse Home View Component
 * Welcome screen with quick stats and test controls
 */

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConnection } from '../../hooks';
import { getDeviceInfo, getDeviceInfoAsync, formatSpeed, formatLatency, formatRelativeTime } from '../../utils';
import '../../styles/components/SharedComponents.css';
import '../../styles/components/Animations.css';
import '../../styles/components/HomeView.css';

const HomeView: React.FC = () => {
  const { state, setView } = useAppContext();
  const { networkInfo } = useConnection();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [enhancedInfo, setEnhancedInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load basic device information immediately
    const basicInfo = getDeviceInfo();
    setDeviceInfo(basicInfo);

    // Load enhanced information asynchronously
    const loadEnhancedInfo = async () => {
      try {
        const enhanced = await getDeviceInfoAsync();
        setEnhancedInfo(enhanced);
      } catch (error) {
        console.error('Failed to load enhanced device info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnhancedInfo();
  }, []);

  const handleStartTest = () => {
    // Simply navigate to test view without auto-starting
    setView('test');
  };

  const lastResult = state.results.length > 0 ? state.results[0] : null;

  return (
    <div className="home-view">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section fade-in-down">
          <h2 className="welcome-title">Network Performance Monitor</h2>
          <p className="welcome-subtitle">
            Test your internet speed, latency, and connection quality
          </p>
        </div>

        {/* Quick Stats */}
        {lastResult && (
          <div className="mobile-card quick-stats fade-in-up stagger-1 hover-lift">
            <div className="mobile-card-header">
              <h3 className="mobile-card-title">Last Test Results</h3>
              <span className="test-time">
                {formatRelativeTime(lastResult.timestamp)}
              </span>
            </div>
            <div className="mobile-metrics">
              <div className="mobile-metric hover-scale stagger-1">
                <div className="mobile-metric-value">
                  {formatSpeed(lastResult.speed.download)}
                </div>
                <div className="mobile-metric-label">Download</div>
              </div>
              <div className="mobile-metric hover-scale stagger-2">
                <div className="mobile-metric-value">
                  {formatSpeed(lastResult.speed.upload)}
                </div>
                <div className="mobile-metric-label">Upload</div>
              </div>
              <div className="mobile-metric hover-scale stagger-3">
                <div className="mobile-metric-value">
                  {formatLatency(lastResult.latency.average)}
                </div>
                <div className="mobile-metric-label">Latency</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="test-controls fade-in-up stagger-2">
          <button
            className="mobile-btn mobile-btn-primary start-test-btn mobile-touch-feedback hover-glow"
            onClick={handleStartTest}
            disabled={state.test.isRunning}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5v10l7-5-7-5z" />
            </svg>
            Start Network Test
          </button>
        </div>

        {/* Enhanced Device Information */}
        <div className="mobile-card device-info fade-in-up stagger-3 hover-lift">
          <div className="mobile-card-header">
            <h3 className="mobile-card-title">Device Information</h3>
            {!loading && enhancedInfo && (
              <span className="info-badge">Enhanced</span>
            )}
          </div>
          <div className="device-info-content">
            {deviceInfo ? (
              <div className="device-details fade-in">
                {/* Device & Hardware Section */}
                <div className="device-section">
                  <h4 className="section-title">Device & Hardware</h4>
                  <div className="device-detail-row fade-in-left stagger-1">
                    <span className="detail-label">Device Type:</span>
                    <span className="detail-value">
                      {deviceInfo.isMobile ? 'Mobile' :
                       deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
                    </span>
                  </div>
                  {enhancedInfo?.deviceModel && enhancedInfo.deviceModel !== 'Unknown Device' && (
                    <div className="device-detail-row fade-in-left stagger-2">
                      <span className="detail-label">Device Model:</span>
                      <span className="detail-value">{enhancedInfo.deviceModel}</span>
                    </div>
                  )}
                  <div className="device-detail-row fade-in-left stagger-3">
                    <span className="detail-label">Operating System:</span>
                    <span className="detail-value">
                      {deviceInfo.os} {deviceInfo.osVersion}
                      {enhancedInfo?.architecture && enhancedInfo.architecture !== 'Unknown' &&
                        ` (${enhancedInfo.architecture})`
                      }
                    </span>
                  </div>
                  <div className="device-detail-row fade-in-left stagger-4">
                    <span className="detail-label">CPU Cores:</span>
                    <span className="detail-value">{deviceInfo.hardwareConcurrency}</span>
                  </div>
                  {deviceInfo.memory > 0 && (
                    <div className="device-detail-row fade-in-left stagger-5">
                      <span className="detail-label">RAM:</span>
                      <span className="detail-value">{deviceInfo.memory} GB</span>
                    </div>
                  )}
                </div>

                {/* Browser & Software Section */}
                <div className="device-section">
                  <h4 className="section-title">Browser & Software</h4>
                  <div className="device-detail-row fade-in-left stagger-6">
                    <span className="detail-label">Browser:</span>
                    <span className="detail-value">
                      {deviceInfo.browser} {deviceInfo.browserVersion}
                    </span>
                  </div>
                  <div className="device-detail-row fade-in-left stagger-7">
                    <span className="detail-label">Language:</span>
                    <span className="detail-value">
                      {enhancedInfo?.language || deviceInfo.language || 'Unknown'}
                    </span>
                  </div>
                  {enhancedInfo?.timezone && (
                    <div className="device-detail-row fade-in-left stagger-8">
                      <span className="detail-label">Timezone:</span>
                      <span className="detail-value">{enhancedInfo.timezone}</span>
                    </div>
                  )}
                </div>

                {/* Display & Graphics Section */}
                <div className="device-section">
                  <h4 className="section-title">Display & Graphics</h4>
                  <div className="device-detail-row fade-in-left stagger-9">
                    <span className="detail-label">Screen Resolution:</span>
                    <span className="detail-value">
                      {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
                    </span>
                  </div>
                  {enhancedInfo && (
                    <div className="device-detail-row fade-in-left stagger-10">
                      <span className="detail-label">Viewport Size:</span>
                      <span className="detail-value">
                        {enhancedInfo.viewportWidth} × {enhancedInfo.viewportHeight}
                      </span>
                    </div>
                  )}
                  <div className="device-detail-row fade-in-left stagger-11">
                    <span className="detail-label">Pixel Ratio:</span>
                    <span className="detail-value">{deviceInfo.pixelRatio}x</span>
                  </div>
                  {enhancedInfo?.colorDepth && (
                    <div className="device-detail-row fade-in-left stagger-12">
                      <span className="detail-label">Color Depth:</span>
                      <span className="detail-value">{enhancedInfo.colorDepth}-bit</span>
                    </div>
                  )}
                  {enhancedInfo?.orientation && (
                    <div className="device-detail-row fade-in-left stagger-13">
                      <span className="detail-label">Orientation:</span>
                      <span className="detail-value">{enhancedInfo.orientation}</span>
                    </div>
                  )}
                </div>

                {/* Network & Connectivity Section */}
                <div className="device-section">
                  <h4 className="section-title">Network & Connectivity</h4>
                  {(deviceInfo.connectionType !== 'unknown' || networkInfo) && (
                    <div className="device-detail-row fade-in-left stagger-14">
                      <span className="detail-label">Connection Type:</span>
                      <span className="detail-value">
                        {networkInfo ?
                          `${networkInfo.connectionType} (${networkInfo.effectiveType})` :
                          `${deviceInfo.connectionType} (${deviceInfo.effectiveType})`
                        }
                      </span>
                    </div>
                  )}
                  {networkInfo && networkInfo.isp !== 'Unknown ISP' && (
                    <div className="device-detail-row fade-in-left stagger-15">
                      <span className="detail-label">Network Provider:</span>
                      <span className="detail-value">{networkInfo.isp}</span>
                    </div>
                  )}
                  {networkInfo && (
                    <div className="device-detail-row fade-in-left stagger-16">
                      <span className="detail-label">Connection Quality:</span>
                      <span className={`detail-value quality-${networkInfo.quality}`}>
                        {networkInfo.quality.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Capabilities & Features Section */}
                <div className="device-section">
                  <h4 className="section-title">Capabilities & Features</h4>
                  <div className="capabilities-grid">
                    <div className="capability-item">
                      <span className="capability-label">Touch Support:</span>
                      <span className={`capability-status ${deviceInfo.touchSupport ? 'supported' : 'not-supported'}`}>
                        {deviceInfo.touchSupport ? '✓' : '✗'}
                      </span>
                    </div>
                    {enhancedInfo && (
                      <>
                        <div className="capability-item">
                          <span className="capability-label">Camera:</span>
                          <span className={`capability-status ${enhancedInfo.cameraSupport ? 'supported' : 'not-supported'}`}>
                            {enhancedInfo.cameraSupport ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-label">Microphone:</span>
                          <span className={`capability-status ${enhancedInfo.microphoneSupport ? 'supported' : 'not-supported'}`}>
                            {enhancedInfo.microphoneSupport ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-label">Geolocation:</span>
                          <span className={`capability-status ${enhancedInfo.geolocationSupport ? 'supported' : 'not-supported'}`}>
                            {enhancedInfo.geolocationSupport ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-label">WebGL:</span>
                          <span className={`capability-status ${enhancedInfo.webGLSupport ? 'supported' : 'not-supported'}`}>
                            {enhancedInfo.webGLSupport ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="capability-item">
                          <span className="capability-label">WebRTC:</span>
                          <span className={`capability-status ${enhancedInfo.webRTCSupport ? 'supported' : 'not-supported'}`}>
                            {enhancedInfo.webRTCSupport ? '✓' : '✗'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* PWA & Storage Section */}
                {(deviceInfo.isStandalone || enhancedInfo?.storageQuota > 0) && (
                  <div className="device-section">
                    <h4 className="section-title">PWA & Storage</h4>
                    {deviceInfo.isStandalone && (
                      <div className="device-detail-row fade-in-left stagger-17">
                        <span className="detail-label">PWA Mode:</span>
                        <span className="detail-value">Standalone</span>
                      </div>
                    )}
                    {enhancedInfo?.storageQuota > 0 && (
                      <div className="device-detail-row fade-in-left stagger-18">
                        <span className="detail-label">Storage Quota:</span>
                        <span className="detail-value">
                          {(enhancedInfo.storageQuota / (1024 * 1024 * 1024)).toFixed(1)} GB
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Battery Information */}
                {enhancedInfo?.batteryLevel !== undefined && (
                  <div className="device-section">
                    <h4 className="section-title">Battery</h4>
                    <div className="device-detail-row fade-in-left stagger-19">
                      <span className="detail-label">Battery Level:</span>
                      <span className="detail-value">
                        {enhancedInfo.batteryLevel}%
                        {enhancedInfo.batteryCharging && ' (Charging)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="loading-device-info">
                <div className="loading-spinner-small rotate"></div>
                <span>Loading device information...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions fade-in-up stagger-4">
          <button
            className="mobile-btn mobile-btn-secondary mobile-touch-feedback hover-lift"
            onClick={() => setView('dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            Real-time Monitor
          </button>

          {state.results.length > 0 && (
            <button
              className="mobile-btn mobile-btn-secondary mobile-touch-feedback hover-lift scale-in-bounce"
              onClick={() => setView('results')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
              View Results ({state.results.length})
            </button>
          )}
        </div>

        {/* Connection Status Info */}
        {state.connection.status === 'disconnected' && (
          <div className="connection-warning fade-in-up shake">
            <div className="warning-icon pulse">⚠️</div>
            <div className="warning-content">
              <h4>No Internet Connection</h4>
              <p>Please check your network connection and try again.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
