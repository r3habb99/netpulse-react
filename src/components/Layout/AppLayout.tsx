/**
 * NetPulse App Layout Component
 * Main layout wrapper with header, content area, and navigation
 */

import React from 'react';
import { Header, MobileNavigation } from './';
import { useAppContext } from '../../context/AppContext';
import { useConnection } from '../../hooks';
import '../../styles/components/SharedComponents.css';
import '../../styles/components/AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    state,
    setView,
    setTestAutoStart
  } = useAppContext();

  const { checkConnection } = useConnection();

  const handleViewChange = (view: string) => {
    // Reset auto-start flag when navigating to test view through navigation
    if (view === 'test' && state.test.autoStart) {
      setTestAutoStart(false);
    }
    setView(view);
  };

  const handleRefresh = async () => {
    // Use enhanced connection checking
    await checkConnection();
  };

  const hasNewResults = state.results.length > 0 && 
    state.results[0].timestamp > (Date.now() - 300000); // Last 5 minutes

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        title="NetPulse"
        connectionStatus={state.connection.status}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <main className="app-main">
        <div className="app-content">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation
        currentView={state.currentView}
        onViewChange={handleViewChange}
        hasNewResults={hasNewResults}
      />

      {/* Loading Overlay */}
      {state.ui.loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <div className="loading-text">Loading NetPulse...</div>
        </div>
      )}

      {/* Pull to Refresh Indicator */}
      {state.ui.showPullRefresh && (
        <div className="pull-refresh-indicator">
          <div className="pull-refresh-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {state.ui.fabVisible && state.currentView === 'home' && (
        <button
          className="floating-action-btn"
          onClick={() => {
            setView('test');
          }}
          aria-label="Start Quick Test"
        >
          <div className="fab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v10l7-5-7-5z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
};

export default AppLayout;
