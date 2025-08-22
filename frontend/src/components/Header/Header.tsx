import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSurebet } from '../../contexts/SurebetContext';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { isConnected, arbers, statistics } = useSurebet();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/arbers', label: 'Arbers', icon: '🤖' },
    { path: '/opportunities', label: 'Opportunités', icon: '💰' },
    { path: '/statistics', label: 'Statistiques', icon: '📈' },
    { path: '/settings', label: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            <img src="/surebet-logo.png" alt="Surebet" className="logo-image" />
            <span className="logo-text">Surebet</span>
          </Link>

          <div className="connection-status">
            <div
              className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}
            >
              <span className="status-dot"></span>
              <span className="status-text">
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{arbers.length}</span>
              <span className="stat-label">Arbers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {statistics.totalOpportunities}
              </span>
              <span className="stat-label">Opportunités</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {statistics.totalPotentialProfit.toFixed(2)}€
              </span>
              <span className="stat-label">Profit potentiel</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
