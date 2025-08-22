import React, { useState } from 'react';
import { useSurebet } from '../../contexts/SurebetContext';
import { wsService } from '../../services/websocket';
import './Settings.css';

const Settings: React.FC = () => {
  const { isConnected, refreshData } = useSurebet();
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080');
  const [apiUrl, setApiUrl] = useState('http://localhost:3001');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [notifications, setNotifications] = useState({
    newOpportunities: true,
    arberStatusChanges: true,
    profitableOpportunities: true,
    connectionIssues: true,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  const handleReconnect = async () => {
    setIsConnecting(true);
    try {
      await wsService.connect();
      setTestMessage('Reconnexion réussie !');
    } catch (error) {
      setTestMessage("Échec de la reconnexion. Vérifiez l'URL du WebSocket.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    setTestMessage('Test de connexion...');
    try {
      // Test WebSocket
      if (isConnected) {
        setTestMessage('✅ Connexion WebSocket active');
      } else {
        setTestMessage('❌ Connexion WebSocket inactive');
      }
    } catch (error) {
      setTestMessage('❌ Erreur de test de connexion');
    }
  };

  const handleSaveSettings = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem(
      'surebet_settings',
      JSON.stringify({
        wsUrl,
        apiUrl,
        refreshInterval,
        notifications,
      }),
    );
    setTestMessage('✅ Paramètres sauvegardés');
  };

  const handleLoadSettings = () => {
    const saved = localStorage.getItem('surebet_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setWsUrl(settings.wsUrl || 'ws://localhost:8080');
        setApiUrl(settings.apiUrl || 'http://localhost:3001');
        setRefreshInterval(settings.refreshInterval || 5000);
        setNotifications(
          settings.notifications || {
            newOpportunities: true,
            arberStatusChanges: true,
            profitableOpportunities: true,
            connectionIssues: true,
          },
        );
        setTestMessage('✅ Paramètres chargés');
      } catch (error) {
        setTestMessage('❌ Erreur lors du chargement des paramètres');
      }
    } else {
      setTestMessage('ℹ️ Aucun paramètre sauvegardé trouvé');
    }
  };

  const handleResetSettings = () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
      )
    ) {
      setWsUrl('ws://localhost:8080');
      setApiUrl('http://localhost:3001');
      setRefreshInterval(5000);
      setNotifications({
        newOpportunities: true,
        arberStatusChanges: true,
        profitableOpportunities: true,
        connectionIssues: true,
      });
      localStorage.removeItem('surebet_settings');
      setTestMessage('✅ Paramètres réinitialisés');
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer le cache ?')) {
      localStorage.clear();
      sessionStorage.clear();
      setTestMessage('✅ Cache effacé');
    }
  };

  const handleExportData = () => {
    // Exporter les données dans un fichier JSON
    const data = {
      settings: { wsUrl, apiUrl, refreshInterval, notifications },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surebet-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTestMessage('✅ Paramètres exportés');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.settings) {
            setWsUrl(data.settings.wsUrl);
            setApiUrl(data.settings.apiUrl);
            setRefreshInterval(data.settings.refreshInterval);
            setNotifications(data.settings.notifications);
            setTestMessage('✅ Paramètres importés');
          } else {
            setTestMessage('❌ Format de fichier invalide');
          }
        } catch (error) {
          setTestMessage("❌ Erreur lors de l'importation");
        }
      };
      reader.readAsText(file);
    }
  };

  React.useEffect(() => {
    handleLoadSettings();
  }, []);

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Paramètres</h1>
        <p>Configuration de votre interface Surebet</p>
      </div>

      <div className="settings-content">
        {/* Connexion */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔗 Connexion</h2>
            <div className="connection-status">
              <span
                className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
              ></span>
              <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ws-url">URL WebSocket</label>
              <input
                type="text"
                id="ws-url"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:8080"
              />
              <small>
                URL du serveur WebSocket pour les mises à jour temps réel
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="api-url">URL API REST</label>
              <input
                type="text"
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:3001"
              />
              <small>URL de l'API REST pour les opérations CRUD</small>
            </div>

            <div className="form-group">
              <label htmlFor="refresh-interval">
                Intervalle de rafraîchissement (ms)
              </label>
              <input
                type="number"
                id="refresh-interval"
                value={refreshInterval}
                onChange={(e) =>
                  setRefreshInterval(parseInt(e.target.value) || 5000)
                }
                min="1000"
                max="60000"
                step="1000"
              />
              <small>Fréquence de mise à jour automatique des données</small>
            </div>
          </div>

          <div className="connection-actions">
            <button
              onClick={handleReconnect}
              disabled={isConnecting}
              className="btn btn-primary"
            >
              {isConnecting ? '🔄 Connexion...' : '🔌 Reconnecter'}
            </button>
            <button onClick={handleTestConnection} className="btn btn-outline">
              🔍 Tester la connexion
            </button>
            <button onClick={refreshData} className="btn btn-secondary">
              🔄 Actualiser les données
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔔 Notifications</h2>
          </div>

          <div className="notifications-grid">
            <div className="notification-item">
              <div className="notification-info">
                <strong>Nouvelles opportunités</strong>
                <p>
                  Recevoir une notification lors de la détection de nouvelles
                  opportunités
                </p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.newOpportunities}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      newOpportunities: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <strong>Changements de statut d'arber</strong>
                <p>Être notifié quand un arber change de statut</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.arberStatusChanges}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      arberStatusChanges: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <strong>Opportunités rentables</strong>
                <p>Alerte spéciale pour les opportunités très rentables</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.profitableOpportunities}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      profitableOpportunities: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="notification-item">
              <div className="notification-info">
                <strong>Problèmes de connexion</strong>
                <p>Alertes en cas de perte de connexion avec le backend</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications.connectionIssues}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      connectionIssues: e.target.checked,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Gestion des données */}
        <div className="settings-section">
          <div className="section-header">
            <h2>💾 Gestion des données</h2>
          </div>

          <div className="data-actions">
            <div className="action-group">
              <h3>Sauvegarde et restauration</h3>
              <div className="action-buttons">
                <button
                  onClick={handleSaveSettings}
                  className="btn btn-success"
                >
                  💾 Sauvegarder les paramètres
                </button>
                <button
                  onClick={handleLoadSettings}
                  className="btn btn-primary"
                >
                  📥 Charger les paramètres
                </button>
                <button onClick={handleExportData} className="btn btn-outline">
                  📤 Exporter
                </button>
                <label className="btn btn-outline file-input-label">
                  📥 Importer
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <div className="action-group">
              <h3>Maintenance</h3>
              <div className="action-buttons">
                <button onClick={handleClearCache} className="btn btn-warning">
                  🗑️ Effacer le cache
                </button>
                <button
                  onClick={handleResetSettings}
                  className="btn btn-danger"
                >
                  🔄 Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Informations système */}
        <div className="settings-section">
          <div className="section-header">
            <h2>ℹ️ Informations système</h2>
          </div>

          <div className="system-info">
            <div className="info-grid">
              <div className="info-item">
                <label>Version de l'interface</label>
                <span>1.0.0</span>
              </div>
              <div className="info-item">
                <label>Navigateur</label>
                <span>{navigator.userAgent.split(' ')[0]}</span>
              </div>
              <div className="info-item">
                <label>Dernière mise à jour</label>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Statut WebSocket</label>
                <span
                  className={
                    isConnected ? 'status-connected' : 'status-disconnected'
                  }
                >
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message de statut */}
      {testMessage && (
        <div className="status-message">
          <p>{testMessage}</p>
          <button onClick={() => setTestMessage('')} className="close-message">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
