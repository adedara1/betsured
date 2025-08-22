import React, { useEffect } from 'react';
import { useSurebet } from '../../contexts/SurebetContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { arbers, statistics, isLoading, isConnected, refreshData } =
    useSurebet();

  useEffect(() => {
    if (isConnected) {
      refreshData();
    }
  }, [isConnected, refreshData]);

  const activeArbers = arbers.filter(
    (arber) =>
      arber.status === 'Running' ||
      arber.status === 'Postulating' ||
      arber.status === 'Placing',
  );

  const recentOpportunities = arbers
    .flatMap((arber) => arber.opportunities || [])
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord Surebet</h1>
        <p>Vue d'ensemble de vos opportunités d'arbitrage en temps réel</p>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <div className="stat-number">{arbers.length}</div>
            <div className="stat-label">Arbers Total</div>
            <div className="stat-sublabel">{activeArbers.length} actifs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{statistics.totalOpportunities}</div>
            <div className="stat-label">Opportunités</div>
            <div className="stat-sublabel">
              {statistics.profitableOpportunities} rentables
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">
              {statistics.totalPotentialProfit.toFixed(2)}€
            </div>
            <div className="stat-label">Profit Potentiel</div>
            <div className="stat-sublabel">
              {statistics.averageProfit.toFixed(2)}€ en moyenne
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">
              {statistics.successRate.toFixed(1)}%
            </div>
            <div className="stat-label">Taux de Succès</div>
            <div className="stat-sublabel">Performance globale</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Arbers actifs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Arbers Actifs</h2>
            <Link to="/arbers" className="btn btn-outline btn-sm">
              Voir tous
            </Link>
          </div>

          <div className="active-arbers">
            {activeArbers.length > 0 ? (
              activeArbers.map((arber) => (
                <div key={arber.id} className="arber-card">
                  <div className="arber-header">
                    <h3>{arber.name}</h3>
                    <span
                      className={`status-badge status-${arber.status.toLowerCase()}`}
                    >
                      {arber.status}
                    </span>
                  </div>
                  <div className="arber-details">
                    <div className="detail">
                      <span className="label">Investissement:</span>
                      <span className="value">
                        {arber.investment.amount} {arber.investment.currency}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Bookies:</span>
                      <span className="value">{arber.bookies.length}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Opportunités:</span>
                      <span className="value">
                        {arber.opportunities?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="arber-actions">
                    <Link
                      to={`/arbers/${arber.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <p>Aucun arber actif pour le moment</p>
                <Link to="/arbers" className="btn btn-primary">
                  Créer un arber
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Opportunités récentes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Opportunités Récentes</h2>
            <Link to="/opportunities" className="btn btn-outline btn-sm">
              Voir toutes
            </Link>
          </div>

          <div className="opportunities-list">
            {recentOpportunities.length > 0 ? (
              recentOpportunities.map((opportunity, index) => (
                <div key={index} className="opportunity-card">
                  <div className="opportunity-header">
                    <div className="bet-title">{opportunity.bet.title}</div>
                    <div className="profit-info">
                      <span className="profit-amount">
                        +{opportunity.profit}€
                      </span>
                      <span className="profit-margin">
                        (
                        {(
                          (parseFloat(opportunity.profit) /
                            parseFloat(opportunity.stake)) *
                          100
                        ).toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>

                  <div className="opportunity-details">
                    <div className="bookie-info">
                      <span className="bookie-name">
                        {opportunity.bookie.name}
                      </span>
                      <span className="odds">Cote: {opportunity.bet.odds}</span>
                    </div>
                    <div className="stake-info">
                      <span className="stake">Mise: {opportunity.stake}€</span>
                      <span className="winnings">
                        Gains: {opportunity.winnings}€
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <p>Aucune opportunité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* État de connexion */}
      {!isConnected && (
        <div className="connection-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Connexion perdue</strong>
              <p>
                La connexion avec le backend Surebet a été perdue. Les données
                peuvent ne pas être à jour.
              </p>
            </div>
            <button onClick={refreshData} className="btn btn-primary btn-sm">
              Reconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
