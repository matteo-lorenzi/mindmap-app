import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MindmapEditorPage from './pages/MindmapEditorPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import NotificationContainer from './components/UI/NotificationContainer';
import ThemeProvider from './components/UI/ThemeProvider';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/mindmap/:id" element={
                <ProtectedRoute>
                  <MindmapEditorPage />
                </ProtectedRoute>
              } />
              
              {/* Redirect to dashboard by default */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global UI components */}
            <LoadingSpinner />
            <NotificationContainer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
