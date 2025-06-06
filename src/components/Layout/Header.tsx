/**
 * NetPulse Header Component
 * Application header with logo, title, and connection status
 */

import React from 'react';
import { HeaderProps } from '../../types';
import { NetworkStatus } from '../../utils/constants';
import { useConnection } from '../../hooks/useConnection';
import '../../styles/components/Animations.css';
import '../../styles/components/Header.css';

const Header: React.FC<HeaderProps> = ({
  title = 'NetPulse',
  connectionStatus,
  onRefresh
}) => {
  const { networkInfo } = useConnection();
  const getStatusClass = (status: NetworkStatus): string => {
    switch (status) {
      case 'connected':
        return 'connected';
      case 'slow':
        return 'slow';
      case 'limited':
        return 'limited';
      case 'disconnected':
      default:
        return 'disconnected';
    }
  };

  const getStatusText = (status: NetworkStatus): string => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'slow':
        return 'Slow';
      case 'limited':
        return 'Limited';
      case 'disconnected':
      default:
        return 'Offline';
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <header className="app-header fade-in-down">
      <div className="container">
        <div className="header-content flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="logo-section fade-in-left">
            <div className="logo hover-scale">
              <img
                src="/NetPulseIcon.jpg"
                alt="NetPulse Logo"
                width="32"
                height="32"
              />
            </div>
            <h1 className="app-title">{title}</h1>
          </div>

          {/* Header Actions */}
          <div className="header-actions fade-in-right">
            {/* Enhanced Connection Status */}
            <div className="connection-status hover-lift">
              <div className={`connection-status-icon ${getStatusClass(connectionStatus)}`} />
              <div className="connection-info">
                <span className="connection-text">
                  {getStatusText(connectionStatus)}
                </span>
                {networkInfo && networkInfo.connectionType !== 'Unknown' && (
                  <span className="connection-type">{networkInfo.connectionType}</span>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                className="refresh-btn mobile-touch-feedback hover-scale"
                aria-label="Refresh connection"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
