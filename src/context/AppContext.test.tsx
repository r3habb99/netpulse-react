import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { state } = useAppContext();
  return (
    <div>
      <span data-testid="current-view">{state.currentView}</span>
      <span data-testid="connection-status">{state.connection.status}</span>
      <span data-testid="test-status">{state.test.status}</span>
    </div>
  );
};

describe('AppContext', () => {
  test('provides initial state correctly', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('current-view').textContent).toBe('home');
    expect(screen.getByTestId('connection-status').textContent).toBe('disconnected');
    expect(screen.getByTestId('test-status').textContent).toBe('idle');
  });

  test('context provider renders children', () => {
    render(
      <AppProvider>
        <div data-testid="test-child">Test Child</div>
      </AppProvider>
    );

    expect(screen.getByTestId('test-child')).toBeTruthy();
    expect(screen.getByTestId('test-child').textContent).toBe('Test Child');
  });

  test('useAppContext throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    const TestComponentOutsideProvider = () => {
      useAppContext();
      return <div>Should not render</div>;
    };

    expect(() => render(<TestComponentOutsideProvider />)).toThrow();

    // Restore console.error
    console.error = originalError;
  });
});
