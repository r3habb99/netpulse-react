/**
 * Professional Speed Test Demo Component
 * Showcases all the enhanced features like Speedtest.net
 */

import React, { useState, useCallback, useEffect } from 'react';
import { EnhancedSpeedTestService, SpeedTestResults, SpeedProgressData, TestServer } from '../../services/EnhancedSpeedTestService';

const ProfessionalSpeedTest: React.FC = () => {
  console.log('🎯 ProfessionalSpeedTest component rendering...');

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SpeedProgressData | null>(null);
  const [results, setResults] = useState<SpeedTestResults | null>(null);
  const [selectedServer, setSelectedServer] = useState<TestServer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceReady, setServiceReady] = useState(false);
  const [speedTestService] = useState(() => {
    try {
      const service = new EnhancedSpeedTestService({
        downloadDuration: 10000,
        uploadDuration: 8000,
        parallelConnections: 4,
        overheadCompensation: 0.08,
        progressUpdateInterval: 100,
        enableServerSelection: true,
        enableProgressiveLoading: true
      });
      console.log('✅ EnhancedSpeedTestService created successfully');
      return service;
    } catch (error) {
      console.error('❌ Failed to create EnhancedSpeedTestService:', error);
      return null;
    }
  });

  // Check service readiness
  useEffect(() => {
    if (speedTestService) {
      setServiceReady(true);
    } else {
      setError('Speed test service failed to initialize');
    }
  }, [speedTestService]);

  const startTest = useCallback(async () => {
    if (isRunning) return;

    // Safety check
    if (!speedTestService) {
      setError('Speed test service not available');
      return;
    }

    setIsRunning(true);
    setProgress(null);
    setResults(null);
    setSelectedServer(null);
    setError(null);

    try {
      const testResults = await speedTestService.start({
        onProgress: (progressData) => {
          setProgress(progressData);
        },
        onServerSelected: (server) => {
          setSelectedServer(server);
        },
        onComplete: (finalResults) => {
          setResults(finalResults);
        },
        onError: (err) => {
          console.error('Speed test error:', err);
          const errorMessage = err instanceof Error ? err.message :
                              typeof err === 'string' ? err :
                              JSON.stringify(err);
          setError(errorMessage || 'Speed test failed');
        }
      });

      console.log('Professional speed test completed:', testResults);
    } catch (err) {
      console.error('Speed test catch error:', err);
      const errorMessage = err instanceof Error ? err.message :
                          typeof err === 'string' ? err :
                          JSON.stringify(err);
      setError(errorMessage || 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, speedTestService]);

  const stopTest = useCallback(() => {
    try {
      if (speedTestService) {
        speedTestService.stop();
      }
      setIsRunning(false);
    } catch (error) {
      console.error('Error stopping speed test:', error);
      setIsRunning(false);
    }
  }, [speedTestService]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FF9800';
      case 'poor': return '#FF5722';
      case 'very-poor': return '#F44336';
      default: return '#757575';
    }
  };

  const formatSpeed = (speed: number) => {
    return speed >= 1000 ? `${(speed / 1000).toFixed(1)} Gbps` : `${speed.toFixed(1)} Mbps`;
  };

  try {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          🚀 Professional Speed Test
        </h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>✨ Enhanced Features:</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>🔍 <strong>Smart Server Selection</strong> - Tests multiple servers, picks the best</li>
          <li>📊 <strong>Progressive File Sizes</strong> - Adapts test size based on connection speed</li>
          <li>🔄 <strong>Multiple Parallel Connections</strong> - Uses 4 simultaneous connections</li>
          <li>⚡ <strong>Real-Time Progress Updates</strong> - Updates every 100ms like Speedtest.net</li>
          <li>🛠️ <strong>Overhead Compensation</strong> - Accounts for TCP/HTTP overhead (8%)</li>
          <li>📈 <strong>Advanced Metrics</strong> - Peak speed, stability, jitter analysis</li>
        </ul>
      </div>

      {/* Server Selection Status */}
      {selectedServer && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #4CAF50'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2E7D32' }}>
            🌐 Selected Server
          </h4>
          <p style={{ margin: 0 }}>
            <strong>{selectedServer.name}</strong> ({selectedServer.location})
            {selectedServer.latency && (
              <span style={{ marginLeft: '10px', color: '#666' }}>
                Latency: {selectedServer.latency.toFixed(1)}ms
              </span>
            )}
          </p>
        </div>
      )}

      {/* Progress Display */}
      {progress && (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
              {progress.type === 'server-selection' ? '🔍 Server Selection' :
               progress.type === 'latency' ? '🏓 Latency Test' :
               progress.type === 'download' ? '⬇️ Download Test' :
               progress.type === 'upload' ? '⬆️ Upload Test' : progress.type}
            </h4>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {progress.phase}
            </span>
          </div>
          
          <div style={{ 
            width: '100%', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            <div style={{ 
              width: `${progress.progress}%`, 
              height: '8px', 
              backgroundColor: '#2196F3',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {progress.type === 'download' || progress.type === 'upload' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                  {formatSpeed(progress.speed)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Current Speed</div>
              </div>
              {progress.avgSpeed && (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>
                    {formatSpeed(progress.avgSpeed)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Average Speed</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>
                  {(progress.bytesTransferred / 1024 / 1024).toFixed(1)} MB
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Data Transferred</div>
              </div>
              {progress.connections && (
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>
                    {progress.connections}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Connections</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '16px', color: '#666' }}>
              {progress.progress.toFixed(1)}% complete
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
            📊 Test Results
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: getQualityColor(results.quality.download) }}>
                {formatSpeed(results.download.speed)}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Download</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Peak: {formatSpeed(results.download.peakSpeed)} | Stability: {results.download.stability.toFixed(0)}%
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: getQualityColor(results.quality.upload) }}>
                {formatSpeed(results.upload.speed)}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Upload</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Peak: {formatSpeed(results.upload.peakSpeed)} | Stability: {results.upload.stability.toFixed(0)}%
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: getQualityColor(results.quality.latency) }}>
                {results.latency.toFixed(0)}ms
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Latency</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Jitter: {results.jitter.toFixed(1)}ms
              </div>
            </div>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '15px',
            backgroundColor: getQualityColor(results.quality.overall),
            color: 'white',
            borderRadius: '8px',
            textTransform: 'capitalize',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Overall Quality: {results.quality.overall.replace('-', ' ')}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f44336',
          color: '#c62828'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ textAlign: 'center' }}>
        {!serviceReady ? (
          <div style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            color: '#c62828',
            marginBottom: '20px'
          }}>
            ⚠️ Speed test service is initializing...
          </div>
        ) : !isRunning ? (
          <button
            onClick={startTest}
            disabled={!serviceReady}
            style={{
              backgroundColor: serviceReady ? '#2196F3' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: serviceReady ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            🚀 Start Professional Speed Test
          </button>
        ) : (
          <button
            onClick={stopTest}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Test
          </button>
        )}
      </div>
    </div>
  );
  } catch (renderError) {
    console.error('❌ Component render error:', renderError);
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        color: '#c62828'
      }}>
        <h2>⚠️ Component Error</h2>
        <p>There was an error rendering the Professional Speed Test component.</p>
        <p>Error: {renderError instanceof Error ? renderError.message : String(renderError)}</p>
      </div>
    );
  }
};

export default ProfessionalSpeedTest;
