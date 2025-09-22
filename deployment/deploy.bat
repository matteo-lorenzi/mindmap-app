@echo off
echo 🚀 MindMap App Deployment Script
echo =================================

:menu
echo.
echo Choose deployment option:
echo 1^) Deploy frontend to GitHub Pages
echo 2^) Build all for production
echo 3^) Deploy with Docker
echo 4^) Exit

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto deploy_gh_pages
if "%choice%"=="2" goto build_all
if "%choice%"=="3" goto docker_deploy
if "%choice%"=="4" goto exit
echo ❌ Invalid option. Please choose 1-4.
goto menu

:deploy_gh_pages
echo 📦 Building frontend...
cd client
call npm run build
echo 🌐 Deploying to GitHub Pages...
call npx gh-pages -d dist
echo ✅ Frontend deployed to GitHub Pages!
goto end

:build_all
echo 📦 Building client...
cd client
call npm run build
cd ..
echo 📦 Building server...
cd server
call npm run build
cd ..
echo ✅ All builds completed!
goto end

:docker_deploy
echo 🐳 Starting Docker deployment...
cd deployment
call docker-compose up --build -d
echo ✅ Docker containers started!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
goto end

:exit
echo 👋 Goodbye!
exit /b 0

:end
pause