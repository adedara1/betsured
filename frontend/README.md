# Surebet Frontend

Interface web React pour l'application Surebet d'arbitrage de paris sportifs.

## 🚀 Fonctionnalités

- **Connexion temps réel** : WebSocket pour les mises à jour en temps réel
- **Gestion des Arbers** : Surveillance et contrôle des agents d'arbitrage
- **Opportunités** : Visualisation des opportunités d'arbitrage détectées
- **Statistiques** : Analyse détaillée des performances
- **Interface responsive** : Adaptée à tous les appareils
- **Thème moderne** : Interface utilisateur claire et intuitive

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Construire pour la production
npm run build
```

## 🔧 Configuration

### Backend Requirements

L'interface se connecte au backend Surebet qui doit être démarré :

1. **WebSocket Server** : Port 8080 (par défaut)
2. **API REST** : Port 3001 (optionnel pour les fonctionnalités étendues)

### Variables d'environnement

Créez un fichier `.env` dans le répertoire frontend :

```env
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_API_URL=http://localhost:3001
REACT_APP_REFRESH_INTERVAL=5000
```

## 🏗️ Architecture

### Structure des composants

```
src/
├── components/
│   ├── Dashboard/          # Page d'accueil et vue d'ensemble
│   ├── Arbers/            # Gestion des arbers
│   ├── Opportunities/     # Liste des opportunités
│   ├── Statistics/        # Statistiques détaillées
│   ├── Settings/         # Configuration de l'interface
│   ├── Header/           # Navigation principale
│   └── UI/               # Composants UI réutilisables
├── contexts/              # Contextes React (état global)
├── hooks/                 # Hooks personnalisés
├── services/              # Services API et WebSocket
├── types/                 # Types TypeScript
└── utils/                 # Utilitaires
```

### Services

- **WebSocket Service** : Connexion temps réel avec le backend
- **API Service** : Appels REST pour les opérations CRUD
- **Context Provider** : Gestion de l'état global de l'application

## 📱 Pages et fonctionnalités

### 🏠 Dashboard

- Vue d'ensemble des arbers actifs
- Statistiques principales
- Opportunités récentes
- État de connexion

### 🤖 Gestion des Arbers

- Liste de tous les arbers
- Contrôles (pause/reprendre/fermer)
- Détails individuels avec statistiques
- Historique des opportunités

### 💰 Opportunités

- Liste complète des opportunités détectées
- Filtrage et tri avancés
- Recherche par événement/bookie
- Indicateurs de rentabilité

### 📊 Statistiques

- Performance globale
- Analyse par arber
- Analyse par bookmaker
- Métriques de volume et profit

### ⚙️ Paramètres

- Configuration des connexions
- Gestion des notifications
- Import/export des paramètres
- Informations système

## 🔌 Connexion WebSocket

L'interface utilise WebSocket pour recevoir les mises à jour en temps réel :

### Événements entrants

- `arber_created` : Nouvel arber créé
- `arber_status_updated` : Changement de statut
- `arber_investment_updated` : Modification d'investissement
- `opportunities_found` : Nouvelles opportunités détectées
- `bookie_status_updated` : Statut des bookmakers

### Événements sortants

- `pause_arber` : Mettre en pause un arber
- `resume_arber` : Reprendre un arber
- `close_arber` : Fermer un arber
- `update_investment` : Modifier l'investissement

## 🎨 Styling

L'interface utilise du CSS moderne avec :

- CSS Grid et Flexbox pour la mise en page
- Variables CSS pour la cohérence des couleurs
- Animations et transitions fluides
- Design responsive avec breakpoints
- Thème sombre/clair (prêt pour l'implémentation)

## 🚦 Démarrage

### 1. Démarrer le backend Surebet

```bash
cd /chemin/vers/surebet
npm start
```

### 2. Démarrer le frontend

```bash
cd frontend
npm start
```

### 3. Accéder à l'interface

Ouvrez http://localhost:3000 dans votre navigateur.

## 📋 Développement

### Scripts disponibles

```bash
npm start          # Développement avec hot-reload
npm run build      # Build de production
npm test           # Tests
npm run dev        # Développement sans ouverture automatique du navigateur
```

### Types TypeScript

Tous les types sont définis dans `src/types/index.ts` et correspondent aux modèles du backend Surebet.

### Hooks personnalisés

- `useWebSocket` : Gestion de la connexion WebSocket
- `useRealTimeData` : Écoute des mises à jour temps réel
- `useArberUpdates` : Mises à jour spécifiques aux arbers

## 🔧 Personnalisation

### Modifier les couleurs

Éditez les variables CSS dans `src/App.css` :

```css
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
}
```

### Ajouter des notifications

Implémentez les notifications dans le contexte ou créez un service dédié.

### Étendre l'API

Ajoutez de nouveaux endpoints dans `src/services/api.ts`.

## 🐛 Dépannage

### Problèmes de connexion WebSocket

1. Vérifiez que le backend Surebet est démarré
2. Vérifiez l'URL WebSocket dans les paramètres
3. Consultez la console du navigateur pour les erreurs

### Erreurs de compilation TypeScript

1. Vérifiez les imports et exports
2. Assurez-vous que tous les types sont correctement définis
3. Redémarrez le serveur de développement

### Performance

1. Utilisez React DevTools pour identifier les re-rendus
2. Optimisez les useEffect et useMemo
3. Implémentez la pagination pour les grandes listes

## 📄 Licence

MIT - Voir le fichier LICENSE du projet principal.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 🔗 Liens utiles

- [Documentation React](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Backend Surebet](../README.md)
