#!/bin/bash

# Script de setup Railway

echo "🚄 Configuration Railway pour MindMap API"
echo "=========================================="

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --only=production

# Génération du client Prisma
echo "🗄️ Génération du client Prisma..."
npx prisma generate

# Migration de la base de données
echo "🔄 Migration de la base de données..."
npx prisma migrate deploy

# Démarrage du serveur
echo "🚀 Démarrage du serveur..."
npm start