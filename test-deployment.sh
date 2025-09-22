#!/bin/bash

echo "🔍 Test de Déploiement MindMap App"
echo "=================================="

# URLs à tester
FRONTEND_URL="https://mindmap-app-eosin.vercel.app"
BACKEND_URL="" # À remplir une fois Railway configuré

echo "📱 Test du Frontend..."
echo "URL: $FRONTEND_URL"

# Test du frontend
if curl -s --head "$FRONTEND_URL" | head -n 1 | grep -q "200 OK"; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend inaccessible"
fi

if [ -n "$BACKEND_URL" ]; then
    echo ""
    echo "🔧 Test du Backend..."
    echo "URL: $BACKEND_URL"
    
    # Test de l'API health
    if curl -s "$BACKEND_URL/health" | grep -q "OK"; then
        echo "✅ API Health accessible"
    else
        echo "❌ API Health inaccessible"
    fi
    
    # Test de l'API auth
    if curl -s --head "$BACKEND_URL/api/auth" | head -n 1 | grep -q "404\|405"; then
        echo "✅ API Auth endpoint détecté"
    else
        echo "❌ API Auth endpoint non trouvé"
    fi
else
    echo ""
    echo "⚠️ URL Backend non configurée"
    echo "Configurez BACKEND_URL dans ce script une fois Railway déployé"
fi

echo ""
echo "📋 Checklist de déploiement:"
echo "[ ] Vercel - Variables d'environnement configurées"
echo "[ ] Railway - Base de données PostgreSQL ajoutée"
echo "[ ] Railway - Variables d'environnement configurées"
echo "[ ] CORS - CLIENT_URL correctement configuré"
echo "[ ] URLs - Toutes les URLs mises à jour"

echo ""
echo "🔗 Liens utiles:"
echo "• Dashboard Vercel: https://vercel.com/dashboard"
echo "• Dashboard Railway: https://railway.app/dashboard"
echo "• Votre app frontend: $FRONTEND_URL"