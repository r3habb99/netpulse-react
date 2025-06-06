/**
 * NetPulse Application Context
 * Global state management using React Context
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, NetworkTestResult, MonitoringSession, TestStatus, MonitoringStatus, NetworkStatus } from '../types';
import { setupGlobalErrorHandling } from '../utils';

// Initial state
const initialState: AppState = {
  currentView: 'home',
  
  connection: {
    status: 'disconnected',
    lastChecked: 0,
    backendConnected: false,
    networkAvailable: navigator.onLine
  },
  
  test: {
    status: 'idle',
    progress: {
      phase: 'initializing',
      percentage: 0,
      currentTest: '',
      estimatedTimeRemaining: 0
    },
    isRunning: false,
    autoStart: false
  },
  
  monitoring: {
    status: 'stopped',
    isActive: false
  },
  
  results: [],
  
  ui: {
    loading: false,
    showPullRefresh: false,
    fabVisible: false
  },
  
  preferences: {
    theme: 'auto',
    units: 'metric',
    autoStart: false,
    notifications: true
  }
};

// Action types
type AppAction =
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: NetworkStatus }
  | { type: 'SET_BACKEND_CONNECTION'; payload: boolean }
  | { type: 'SET_NETWORK_AVAILABLE'; payload: boolean }
  | { type: 'SET_TEST_STATUS'; payload: TestStatus }
  | { type: 'SET_TEST_PROGRESS'; payload: Partial<AppState['test']['progress']> }
  | { type: 'SET_TEST_RESULT'; payload: NetworkTestResult }
  | { type: 'SET_TEST_AUTO_START'; payload: boolean }
  | { type: 'SET_MONITORING_STATUS'; payload: MonitoringStatus }
  | { type: 'SET_MONITORING_SESSION'; payload: MonitoringSession | undefined }
  | { type: 'ADD_RESULT'; payload: NetworkTestResult }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_PULL_REFRESH'; payload: boolean }
  | { type: 'SET_FAB_VISIBLE'; payload: boolean }
  | { type: 'SET_PREFERENCES'; payload: Partial<AppState['preferences']> }
  | { type: 'RESET_STATE' };

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload as any
      };
    
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connection: {
          ...state.connection,
          status: action.payload,
          lastChecked: Date.now()
        }
      };
    
    case 'SET_BACKEND_CONNECTION':
      return {
        ...state,
        connection: {
          ...state.connection,
          backendConnected: action.payload
        }
      };
    
    case 'SET_NETWORK_AVAILABLE':
      return {
        ...state,
        connection: {
          ...state.connection,
          networkAvailable: action.payload
        }
      };
    
    case 'SET_TEST_STATUS':
      return {
        ...state,
        test: {
          ...state.test,
          status: action.payload,
          isRunning: action.payload === 'running'
        }
      };
    
    case 'SET_TEST_PROGRESS':
      return {
        ...state,
        test: {
          ...state.test,
          progress: {
            ...state.test.progress,
            ...action.payload
          }
        }
      };
    
    case 'SET_TEST_RESULT':
      return {
        ...state,
        test: {
          ...state.test,
          currentResult: action.payload,
          status: 'completed'
        }
      };

    case 'SET_TEST_AUTO_START':
      return {
        ...state,
        test: {
          ...state.test,
          autoStart: action.payload
        }
      };
    
    case 'SET_MONITORING_STATUS':
      return {
        ...state,
        monitoring: {
          ...state.monitoring,
          status: action.payload,
          isActive: action.payload === 'running'
        }
      };
    
    case 'SET_MONITORING_SESSION':
      return {
        ...state,
        monitoring: {
          ...state.monitoring,
          currentSession: action.payload
        }
      };
    
    case 'ADD_RESULT':
      return {
        ...state,
        results: [action.payload, ...state.results].slice(0, 50) // Keep last 50 results
      };
    
    case 'CLEAR_RESULTS':
      return {
        ...state,
        results: []
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload
        }
      };
    
    case 'SET_PULL_REFRESH':
      return {
        ...state,
        ui: {
          ...state.ui,
          showPullRefresh: action.payload
        }
      };
    
    case 'SET_FAB_VISIBLE':
      return {
        ...state,
        ui: {
          ...state.ui,
          fabVisible: action.payload
        }
      };
    
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setView: (view: string) => void;
  setConnectionStatus: (status: NetworkStatus) => void;
  setBackendConnection: (connected: boolean) => void;
  setTestStatus: (status: TestStatus) => void;
  setTestProgress: (progress: Partial<AppState['test']['progress']>) => void;
  setTestResult: (result: NetworkTestResult) => void;
  setTestAutoStart: (autoStart: boolean) => void;
  setMonitoringStatus: (status: MonitoringStatus) => void;
  setMonitoringSession: (session: MonitoringSession | undefined) => void;
  addResult: (result: NetworkTestResult) => void;
  clearResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setPullRefresh: (show: boolean) => void;
  setFabVisible: (visible: boolean) => void;
  setPreferences: (preferences: Partial<AppState['preferences']>) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Setup global error handling
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_NETWORK_AVAILABLE', payload: true });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
    };
    
    const handleOffline = () => {
      dispatch({ type: 'SET_NETWORK_AVAILABLE', payload: false });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load preferences from localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = localStorage.getItem('netpulse_preferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          dispatch({ type: 'SET_PREFERENCES', payload: preferences });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('netpulse_preferences', JSON.stringify(state.preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [state.preferences]);
  
  // Load test results from localStorage
  useEffect(() => {
    const loadResults = async () => {
      try {
        const saved = localStorage.getItem('netpulse_test_results');
        if (saved) {
          const results = JSON.parse(saved);
          results.forEach((result: NetworkTestResult) => {
            dispatch({ type: 'ADD_RESULT', payload: result });
          });
        }
      } catch (error) {
        console.error('Failed to load results:', error);
      }
    };
    
    loadResults();
  }, []);
  
  // Save results to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('netpulse_test_results', JSON.stringify(state.results));
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  }, [state.results]);
  
  // Convenience methods
  const setView = (view: string) => dispatch({ type: 'SET_VIEW', payload: view });
  const setConnectionStatus = (status: NetworkStatus) => dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
  const setBackendConnection = (connected: boolean) => dispatch({ type: 'SET_BACKEND_CONNECTION', payload: connected });
  const setTestStatus = (status: TestStatus) => dispatch({ type: 'SET_TEST_STATUS', payload: status });
  const setTestProgress = (progress: Partial<AppState['test']['progress']>) => dispatch({ type: 'SET_TEST_PROGRESS', payload: progress });
  const setTestResult = (result: NetworkTestResult) => dispatch({ type: 'SET_TEST_RESULT', payload: result });
  const setTestAutoStart = (autoStart: boolean) => dispatch({ type: 'SET_TEST_AUTO_START', payload: autoStart });
  const setMonitoringStatus = (status: MonitoringStatus) => dispatch({ type: 'SET_MONITORING_STATUS', payload: status });
  const setMonitoringSession = (session: MonitoringSession | undefined) => dispatch({ type: 'SET_MONITORING_SESSION', payload: session });
  const addResult = (result: NetworkTestResult) => dispatch({ type: 'ADD_RESULT', payload: result });
  const clearResults = () => dispatch({ type: 'CLEAR_RESULTS' });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | undefined) => dispatch({ type: 'SET_ERROR', payload: error });
  const setPullRefresh = (show: boolean) => dispatch({ type: 'SET_PULL_REFRESH', payload: show });
  const setFabVisible = (visible: boolean) => dispatch({ type: 'SET_FAB_VISIBLE', payload: visible });
  const setPreferences = (preferences: Partial<AppState['preferences']>) => dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  
  const contextValue: AppContextType = {
    state,
    dispatch,
    setView,
    setConnectionStatus,
    setBackendConnection,
    setTestStatus,
    setTestProgress,
    setTestResult,
    setTestAutoStart,
    setMonitoringStatus,
    setMonitoringSession,
    addResult,
    clearResults,
    setLoading,
    setError,
    setPullRefresh,
    setFabVisible,
    setPreferences
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
