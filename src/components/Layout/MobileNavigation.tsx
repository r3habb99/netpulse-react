/**
 * NetPulse Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 */

import React from 'react';
import { NavigationProps } from '../../types';
import '../../styles/components/Animations.css';
import '../../styles/components/MobileNavigation.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: string;
}

const MobileNavigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  hasNewResults = false
}) => {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      view: 'home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      )
    },
    {
      id: 'dashboard',
      label: 'Monitor',
      view: 'dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        </svg>
      )
    },
    {
      id: 'test',
      label: 'Test',
      view: 'test',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )
    },
    {
      id: 'results',
      label: 'Results',
      view: 'results',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      )
    }
  ];

  const handleNavClick = (view: string) => {
    onViewChange(view);
  };

  return (
    <nav className="mobile-nav slide-up">
      {navItems.map((item, index) => (
        <button
          key={item.id}
          className={`mobile-nav-item mobile-touch-feedback ${currentView === item.view ? 'active' : ''} fade-in stagger-${index + 1}`}
          onClick={() => handleNavClick(item.view)}
          aria-label={item.label}
        >
          <div className="mobile-nav-icon">
            {item.icon}
          </div>
          <div className="mobile-nav-label">
            {item.label}
          </div>
          {item.id === 'results' && hasNewResults && (
            <div className="mobile-nav-badge bounce">
              1
            </div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default MobileNavigation;
