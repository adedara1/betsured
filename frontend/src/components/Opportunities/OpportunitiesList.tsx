import React, { useState, useMemo } from 'react';
import { useSurebet } from '../../contexts/SurebetContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import './OpportunitiesList.css';

const OpportunitiesList: React.FC = () => {
  const { arbers, isLoading } = useSurebet();
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'stake' | 'date'>(
    'profit',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'viable' | 'profitable'>(
    'all',
  );
  const [searchTerm, setSearchTerm] = useState('');

  const allOpportunities = useMemo(() => {
    return arbers.flatMap((arber) =>
      (arber.opportunities || []).map((opp) => ({
        ...opp,
        arberId: arber.id,
        arberName: arber.name,
        profit: parseFloat(opp.profit || '0'),
        stake: parseFloat(opp.stake || '0'),
        winnings: parseFloat(opp.winnings || '0'),
        margin:
          parseFloat(opp.stake || '0') > 0
            ? (parseFloat(opp.profit || '0') / parseFloat(opp.stake || '0')) *
              100
            : 0,
      })),
    );
  }, [arbers]);

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = allOpportunities;

    // Filtrage
    if (filterBy === 'viable') {
      filtered = filtered.filter((opp) => opp.viable);
    } else if (filterBy === 'profitable') {
      filtered = filtered.filter((opp) => opp.profit > 0);
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.bet?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.bookie?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.arberName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'profit':
          aValue = a.profit;
          bValue = b.profit;
          break;
        case 'margin':
          aValue = a.margin;
          bValue = b.margin;
          break;
        case 'stake':
          aValue = a.stake;
          bValue = b.stake;
          break;
        case 'date':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = a.profit;
          bValue = b.profit;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [allOpportunities, sortBy, sortOrder, filterBy, searchTerm]);

  const statistics = useMemo(() => {
    const total = allOpportunities.length;
    const viable = allOpportunities.filter((opp) => opp.viable).length;
    const profitable = allOpportunities.filter((opp) => opp.profit > 0).length;
    const totalProfit = allOpportunities.reduce(
      (sum, opp) => sum + opp.profit,
      0,
    );
    const totalStake = allOpportunities.reduce(
      (sum, opp) => sum + opp.stake,
      0,
    );
    const averageProfit = profitable > 0 ? totalProfit / profitable : 0;
    const successRate = total > 0 ? (profitable / total) * 100 : 0;

    return {
      total,
      viable,
      profitable,
      totalProfit,
      totalStake,
      averageProfit,
      successRate,
    };
  }, [allOpportunities]);

  if (isLoading) {
    return (
      <div className="opportunities-loading">
        <LoadingSpinner size="large" text="Chargement des opportunités..." />
      </div>
    );
  }

  return (
    <div className="opportunities-list">
      <div className="opportunities-header">
        <div className="header-content">
          <h1>Opportunités d'arbitrage</h1>
          <p>Toutes les opportunités détectées par vos arbers</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="opportunities-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{statistics.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{statistics.viable}</div>
            <div className="stat-label">Viables</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{statistics.profitable}</div>
            <div className="stat-label">Rentables</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-number">
              {statistics.totalProfit.toFixed(2)}€
            </div>
            <div className="stat-label">Profit total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">
              {statistics.successRate.toFixed(1)}%
            </div>
            <div className="stat-label">Taux de succès</div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="opportunities-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher une opportunité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Toutes les opportunités</option>
            <option value="viable">Opportunités viables</option>
            <option value="profitable">Opportunités rentables</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="sort-select"
          >
            <option value="profit-desc">Profit (décroissant)</option>
            <option value="profit-asc">Profit (croissant)</option>
            <option value="margin-desc">Marge (décroissante)</option>
            <option value="margin-asc">Marge (croissante)</option>
            <option value="stake-desc">Mise (décroissante)</option>
            <option value="stake-asc">Mise (croissante)</option>
            <option value="date-desc">Date (récent d'abord)</option>
            <option value="date-asc">Date (ancien d'abord)</option>
          </select>
        </div>
      </div>

      {/* Liste des opportunités */}
      <div className="opportunities-content">
        {filteredAndSortedOpportunities.length > 0 ? (
          <div className="opportunities-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Arber</th>
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
                {filteredAndSortedOpportunities.map((opportunity, index) => (
                  <tr
                    key={`${opportunity.arberId}-${index}`}
                    className={`
                      ${opportunity.viable ? 'viable' : 'not-viable'}
                      ${opportunity.profit > 0 ? 'profitable' : ''}
                    `}
                  >
                    <td className="event-cell">
                      <div className="event-title">
                        {opportunity.bet?.title || 'Événement inconnu'}
                      </div>
                      {opportunity.bet?.exchangeType && (
                        <div className="exchange-type">
                          {opportunity.bet.exchangeType}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="arber-info">
                        <div className="arber-name">
                          {opportunity.arberName}
                        </div>
                        <div className="arber-id">
                          #{opportunity.arberId.substring(0, 8)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="bookie-badge">
                        {opportunity.bookie?.name || 'Inconnu'}
                      </span>
                    </td>

                    <td className="odds-cell">
                      {opportunity.bet?.odds?.toFixed(2) || '-'}
                    </td>

                    <td className="amount-cell">
                      {opportunity.stake.toFixed(2)} {opportunity.currency}
                    </td>

                    <td className="amount-cell">
                      {opportunity.winnings.toFixed(2)} {opportunity.currency}
                    </td>

                    <td
                      className={`profit-cell ${opportunity.profit >= 0 ? 'positive' : 'negative'}`}
                    >
                      {opportunity.profit >= 0 ? '+' : ''}
                      {opportunity.profit.toFixed(2)} {opportunity.currency}
                    </td>

                    <td
                      className={`margin-cell ${opportunity.margin >= 0 ? 'positive' : 'negative'}`}
                    >
                      {opportunity.margin >= 0 ? '+' : ''}
                      {opportunity.margin.toFixed(2)}%
                    </td>

                    <td>
                      <div className="status-badges">
                        <span
                          className={`status-badge ${opportunity.viable ? 'status-viable' : 'status-not-viable'}`}
                        >
                          {opportunity.viable ? 'Viable' : 'Non viable'}
                        </span>
                        {opportunity.profit > 0 && (
                          <span className="status-badge status-profitable">
                            Rentable
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-opportunities">
            <div className="empty-icon">🔍</div>
            <h3>Aucune opportunité trouvée</h3>
            <p>
              {searchTerm
                ? `Aucune opportunité ne correspond à "${searchTerm}"`
                : filterBy === 'all'
                  ? "Aucune opportunité d'arbitrage n'a été détectée pour le moment"
                  : `Aucune opportunité ${filterBy === 'viable' ? 'viable' : 'rentable'} trouvée`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-primary"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      {/* Résumé des résultats */}
      {filteredAndSortedOpportunities.length > 0 && (
        <div className="results-summary">
          <p>
            Affichage de{' '}
            <strong>{filteredAndSortedOpportunities.length}</strong>{' '}
            opportunité(s)
            {searchTerm && ` correspondant à "${searchTerm}"`}
            {filterBy !== 'all' && ` (${filterBy})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesList;
