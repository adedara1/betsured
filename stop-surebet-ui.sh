#!/bin/bash

# Script d'arrêt pour l'interface Surebet
echo "🛑 Arrêt de l'interface Surebet..."

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

# Fonction pour arrêter un service
stop_service() {
    local name=$1
    local pid_file=$2
    local port=$3
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        log_info "Arrêt de $name (PID: $pid)..."
        
        if kill -0 $pid 2>/dev/null; then
            # Essayer d'arrêter proprement
            kill $pid
            
            # Attendre un peu
            sleep 2
            
            # Vérifier si le processus est encore actif
            if kill -0 $pid 2>/dev/null; then
                log_warning "Arrêt forcé de $name..."
                kill -9 $pid
                sleep 1
            fi
            
            if ! kill -0 $pid 2>/dev/null; then
                log_success "$name arrêté avec succès"
            else
                log_error "Impossible d'arrêter $name"
            fi
        else
            log_info "$name n'était pas en cours d'exécution"
        fi
        
        # Supprimer le fichier PID
        rm -f "$pid_file"
    else
        log_info "Aucun fichier PID trouvé pour $name"
    fi
    
    # Vérifier si le port est encore utilisé et tuer le processus si nécessaire
    if [ -n "$port" ]; then
        local port_pid=$(lsof -ti:$port)
        if [ -n "$port_pid" ]; then
            log_warning "Le port $port est encore utilisé par le PID $port_pid, arrêt forcé..."
            kill -9 $port_pid 2>/dev/null
        fi
    fi
}

# Arrêter les services
log_info "Arrêt des services Surebet UI..."

# Arrêter le frontend React
stop_service "Frontend React" "/tmp/surebet/frontend.pid" "3000"

# Arrêter le serveur API mock
stop_service "Serveur API Mock" "/tmp/surebet/api-server.pid" "3001"

# Nettoyer les fichiers temporaires
if [ -d "/tmp/surebet" ]; then
    log_info "Nettoyage des fichiers temporaires..."
    rm -rf /tmp/surebet
fi

# Vérifier les ports pour s'assurer qu'ils sont libres
check_port_free() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Le port $port ($service_name) est encore utilisé"
        local pid=$(lsof -ti:$port)
        log_info "Processus utilisant le port $port: PID $pid"
        return 1
    else
        log_success "Port $port ($service_name) libéré"
        return 0
    fi
}

# Vérifier que les ports sont libres
log_info "Vérification de la libération des ports..."
check_port_free "3000" "Frontend React"
check_port_free "3001" "API Mock Server"

# Nettoyer les processus Node.js orphelins liés à Surebet
log_info "Nettoyage des processus Node.js orphelins..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "api-server.js" 2>/dev/null

echo ""
echo "========================================"
echo "✅ Interface Surebet arrêtée"
echo "========================================"
echo ""
echo "📊 Tous les services ont été arrêtés:"
echo "   🛑 Frontend React (port 3000)"
echo "   🛑 Serveur API Mock (port 3001)"
echo ""
echo "🧹 Fichiers temporaires nettoyés"
echo ""
echo "🚀 Pour redémarrer:"
echo "   ./start-surebet-ui.sh"
echo ""

exit 0