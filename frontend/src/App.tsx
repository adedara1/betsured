import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { SurebetProvider, useSurebet } from './contexts/SurebetContext';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ArbersList from './components/Arbers/ArbersList';
import ArberDetail from './components/Arbers/ArberDetail';
import OpportunitiesList from './components/Opportunities/OpportunitiesList';
import Statistics from './components/Statistics/Statistics';
import Settings from './components/Settings/Settings';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';
import './App.css';

function AppContent() {
  const { connectWebSocket, isLoading, error, isConnected } = useSurebet();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  if (isLoading && !isConnected) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
        <p>Connexion au backend Surebet...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => window.location.reload()}>Actualiser</button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/arbers" element={<ArbersList />} />
          <Route path="/arbers/:id" element={<ArberDetail />} />
          <Route path="/opportunities" element={<OpportunitiesList />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SurebetProvider>
        <Router>
          <AppContent />
        </Router>
      </SurebetProvider>
    </ErrorBoundary>
  );
}

export default App;
