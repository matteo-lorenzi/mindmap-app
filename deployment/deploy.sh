#!/bin/bash

echo "🚀 MindMap App Deployment Script"
echo "================================="

# Function to deploy frontend to GitHub Pages
deploy_frontend_gh_pages() {
    echo "📦 Building frontend..."
    cd client
    npm run build
    
    echo "🌐 Deploying to GitHub Pages..."
    npx gh-pages -d dist
    echo "✅ Frontend deployed to GitHub Pages!"
}

# Function to build for production
build_all() {
    echo "📦 Building client..."
    cd client
    npm run build
    cd ..
    
    echo "📦 Building server..."
    cd server
    npm run build
    cd ..
    
    echo "✅ All builds completed!"
}

# Function to start production with Docker
docker_deploy() {
    echo "🐳 Starting Docker deployment..."
    cd deployment
    docker-compose up --build -d
    echo "✅ Docker containers started!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:5000"
}

# Main menu
echo "Choose deployment option:"
echo "1) Deploy frontend to GitHub Pages"
echo "2) Build all for production"
echo "3) Deploy with Docker"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_frontend_gh_pages
        ;;
    2)
        build_all
        ;;
    3)
        docker_deploy
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        ;;
esac