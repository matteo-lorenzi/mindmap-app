<div align="center">

# 🧠 MINDMAP-APP

*Unleash Creativity, Map Ideas Instantly, Collaborate Seamlessly*

![last-commit](https://img.shields.io/github/last-commit/matteo-lorenzi/mindmap-app?style=flat&logo=git&logoColor=white&color=0080ff)
![repo-top-language](https://img.shields.io/github/languages/top/matteo-lorenzi/mindmap-app?style=flat&color=0080ff)
![repo-language-count](https://img.shields.io/github/languages/count/matteo-lorenzi/mindmap-app?style=flat&color=0080ff)

**Frontend Technologies**

![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white)
![Konva](https://img.shields.io/badge/Konva-0D83CD.svg?style=flat&logo=Konva&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)

**Backend Technologies**

![Express](https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748.svg?style=flat&logo=Prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101.svg?style=flat&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000.svg?style=flat&logo=JSON-web-tokens&logoColor=white)

**Development Tools**

![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B.svg?style=flat&logo=Nodemon&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white)

</div>

---

## 📋 Table of Contents

- [🧠 MINDMAP-APP](#-mindmap-app)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎯 Overview](#-overview)
    - [🎪 Who is this for?](#-who-is-this-for)
  - [✨ Features](#-features)
    - [🔥 Core Features](#-core-features)
    - [🚀 Advanced Features](#-advanced-features)
    - [🛡️ Technical Features](#️-technical-features)
  - [🏗️ Architecture](#️-architecture)
    - [Frontend Stack](#frontend-stack)
    - [Backend Stack](#backend-stack)
  - [🚀 Getting Started](#-getting-started)
    - [📋 Prerequisites](#-prerequisites)
    - [⚡ Quick Start](#-quick-start)
    - [🔧 Development Setup](#-development-setup)
  - [💻 Usage](#-usage)
    - [Creating Your First Mind Map](#creating-your-first-mind-map)
    - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [🛠️ Development](#️-development)
    - [Available Scripts](#available-scripts)
    - [Environment Variables](#environment-variables)
  - [📁 Project Structure](#-project-structure)
  - [🌐 Deployment](#-deployment)
    - [🚀 Quick Deploy Options](#-quick-deploy-options)
      - [**Option 1: Frontend Only (GitHub Pages)**](#option-1-frontend-only-github-pages)
      - [**Option 2: Full-Stack Deployment (Recommended)**](#option-2-full-stack-deployment-recommended)
      - [**Option 3: Docker Deployment**](#option-3-docker-deployment)
    - [🔧 Environment Setup for Production](#-environment-setup-for-production)
    - [📊 Live Demo](#-live-demo)
  - [🤝 Contributing](#-contributing)
    - [Development Guidelines](#development-guidelines)
  - [📄 License](#-license)

---

## 🎯 Overview

**MindMap-App** is a modern, full-stack web application for creating, editing, and sharing interactive mind maps. Built with React, TypeScript, and Node.js, it provides a powerful platform for visual knowledge management with real-time collaboration capabilities.

### 🎪 Who is this for?

- **🎓 Students**: Organize notes, study materials, and project ideas
- **👩‍🏫 Educators**: Create lesson plans and educational content
- **💼 Professionals**: Brainstorm, plan projects, and visualize workflows
- **🎨 Creatives**: Map out creative projects and ideas

---

## ✨ Features

### 🔥 Core Features

- **� Interactive Canvas**: Drag-and-drop interface powered by Konva.js
- **🔗 Smart Connections**: Connect ideas with customizable lines and arrows
- **✏️ Rich Text Editing**: Format text with various styles and colors
- **🎭 Customizable Nodes**: Multiple shapes, colors, and sizes
- **💾 Auto-Save**: Never lose your work with automatic saving
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🚀 Advanced Features

- **👥 Real-Time Collaboration**: Work together with live updates via Socket.io
- **� Secure Authentication**: JWT-based user management
- **🌙 Dark/Light Theme**: Toggle between themes for comfortable viewing
- **📤 Export Options**: Export to PNG, SVG, PDF, and JSON formats
- **🔍 Search & Filter**: Find your mind maps quickly
- **📊 Version History**: Track changes and revert when needed

### 🛡️ Technical Features

- **⚡ High Performance**: Optimized canvas rendering for 1000+ nodes
- **🌐 Offline Support**: Work offline with local storage synchronization
- **🔒 Security**: Input sanitization, CSRF protection, and secure headers
- **♿ Accessibility**: Keyboard navigation and screen reader support

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Konva.js** - 2D canvas library for interactive graphics
- **Redux Toolkit** - Predictable state management
- **React Router** - Client-side routing

### Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Prisma** - Next-generation ORM with type safety
- **SQLite/PostgreSQL** - Database with Prisma migrations
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### ⚡ Quick Start

1. **Clone and Setup**
   ```bash
   git clone https://github.com/matteo-lorenzi/mindmap-app.git
   cd mindmap-app
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies (client + server)
   npm install
   
   # Or install separately
   cd client && npm install
   cd ../server && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit with your configuration
   # DATABASE_URL, JWT_SECRET, etc.
   ```

4. **Database Setup**
   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend server (port 5000)
   cd server && npm run dev
   
   # Terminal 2 - Frontend client (port 5173)
   cd client && npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the application!

### 🔧 Development Setup

For a more detailed development setup with additional tools:

```bash
# Install development tools globally
npm install -g nodemon typescript

# Setup git hooks (optional)
npm run prepare

# Run tests
npm test

# Build for production
npm run build
```

---

## 💻 Usage

### Creating Your First Mind Map

1. **Sign Up/Login** - Create an account or use the demo mode
2. **Create New Map** - Click "New Mind Map" from the dashboard
3. **Add Nodes** - Double-click on canvas to add nodes
4. **Connect Ideas** - Drag from one node to another to create connections
5. **Customize** - Use the properties panel to style nodes and connections
6. **Save & Share** - Your work is auto-saved and ready to share

### Keyboard Shortcuts

- `Ctrl+N` - New mind map
- `Ctrl+S` - Save
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Delete` - Delete selected nodes
- `Space` - Pan mode
- `+/-` - Zoom in/out

---

## 🛠️ Development

### Available Scripts

**Client (Frontend)**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**Server (Backend)**
```bash
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes
```

### Environment Variables

Create a `.env` file in the server directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
CLIENT_URL="http://localhost:5173"
```

---

## 📁 Project Structure

```
mindmap-app/
├── 📂 client/                 # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/     # Reusable UI components
│   │   │   ├── 📂 Auth/       # Authentication components
│   │   │   ├── 📂 Layout/     # Layout components
│   │   │   ├── 📂 MindMap/    # Mind map canvas components
│   │   │   └── 📂 UI/         # Generic UI components
│   │   ├── 📂 hooks/          # Custom React hooks
│   │   ├── 📂 pages/          # Page components
│   │   ├── 📂 services/       # API services
│   │   ├── 📂 store/          # Redux store and slices
│   │   ├── 📂 types/          # TypeScript type definitions
│   │   └── 📂 utils/          # Utility functions
│   └── 📄 package.json
├── 📂 server/                 # Express Backend
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # Route controllers
│   │   ├── 📂 middleware/     # Express middleware
│   │   ├── 📂 models/         # Database models
│   │   ├── 📂 routes/         # API routes
│   │   ├── 📂 services/       # Business logic
│   │   └── 📂 utils/          # Server utilities
│   ├── 📂 prisma/            # Database schema and migrations
│   └── 📄 package.json
├── 📂 shared/                 # Shared types and utilities
├── 📂 docs/                   # Documentation
├── 📂 tests/                  # Test files
├── 📄 README.md
├── 📄 PROJECT_PLAN.md
└── 📄 DEVELOPMENT_LOG.md
```

---

## 🌐 Deployment

### 🚀 Quick Deploy Options

#### **Option 1: Frontend Only (GitHub Pages)**
Deploy just the frontend as a static site:

```bash
# Build the client
cd client
npm run build

# Deploy to GitHub Pages
npm install -g gh-pages
gh-pages -d dist
```

**Note**: This only deploys the frontend. You'll need a separate backend hosting solution.

#### **Option 2: Full-Stack Deployment (Recommended)**

**Frontend**: Deploy on **Vercel** or **Netlify**
```bash
# Vercel
npm install -g vercel
cd client
vercel --prod

# Netlify
npm install -g netlify-cli
cd client
npm run build
netlify deploy --prod --dir=dist
```

**Backend**: Deploy on **Railway**, **Render**, or **Heroku**
```bash
# Railway (recommended)
npm install -g @railway/cli
railway login
railway init
railway up

# Or use Render/Heroku following their documentation
```

#### **Option 3: Docker Deployment**
```bash
# Build and run with Docker
docker-compose up --build

# Deploy to any Docker-compatible platform
# (DigitalOcean, AWS, Google Cloud, etc.)
```

### 🔧 Environment Setup for Production

1. **Create production environment variables**:
```env
# Production .env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-strong-production-secret"
CLIENT_URL="https://your-frontend-domain.com"
PORT=5000
```

2. **Update CORS settings** for production domains
3. **Setup SSL certificates** (usually handled by hosting providers)
4. **Configure database** (PostgreSQL recommended for production)

### 📊 Live Demo

🔗 **Frontend**: [https://mindmap-app-eosin.vercel.app](https://mindmap-app-eosin.vercel.app)  
🔗 **API**: [https://[votre-railway-app].railway.app](https://[votre-railway-app].railway.app)

> 💡 **Note**: Remplacez `[votre-railway-app]` par l'URL de votre application Railway une fois déployée.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by [Matteo Lorenzi](https://github.com/matteo-lorenzi)**

[⬆ Back to Top](#-mindmap-app)

</div>

---

<div align="left"><a href="#top">⬆ Return</a></div>

---