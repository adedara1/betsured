# 🎯 Interface Web Surebet - Guide Complet

Interface web React moderne pour l'application Surebet d'arbitrage de paris sportifs.

## 📋 Vue d'ensemble

Cette interface web permet de surveiller et contrôler vos agents d'arbitrage Surebet en temps réel via une interface utilisateur intuitive et responsive.

### ✨ Fonctionnalités principales

- **🔄 Temps réel** : Connexion WebSocket pour les mises à jour instantanées
- **🤖 Gestion des Arbers** : Contrôle complet des agents d'arbitrage
- **💰 Opportunités** : Visualisation des opportunités détectées avec filtres avancés
- **📊 Statistiques** : Analyses détaillées des performances et ROI
- **⚙️ Configuration** : Paramètres personnalisables et gestion des données
- **📱 Responsive** : Interface adaptée à tous les appareils

## 🚀 Démarrage rapide

### Option 1 : Démarrage automatique (Recommandé)

```bash
# Rendre le script exécutable (si nécessaire)
chmod +x start-surebet-ui.sh

# Démarrer l'interface complète
./start-surebet-ui.sh
```

L'interface sera accessible sur http://localhost:3000

### Option 2 : Démarrage manuel

```bash
# 1. Installer les dépendances API
npm install express cors ws

# 2. Démarrer le serveur API mock
node api-server.js &

# 3. Installer les dépendances frontend
cd frontend
npm install

# 4. Démarrer le frontend React
npm start
```

### Arrêt des services

```bash
# Arrêt automatique
./stop-surebet-ui.sh

# Ou arrêt manuel
pkill -f "react-scripts start"
pkill -f "api-server.js"
```

## 🏗️ Architecture

```
/home/user/webapp/
├── frontend/                    # Application React
│   ├── src/
│   │   ├── components/         # Composants React
│   │   │   ├── Dashboard/      # Tableau de bord
│   │   │   ├── Arbers/        # Gestion des arbers
│   │   │   ├── Opportunities/ # Liste des opportunités
│   │   │   ├── Statistics/    # Statistiques détaillées
│   │   │   ├── Settings/      # Configuration
│   │   │   ├── Header/        # Navigation
│   │   │   └── UI/           # Composants UI réutilisables
│   │   ├── contexts/          # Contextes React (état global)
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── services/         # Services API et WebSocket
│   │   ├── types/           # Types TypeScript
│   │   └── utils/           # Utilitaires
│   ├── public/              # Fichiers statiques React
│   └── package.json         # Dépendances frontend
├── api-server.js           # Serveur API mock Express
├── start-surebet-ui.sh    # Script de démarrage
├── stop-surebet-ui.sh     # Script d'arrêt
└── README.md              # Documentation principale
```

## 📊 Pages et fonctionnalités

### 🏠 Dashboard

- **Vue d'ensemble** : Statistiques principales et état des arbers
- **Arbers actifs** : Liste des agents en cours d'exécution
- **Opportunités récentes** : Dernières opportunités détectées
- **État de connexion** : Statut en temps réel du backend

### 🤖 Gestion des Arbers

- **Liste complète** : Tous les arbers avec leurs statuts
- **Contrôles** : Pause, reprise, fermeture des arbers
- **Détails individuels** : Statistiques et historique par arber
- **Modification d'investissement** : Ajustement des montants

### 💰 Opportunités

- **Liste exhaustive** : Toutes les opportunités détectées
- **Filtres avancés** : Par viabilité, rentabilité, bookie
- **Recherche** : Par événement, arber ou bookmaker
- **Tri personnalisable** : Par profit, marge, date, etc.

### 📈 Statistiques

- **Performance globale** : ROI, profit total, taux de succès
- **Analyse par arber** : Comparaison des performances
- **Analyse par bookmaker** : Répartition des opportunités
- **Métriques détaillées** : Volumes, marges, historique

### ⚙️ Paramètres

- **Connexions** : Configuration WebSocket et API
- **Notifications** : Alertes personnalisables
- **Import/Export** : Sauvegarde des paramètres
- **Informations système** : État des services

## 🔌 Intégration Backend

### WebSocket (Port 8080)

L'interface se connecte au backend Surebet via WebSocket pour :

- Mises à jour en temps réel des arbers
- Notification des nouvelles opportunités
- Changements de statut des bookmakers
- Contrôle à distance des arbers

### API REST (Port 3001)

Un serveur API mock est fourni pour :

- Opérations CRUD sur les arbers
- Récupération des statistiques
- Historique des opportunités
- Gestion des données

### Backend réel Surebet

Pour utiliser les données réelles :

1. Démarrez le backend Surebet principal
2. Assurez-vous que le WebSocket fonctionne sur le port 8080
3. L'interface se connectera automatiquement

## 🛠️ Configuration

### Variables d'environnement (frontend/.env)

```env
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_API_URL=http://localhost:3001
REACT_APP_REFRESH_INTERVAL=5000
```

### Paramètres dans l'interface

- **URL WebSocket** : Adresse du serveur temps réel
- **URL API** : Adresse du serveur REST
- **Intervalle de rafraîchissement** : Fréquence des mises à jour
- **Notifications** : Types d'alertes activées

## 📱 Interface utilisateur

### Design moderne

- **Thème cohérent** : Couleurs et typographie harmonieuses
- **Animations fluides** : Transitions et effets visuels
- **Icônes explicites** : Interface intuitive
- **Responsive design** : Adaptation automatique aux écrans

### Navigation intuitive

- **Header fixe** : Accès rapide aux sections principales
- **Breadcrumbs** : Navigation contextuelle
- **Filtres visuels** : Recherche et tri simplifiés
- **Actions contextuelles** : Boutons d'action pertinents

## 🔧 Développement

### Structure des composants

- **Composants fonctionnels** : Hooks React modernes
- **TypeScript** : Typage strict pour la robustesse
- **Contextes** : Gestion d'état globale
- **Hooks personnalisés** : Logique réutilisable

### Services

- **WebSocket Service** : Connexion temps réel avec reconnexion automatique
- **API Service** : Appels REST avec gestion d'erreurs
- **Context Provider** : État global de l'application

### Styling

- **CSS moderne** : Grid, Flexbox, variables CSS
- **Responsive breakpoints** : Mobile-first design
- **Animations CSS** : Transitions fluides

## 🧪 Données de test

Le serveur API mock fournit :

- **2 arbers de démonstration** : Tennis et Soccer
- **Opportunités simulées** : Ajout automatique toutes les 10-30s
- **Statistiques calculées** : Basées sur les données mock
- **Bookmakers fictifs** : Betfair, Bet365, etc.

## 🔍 Dépannage

### Problèmes courants

**Port déjà utilisé**

```bash
# Vérifier les ports utilisés
lsof -i :3000
lsof -i :3001

# Tuer les processus si nécessaire
./stop-surebet-ui.sh
```

**Erreurs de dépendances**

```bash
# Réinstaller les dépendances
cd frontend && npm install
npm install express cors ws
```

**Connexion WebSocket échouée**

- Vérifiez que le backend Surebet fonctionne sur le port 8080
- Consultez les paramètres dans l'interface
- Regardez la console du navigateur pour les erreurs

**Interface ne se charge pas**

- Vérifiez que Node.js et npm sont installés
- Assurez-vous que les ports 3000 et 3001 sont libres
- Consultez les logs dans le terminal

### Logs et débogage

**Logs du serveur API**

```bash
# Les logs s'affichent dans le terminal
node api-server.js
```

**Logs du frontend**

```bash
# Démarrage en mode développement avec logs détaillés
cd frontend && npm start
```

**Console du navigateur**

- Ouvrez les outils de développement (F12)
- Consultez l'onglet Console pour les erreurs JavaScript
- Vérifiez l'onglet Network pour les requêtes échouées

## 📚 Documentation technique

### Types TypeScript

Tous les types sont définis dans `frontend/src/types/index.ts` :

- `ArberInstance` : Structure d'un arber
- `Opportunity` : Opportunité d'arbitrage
- `BookieInfo` : Information sur un bookmaker
- `Statistics` : Statistiques globales

### Hooks personnalisés

- `useWebSocket` : Gestion de la connexion WebSocket
- `useRealTimeData` : Écoute des mises à jour temps réel
- `useArberUpdates` : Mises à jour spécifiques aux arbers

### Contexte global

Le `SurebetContext` gère :

- État des arbers et opportunités
- Connexion WebSocket
- Actions de contrôle
- Gestion des erreurs

## 🚀 Déploiement

### Build de production

```bash
cd frontend
npm run build
```

### Serveur statique

```bash
# Installer serve globalement
npm install -g serve

# Servir les fichiers de build
serve -s frontend/build -l 3000
```

### Variables d'environnement

Configurez les variables selon votre environnement :

- `REACT_APP_WS_URL` : URL du WebSocket backend
- `REACT_APP_API_URL` : URL de l'API REST

## 📄 Licence

MIT License - Voir le fichier LICENSE du projet principal.

## 🤝 Support

En cas de problème :

1. Consultez cette documentation
2. Vérifiez les logs dans le terminal
3. Inspectez la console du navigateur
4. Testez la connectivité avec le backend

## 🎉 Félicitations !

Vous avez maintenant une interface web complète pour surveiller et contrôler vos arbers Surebet en temps réel. L'interface est prête à être utilisée avec des données simulées et peut être facilement connectée au backend réel.

**Accès :** http://localhost:3000

**Bon arbitrage ! 💰**
