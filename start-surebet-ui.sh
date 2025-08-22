#!/bin/bash

# Script de démarrage pour l'interface Surebet
echo "🚀 Démarrage de l'interface Surebet..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les logs colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Se déplacer dans le répertoire du projet
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

log_info "Répertoire du projet: $PROJECT_DIR"

# Vérifier si le répertoire frontend existe
if [ ! -d "frontend" ]; then
    log_error "Le répertoire 'frontend' n'existe pas. Veuillez d'abord créer le projet React."
    exit 1
fi

# Fonction pour installer les dépendances si nécessaire
install_dependencies() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ] && [ ! -d "$dir/node_modules" ]; then
        log_info "Installation des dépendances pour $name..."
        cd "$dir"
        npm install
        if [ $? -eq 0 ]; then
            log_success "Dépendances installées pour $name"
        else
            log_error "Échec de l'installation des dépendances pour $name"
            return 1
        fi
        cd "$PROJECT_DIR"
    fi
    return 0
}

# Installer les dépendances frontend si nécessaire
install_dependencies "frontend" "Frontend React"

# Installer les dépendances pour le serveur API mock si nécessaire
if [ -f "package.json" ]; then
    # Vérifier si express et cors sont installés
    if ! npm list express cors ws &> /dev/null; then
        log_info "Installation des dépendances pour le serveur API..."
        npm install express cors ws
        if [ $? -eq 0 ]; then
            log_success "Dépendances du serveur API installées"
        else
            log_warning "Échec de l'installation des dépendances du serveur API"
        fi
    fi
fi

# Fonction pour démarrer un service en arrière-plan
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local pid_file=$4
    
    log_info "Démarrage de $name..."
    
    # Vérifier si le port est déjà utilisé
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        log_warning "$name semble déjà fonctionner sur le port $port"
        return 0
    fi
    
    # Démarrer le service
    eval "$command" &
    local pid=$!
    echo $pid > $pid_file
    
    # Attendre un peu pour vérifier si le service a démarré
    sleep 3
    
    if kill -0 $pid 2>/dev/null; then
        log_success "$name démarré avec succès (PID: $pid, Port: $port)"
        return 0
    else
        log_error "Échec du démarrage de $name"
        return 1
    fi
}

# Créer le répertoire pour les PID files
mkdir -p /tmp/surebet

# Démarrer le serveur API mock
if [ -f "api-server.js" ]; then
    start_service "Serveur API Mock" "node api-server.js" "3001" "/tmp/surebet/api-server.pid"
fi

# Démarrer le frontend React
cd frontend
start_service "Frontend React" "BROWSER=none npm start" "3000" "/tmp/surebet/frontend.pid"
cd "$PROJECT_DIR"

# Attendre que les services soient prêts
log_info "Vérification de l'état des services..."
sleep 5

# Vérifier les services
check_service() {
    local name=$1
    local url=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        log_success "$name est accessible"
        return 0
    else
        log_warning "$name n'est pas encore accessible"
        return 1
    fi
}

# Vérifier l'API
check_service "API Server" "http://localhost:3001/api/ping"

# Vérifier le frontend
check_service "Frontend React" "http://localhost:3000"

# Afficher les informations finales
echo ""
echo "========================================"
echo "🎉 Interface Surebet démarrée !"
echo "========================================"
echo ""
echo "🌐 Accès à l'interface:"
echo "   Frontend: http://localhost:3000"
echo "   API Mock: http://localhost:3001"
echo ""
echo "📊 Services actifs:"
if [ -f "/tmp/surebet/frontend.pid" ]; then
    echo "   ✅ Frontend React (PID: $(cat /tmp/surebet/frontend.pid))"
fi
if [ -f "/tmp/surebet/api-server.pid" ]; then
    echo "   ✅ Serveur API Mock (PID: $(cat /tmp/surebet/api-server.pid))"
fi
echo ""
echo "⚠️  Notes importantes:"
echo "   • L'interface fonctionne avec des données simulées"
echo "   • Démarrez le backend Surebet réel pour les données live"
echo "   • WebSocket backend: ws://localhost:8080 (configuré par défaut)"
echo ""
echo "🛑 Pour arrêter les services:"
echo "   ./stop-surebet-ui.sh"
echo ""

# Ouvrir le navigateur si possible
if command -v xdg-open &> /dev/null; then
    log_info "Ouverture du navigateur..."
    xdg-open http://localhost:3000 2>/dev/null
elif command -v open &> /dev/null; then
    log_info "Ouverture du navigateur..."
    open http://localhost:3000 2>/dev/null
else
    log_info "Ouvrez manuellement http://localhost:3000 dans votre navigateur"
fi

echo "Press Ctrl+C to stop all services, or run ./stop-surebet-ui.sh"

# Attendre l'interruption
trap 'echo ""; log_info "Arrêt des services..."; ./stop-surebet-ui.sh; exit 0' INT

# Garder le script actif
while true; do
    sleep 1
done