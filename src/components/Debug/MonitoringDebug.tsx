/**
 * Monitoring Debug Component
 * Shows detailed debugging information for the monitoring system
 */

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useMonitoring } from '../../hooks';
import { useConnection } from '../../hooks';

const MonitoringDebug: React.FC = () => {
  const { state } = useAppContext();
  const { status, session, currentData, error } = useMonitoring();
  const connection = useConnection();

  const debugInfo = {
    // App State
    appState: {
      currentView: state.currentView,
      connection: state.connection,
      monitoring: state.monitoring,
      test: state.test
    },
    
    // Monitoring Hook State
    monitoringHook: {
      status,
      session: session ? {
        id: session.id,
        status: session.status,
        dataPointsCount: session.dataPoints.length,
        startTime: new Date(session.startTime).toISOString(),
        config: session.config
      } : null,
      currentData,
      error
    },
    
    // Connection Hook State
    connectionHook: {
      status: connection.status,
      isOnline: connection.isOnline,
      backendConnected: connection.backendConnected,
      lastChecked: new Date(connection.lastChecked).toISOString(),
      networkInfo: connection.networkInfo
    },
    
    // Browser State
    browser: {
      navigatorOnLine: navigator.onLine,
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      origin: window.location.origin,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '20px', 
      overflow: 'auto', 
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h2>🐛 Monitoring Debug Information</h2>
      <button 
        onClick={() => window.location.reload()} 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          padding: '10px', 
          backgroundColor: '#ff4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px' 
        }}
      >
        Close & Reload
      </button>
      
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <h3>🔧 Quick Actions</h3>
        <button 
          onClick={() => connection.checkConnection()} 
          style={{ margin: '5px', padding: '8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Force Connection Check
        </button>
        <button 
          onClick={() => console.log('Current state:', state)} 
          style={{ margin: '5px', padding: '8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Log State to Console
        </button>
      </div>
    </div>
  );
};

export default MonitoringDebug;
