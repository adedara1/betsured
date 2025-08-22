import React, { useMemo } from 'react';
import { useSurebet } from '../../contexts/SurebetContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Statistics.css';

const Statistics: React.FC = () => {
  const { arbers, statistics, isLoading } = useSurebet();

  const detailedStats = useMemo(() => {
    const allOpportunities = arbers.flatMap((arber) =>
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

    const viableOpportunities = allOpportunities.filter((opp) => opp.viable);
    const profitableOpportunities = allOpportunities.filter(
      (opp) => opp.profit > 0,
    );

    const totalStake = allOpportunities.reduce(
      (sum, opp) => sum + opp.stake,
      0,
    );
    const totalWinnings = allOpportunities.reduce(
      (sum, opp) => sum + opp.winnings,
      0,
    );
    const totalProfit = allOpportunities.reduce(
      (sum, opp) => sum + opp.profit,
      0,
    );

    const averageOdds =
      allOpportunities.length > 0
        ? allOpportunities.reduce((sum, opp) => sum + (opp.bet?.odds || 0), 0) /
          allOpportunities.length
        : 0;

    const averageStake =
      allOpportunities.length > 0 ? totalStake / allOpportunities.length : 0;
    const averageProfit =
      profitableOpportunities.length > 0
        ? totalProfit / profitableOpportunities.length
        : 0;

    const bestOpportunity = allOpportunities.reduce(
      (best, current) => (current.profit > best.profit ? current : best),
      { profit: 0, bet: { title: 'N/A' }, bookie: { name: 'N/A' } } as any,
    );

    const worstOpportunity = allOpportunities.reduce(
      (worst, current) => (current.profit < worst.profit ? current : worst),
      { profit: 0, bet: { title: 'N/A' }, bookie: { name: 'N/A' } } as any,
    );

    // Statistiques par bookie
    const bookieStats = allOpportunities.reduce(
      (acc, opp) => {
        const bookieName = opp.bookie?.name || 'Inconnu';
        if (!acc[bookieName]) {
          acc[bookieName] = {
            count: 0,
            totalProfit: 0,
            viableCount: 0,
            profitableCount: 0,
          };
        }
        acc[bookieName].count++;
        acc[bookieName].totalProfit += opp.profit;
        if (opp.viable) acc[bookieName].viableCount++;
        if (opp.profit > 0) acc[bookieName].profitableCount++;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Statistiques par arber
    const arberStats = arbers.map((arber) => {
      const arberOpportunities = arber.opportunities || [];
      const arberProfitableOpps = arberOpportunities.filter(
        (opp) => parseFloat(opp.profit || '0') > 0,
      );
      const arberProfit = arberOpportunities.reduce(
        (sum, opp) => sum + parseFloat(opp.profit || '0'),
        0,
      );

      return {
        id: arber.id,
        name: arber.name,
        status: arber.status,
        investment: arber.investment,
        opportunitiesCount: arberOpportunities.length,
        profitableCount: arberProfitableOpps.length,
        totalProfit: arberProfit,
        successRate:
          arberOpportunities.length > 0
            ? (arberProfitableOpps.length / arberOpportunities.length) * 100
            : 0,
      };
    });

    return {
      allOpportunities,
      viableOpportunities,
      profitableOpportunities,
      totalStake,
      totalWinnings,
      totalProfit,
      averageOdds,
      averageStake,
      averageProfit,
      bestOpportunity,
      worstOpportunity,
      bookieStats,
      arberStats,
    };
  }, [arbers]);

  if (isLoading) {
    return (
      <div className="statistics-loading">
        <LoadingSpinner size="large" text="Chargement des statistiques..." />
      </div>
    );
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <h1>Statistiques détaillées</h1>
        <p>Analyse complète de vos performances d'arbitrage</p>
      </div>

      {/* Statistiques générales */}
      <div className="stats-section">
        <h2>Vue d'ensemble</h2>
        <div className="stats-grid-main">
          <div className="stat-card large">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">
                {detailedStats.allOpportunities.length}
              </div>
              <div className="stat-label">Opportunités totales</div>
              <div className="stat-sublabel">
                {detailedStats.viableOpportunities.length} viables,{' '}
                {detailedStats.profitableOpportunities.length} rentables
              </div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-number">
                {detailedStats.totalProfit.toFixed(2)}€
              </div>
              <div className="stat-label">Profit total</div>
              <div className="stat-sublabel">
                {detailedStats.averageProfit.toFixed(2)}€ en moyenne
              </div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">
                {detailedStats.allOpportunities.length > 0
                  ? (
                      (detailedStats.profitableOpportunities.length /
                        detailedStats.allOpportunities.length) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="stat-label">Taux de succès</div>
              <div className="stat-sublabel">Opportunités rentables</div>
            </div>
          </div>

          <div className="stat-card large">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">
                {detailedStats.averageOdds.toFixed(2)}
              </div>
              <div className="stat-label">Cote moyenne</div>
              <div className="stat-sublabel">Sur toutes les opportunités</div>
            </div>
          </div>
        </div>
      </div>

      {/* Meilleure et pire opportunité */}
      <div className="extremes-section">
        <div className="extreme-card best">
          <div className="extreme-header">
            <h3>🏆 Meilleure opportunité</h3>
          </div>
          <div className="extreme-content">
            <div className="extreme-value">
              +{detailedStats.bestOpportunity.profit.toFixed(2)}€
            </div>
            <div className="extreme-details">
              <div>{detailedStats.bestOpportunity.bet?.title}</div>
              <div>{detailedStats.bestOpportunity.bookie?.name}</div>
            </div>
          </div>
        </div>

        <div className="extreme-card worst">
          <div className="extreme-header">
            <h3>📉 Pire opportunité</h3>
          </div>
          <div className="extreme-content">
            <div className="extreme-value">
              {detailedStats.worstOpportunity.profit.toFixed(2)}€
            </div>
            <div className="extreme-details">
              <div>{detailedStats.worstOpportunity.bet?.title}</div>
              <div>{detailedStats.worstOpportunity.bookie?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par arber */}
      <div className="arber-stats-section">
        <h2>Performance par arber</h2>
        <div className="arber-stats-table">
          <table className="table">
            <thead>
              <tr>
                <th>Arber</th>
                <th>Statut</th>
                <th>Investissement</th>
                <th>Opportunités</th>
                <th>Rentables</th>
                <th>Profit total</th>
                <th>Taux de succès</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {detailedStats.arberStats.map((arber) => {
                const roi =
                  arber.investment.amount > 0
                    ? (arber.totalProfit / arber.investment.amount) * 100
                    : 0;

                return (
                  <tr key={arber.id}>
                    <td>
                      <div className="arber-info">
                        <div className="arber-name">{arber.name}</div>
                        <div className="arber-id">
                          #{arber.id.substring(0, 8)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${arber.status.toLowerCase()}`}
                      >
                        {arber.status}
                      </span>
                    </td>
                    <td className="amount">
                      {arber.investment.amount} {arber.investment.currency}
                    </td>
                    <td className="count">{arber.opportunitiesCount}</td>
                    <td className="count">{arber.profitableCount}</td>
                    <td
                      className={`amount ${arber.totalProfit >= 0 ? 'positive' : 'negative'}`}
                    >
                      {arber.totalProfit >= 0 ? '+' : ''}
                      {arber.totalProfit.toFixed(2)}€
                    </td>
                    <td className="percentage">
                      {arber.successRate.toFixed(1)}%
                    </td>
                    <td
                      className={`percentage ${roi >= 0 ? 'positive' : 'negative'}`}
                    >
                      {roi >= 0 ? '+' : ''}
                      {roi.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques par bookie */}
      <div className="bookie-stats-section">
        <h2>Performance par bookmaker</h2>
        <div className="bookie-stats-grid">
          {Object.entries(detailedStats.bookieStats).map(
            ([bookieName, stats]) => (
              <div key={bookieName} className="bookie-stat-card">
                <div className="bookie-header">
                  <h3>{bookieName}</h3>
                </div>
                <div className="bookie-stats">
                  <div className="bookie-stat">
                    <div className="stat-value">{stats.count}</div>
                    <div className="stat-label">Opportunités</div>
                  </div>
                  <div className="bookie-stat">
                    <div className="stat-value">{stats.viableCount}</div>
                    <div className="stat-label">Viables</div>
                  </div>
                  <div className="bookie-stat">
                    <div className="stat-value">{stats.profitableCount}</div>
                    <div className="stat-label">Rentables</div>
                  </div>
                  <div className="bookie-stat">
                    <div
                      className={`stat-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`}
                    >
                      {stats.totalProfit >= 0 ? '+' : ''}
                      {stats.totalProfit.toFixed(2)}€
                    </div>
                    <div className="stat-label">Profit total</div>
                  </div>
                </div>
                <div className="bookie-success-rate">
                  Taux de succès:{' '}
                  {stats.count > 0
                    ? ((stats.profitableCount / stats.count) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Analyse des volumes */}
      <div className="volume-analysis-section">
        <h2>Analyse des volumes</h2>
        <div className="volume-stats">
          <div className="volume-card">
            <div className="volume-header">
              <h3>💵 Mise totale</h3>
            </div>
            <div className="volume-value">
              {detailedStats.totalStake.toFixed(2)}€
            </div>
            <div className="volume-average">
              Moyenne: {detailedStats.averageStake.toFixed(2)}€
            </div>
          </div>

          <div className="volume-card">
            <div className="volume-header">
              <h3>💰 Gains potentiels</h3>
            </div>
            <div className="volume-value">
              {detailedStats.totalWinnings.toFixed(2)}€
            </div>
            <div className="volume-average">
              Retour:{' '}
              {detailedStats.totalStake > 0
                ? (
                    (detailedStats.totalWinnings / detailedStats.totalStake) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>

          <div className="volume-card">
            <div className="volume-header">
              <h3>📈 Profit net</h3>
            </div>
            <div
              className={`volume-value ${detailedStats.totalProfit >= 0 ? 'positive' : 'negative'}`}
            >
              {detailedStats.totalProfit >= 0 ? '+' : ''}
              {detailedStats.totalProfit.toFixed(2)}€
            </div>
            <div className="volume-average">
              Marge:{' '}
              {detailedStats.totalStake > 0
                ? (
                    (detailedStats.totalProfit / detailedStats.totalStake) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
