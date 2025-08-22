import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSurebet } from '../../contexts/SurebetContext';
import { ArberStatus } from '../../types';
import LoadingSpinner from '../UI/LoadingSpinner';
import './ArbersList.css';

const ArbersList: React.FC = () => {
  const { arbers, isLoading, pauseArber, resumeArber, closeArber } =
    useSurebet();
  const [filter, setFilter] = useState<'all' | ArberStatus>('all');

  const filteredArbers = arbers.filter((arber) => {
    if (filter === 'all') return true;
    return arber.status === filter;
  });

  const handleAction = (
    arberId: string,
    action: 'pause' | 'resume' | 'close',
  ) => {
    switch (action) {
      case 'pause':
        pauseArber(arberId);
        break;
      case 'resume':
        resumeArber(arberId);
        break;
      case 'close':
        if (window.confirm('Êtes-vous sûr de vouloir fermer cet arber ?')) {
          closeArber(arberId);
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="arbers-loading">
        <LoadingSpinner size="large" text="Chargement des arbers..." />
      </div>
    );
  }

  return (
    <div className="arbers-list">
      <div className="arbers-header">
        <div className="header-content">
          <h1>Gestion des Arbers</h1>
          <p>Surveillez et contrôlez vos agents d'arbitrage en temps réel</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <span>➕</span>
            Créer un Arber
          </button>
        </div>
      </div>

      <div className="arbers-controls">
        <div className="filter-controls">
          <label>Filtrer par statut:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | ArberStatus)}
            className="filter-select"
          >
            <option value="all">Tous les arbers</option>
            <option value={ArberStatus.Running}>En cours</option>
            <option value={ArberStatus.Paused}>En pause</option>
            <option value={ArberStatus.Postulating}>Postulant</option>
            <option value={ArberStatus.Placing}>Plaçant</option>
            <option value={ArberStatus.Closed}>Fermés</option>
          </select>
        </div>

        <div className="stats-summary">
          <span className="stat">
            Total: <strong>{arbers.length}</strong>
          </span>
          <span className="stat">
            Actifs:{' '}
            <strong>
              {
                arbers.filter((a) =>
                  [
                    ArberStatus.Running,
                    ArberStatus.Postulating,
                    ArberStatus.Placing,
                  ].includes(a.status),
                ).length
              }
            </strong>
          </span>
          <span className="stat">
            En pause:{' '}
            <strong>
              {arbers.filter((a) => a.status === ArberStatus.Paused).length}
            </strong>
          </span>
        </div>
      </div>

      <div className="arbers-grid">
        {filteredArbers.length > 0 ? (
          filteredArbers.map((arber) => (
            <div key={arber.id} className="arber-card">
              <div className="arber-card-header">
                <div className="arber-info">
                  <h3 className="arber-name">{arber.name}</h3>
                  <span
                    className={`status-badge status-${arber.status.toLowerCase()}`}
                  >
                    {arber.status}
                  </span>
                </div>
                <div className="arber-id">#{arber.id.substring(0, 8)}</div>
              </div>

              <div className="arber-card-content">
                <div className="arber-stats">
                  <div className="stat-item">
                    <div className="stat-label">Investissement</div>
                    <div className="stat-value">
                      {arber.investment.amount} {arber.investment.currency}
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Bookies</div>
                    <div className="stat-value">{arber.bookies.length}</div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Opportunités</div>
                    <div className="stat-value">
                      {arber.opportunities?.length || 0}
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Créé le</div>
                    <div className="stat-value">
                      {new Date(arber.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {arber.opportunities && arber.opportunities.length > 0 && (
                  <div className="recent-opportunities">
                    <h4>Dernières opportunités</h4>
                    <div className="opportunities-preview">
                      {arber.opportunities
                        .slice(-3)
                        .map((opportunity, index) => (
                          <div key={index} className="opportunity-preview">
                            <span className="opportunity-title">
                              {opportunity.bet?.title || 'Opportunité'}
                            </span>
                            <span className="opportunity-profit">
                              +{opportunity.profit} {opportunity.currency}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="arber-card-actions">
                <div className="action-buttons">
                  {arber.status === ArberStatus.Running && (
                    <button
                      onClick={() => handleAction(arber.id, 'pause')}
                      className="btn btn-warning btn-sm"
                      title="Mettre en pause"
                    >
                      ⏸️ Pause
                    </button>
                  )}

                  {arber.status === ArberStatus.Paused && (
                    <button
                      onClick={() => handleAction(arber.id, 'resume')}
                      className="btn btn-success btn-sm"
                      title="Reprendre"
                    >
                      ▶️ Reprendre
                    </button>
                  )}

                  {arber.status !== ArberStatus.Closed && (
                    <button
                      onClick={() => handleAction(arber.id, 'close')}
                      className="btn btn-danger btn-sm"
                      title="Fermer"
                    >
                      ⏹️ Fermer
                    </button>
                  )}

                  <Link
                    to={`/arbers/${arber.id}`}
                    className="btn btn-primary btn-sm"
                    title="Voir les détails"
                  >
                    👁️ Détails
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h3>Aucun arber trouvé</h3>
            <p>
              {filter === 'all'
                ? "Vous n'avez pas encore créé d'arber."
                : `Aucun arber avec le statut "${filter}" trouvé.`}
            </p>
            <button className="btn btn-primary btn-lg">
              <span>➕</span>
              Créer votre premier arber
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArbersList;
