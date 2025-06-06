import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/Layout';
import { HomeView, TestView, DashboardView, ResultsView } from './components/Views';
import { useAppContext } from './context/AppContext';
import './App.css';

// Main App Content Component
const AppContent: React.FC = () => {
  const { state } = useAppContext();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'home':
        return <HomeView />;
      case 'test':
        return <TestView />;
      case 'dashboard':
        return <DashboardView />;
      case 'results':
        return <ResultsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <AppLayout>
      {renderCurrentView()}
    </AppLayout>
  );
};

// Main App Component
function App() {
  return (
    <AppProvider>
      <div className="App">
        <AppContent />
      </div>
    </AppProvider>
  );
}

export default App;
