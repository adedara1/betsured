import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSurebet } from '../../contexts/SurebetContext';
import { useArberUpdates } from '../../hooks/useRealTimeData';
import LoadingSpinner from '../UI/LoadingSpinner';
import './ArberDetail.css';

const ArberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { arbers, pauseArber, resumeArber, closeArber, updateInvestment } =
    useSurebet();
  const { status, opportunities, lastUpdate } = useArberUpdates(id || '');

  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    amount: 0,
    currency: 'EUR',
  });

  const arber = arbers.find((a) => a.id === id);

  useEffect(() => {
    if (arber) {
      setNewInvestment(arber.investment);
    }
  }, [arber]);

  if (!id) {
    return (
      <div className="arber-detail-error">
        <h2>ID d'arber manquant</h2>
        <Link to="/arbers" className="btn btn-primary">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (!arber) {
    return (
      <div className="arber-detail-loading">
        <LoadingSpinner
          size="large"
          text="Chargement des détails de l'arber..."
        />
      </div>
    );
  }

  const handleAction = (action: 'pause' | 'resume' | 'close') => {
    switch (action) {
      case 'pause':
        pauseArber(arber.id);
        break;
      case 'resume':
        resumeArber(arber.id);
        break;
      case 'close':
        if (
          window.confirm(
            'Êtes-vous sûr de vouloir fermer cet arber ? Cette action est irréversible.',
          )
        ) {
          closeArber(arber.id);
          navigate('/arbers');
        }
        break;
    }
  };

  const handleUpdateInvestment = () => {
    updateInvestment(arber.id, newInvestment);
    setShowInvestmentModal(false);
  };

  const totalProfit = (arber.opportunities || []).reduce(
    (sum, opp) => sum + parseFloat(opp.profit || '0'),
    0,
  );

  const profitableOpportunities = (arber.opportunities || []).filter(
    (opp) => parseFloat(opp.profit || '0') > 0,
  );

  return (
    <div className="arber-detail">
      <div className="arber-detail-header">
        <div className="header-left">
          <Link to="/arbers" className="back-button">
            ← Retour aux arbers
          </Link>
          <div className="arber-title">
            <h1>{arber.name}</h1>
            <span className="arber-id">#{arber.id}</span>
          </div>
          <span className={`status-badge status-${arber.status.toLowerCase()}`}>
            {arber.status}
          </span>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowInvestmentModal(true)}
            className="btn btn-outline"
          >
            💰 Modifier l'investissement
          </button>

          {arber.status === 'Running' && (
            <button
              onClick={() => handleAction('pause')}
              className="btn btn-warning"
            >
              ⏸️ Pause
            </button>
          )}

          {arber.status === 'Paused' && (
            <button
              onClick={() => handleAction('resume')}
              className="btn btn-success"
            >
              ▶️ Reprendre
            </button>
          )}

          <button
            onClick={() => handleAction('close')}
            className="btn btn-danger"
          >
            ⏹️ Fermer
          </button>
        </div>
      </div>

      <div className="arber-detail-content">
        {/* Informations générales */}
        <div className="info-section">
          <h2>Informations générales</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Statut actuel</label>
              <span className={`status-badge status-${status.toLowerCase()}`}>
                {status}
              </span>
            </div>

            <div className="info-item">
              <label>Investissement</label>
              <span className="investment-amount">
                {arber.investment.amount} {arber.investment.currency}
              </span>
            </div>

            <div className="info-item">
              <label>Bookies connectés</label>
              <span>{arber.bookies.length}</span>
            </div>

            <div className="info-item">
              <label>Créé le</label>
              <span>{new Date(arber.createdAt).toLocaleString()}</span>
            </div>

            <div className="info-item">
              <label>Dernière mise à jour</label>
              <span>{lastUpdate.toLocaleString()}</span>
            </div>

            <div className="info-item">
              <label>Profit total</label>
              <span
                className={`profit-amount ${totalProfit >= 0 ? 'positive' : 'negative'}`}
              >
                {totalProfit >= 0 ? '+' : ''}
                {totalProfit.toFixed(2)} EUR
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-section">
          <h2>Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">
                  {arber.opportunities?.length || 0}
                </div>
                <div className="stat-label">Opportunités détectées</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">
                  {profitableOpportunities.length}
                </div>
                <div className="stat-label">Opportunités rentables</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-number">
                  {arber.opportunities?.length
                    ? (
                        (profitableOpportunities.length /
                          arber.opportunities.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="stat-label">Taux de succès</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <div className="stat-number">
                  {profitableOpportunities.length
                    ? (totalProfit / profitableOpportunities.length).toFixed(2)
                    : 0}{' '}
                  EUR
                </div>
                <div className="stat-label">Profit moyen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunités récentes */}
        <div className="opportunities-section">
          <h2>Opportunités récentes</h2>
          {arber.opportunities && arber.opportunities.length > 0 ? (
            <div className="opportunities-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Événement</th>
                    <th>Bookie</th>
                    <th>Cote</th>
                    <th>Mise</th>
                    <th>Gains potentiels</th>
                    <th>Profit</th>
                    <th>Marge</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {arber.opportunities
                    .slice()
                    .reverse()
                    .map((opportunity, index) => {
                      const profitValue = parseFloat(opportunity.profit || '0');
                      const stakeValue = parseFloat(opportunity.stake || '0');
                      const margin =
                        stakeValue > 0 ? (profitValue / stakeValue) * 100 : 0;

                      return (
                        <tr
                          key={index}
                          className={profitValue > 0 ? 'profitable' : ''}
                        >
                          <td className="event-title">
                            {opportunity.bet?.title || 'Événement inconnu'}
                          </td>
                          <td>
                            <span className="bookie-name">
                              {opportunity.bookie?.name || 'Inconnu'}
                            </span>
                          </td>
                          <td className="odds">
                            {opportunity.bet?.odds || '-'}
                          </td>
                          <td className="stake">
                            {opportunity.stake} {opportunity.currency}
                          </td>
                          <td className="winnings">
                            {opportunity.winnings} {opportunity.currency}
                          </td>
                          <td
                            className={`profit ${profitValue >= 0 ? 'positive' : 'negative'}`}
                          >
                            {profitValue >= 0 ? '+' : ''}
                            {profitValue.toFixed(2)} {opportunity.currency}
                          </td>
                          <td
                            className={`margin ${margin >= 0 ? 'positive' : 'negative'}`}
                          >
                            {margin >= 0 ? '+' : ''}
                            {margin.toFixed(2)}%
                          </td>
                          <td>
                            <span
                              className={`status-badge ${opportunity.viable ? 'status-viable' : 'status-not-viable'}`}
                            >
                              {opportunity.viable ? 'Viable' : 'Non viable'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-opportunities">
              <div className="empty-icon">💰</div>
              <p>Aucune opportunité détectée pour le moment</p>
              <small>
                Les opportunités apparaîtront ici dès qu'elles seront détectées
                par l'arber.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Modal de modification d'investissement */}
      {showInvestmentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInvestmentModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier l'investissement</h3>
              <button
                className="modal-close"
                onClick={() => setShowInvestmentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="amount">Montant</label>
                <input
                  type="number"
                  id="amount"
                  value={newInvestment.amount}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency">Devise</label>
                <select
                  id="currency"
                  value={newInvestment.currency}
                  onChange={(e) =>
                    setNewInvestment({
                      ...newInvestment,
                      currency: e.target.value,
                    })
                  }
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowInvestmentModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateInvestment}
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArberDetail;
