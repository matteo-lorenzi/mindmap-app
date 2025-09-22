import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import {
  loadUserSettings,
  saveUserSettings,
  updateSetting,
  updateSettings,
  discardChanges,
  selectUserSettings,
  selectHasUnsavedChanges,
  selectSettingsLoading,
  selectSettingsError,
} from '../store/slices/settingsSlice';
import {
  UserIcon,
  CogIcon,
  PaintBrushIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const userSettings = useSelector(selectUserSettings);
  const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);
  const isLoading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  
  const [activeSection, setActiveSection] = useState('profile');

  // Charger les paramètres au montage du composant
  useEffect(() => {
    dispatch(loadUserSettings());
  }, [dispatch]);

  const handleSaveSettings = async () => {
    try {
      await dispatch(saveUserSettings(userSettings)).unwrap();
      // Show success notification
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show error notification
    }
  };

  const handleResetSettings = () => {
    dispatch(discardChanges());
  };

  // Settings sections configuration
  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profil Utilisateur',
      description: 'Gérer votre profil, mot de passe et informations personnelles',
      icon: UserIcon,
      component: ProfileSettings,
    },
    {
      id: 'application',
      title: 'Application',
      description: 'Thème, langue, auto-sauvegarde et préférences générales',
      icon: CogIcon,
      component: ApplicationSettings,
    },
    {
      id: 'canvas',
      title: 'Canvas & Édition',
      description: 'Paramètres par défaut du canvas, outils et raccourcis',
      icon: PaintBrushIcon,
      component: CanvasSettings,
    },
    {
      id: 'export',
      title: 'Export & Import',
      description: 'Formats par défaut, qualité et options d\'export',
      icon: ArrowDownTrayIcon,
      component: ExportSettings,
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      description: 'Permissions, partage et notifications de collaboration',
      icon: ShareIcon,
      component: CollaborationSettings,
    },
    {
      id: 'privacy',
      title: 'Confidentialité',
      description: 'Visibilité par défaut et paramètres de confidentialité',
      icon: EyeIcon,
      component: PrivacySettings,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Gérer les notifications et alertes de l\'application',
      icon: BellIcon,
      component: NotificationSettings,
    },
  ];

  const currentSection = settingsSections.find(section => section.id === activeSection);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="h-24 px-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <div className="flex items-center w-full">
            <button
              onClick={() => navigate('/')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-4"
              title="Retour au Dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Personnalisez votre expérience MindMap
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Save Actions */}
        {hasUnsavedChanges && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Modifications non sauvegardées
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Sauvegarder
              </button>
              <button
                onClick={handleResetSettings}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-scroll">
        {/* Content Header */}
        <div className="h-24 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 flex items-center">
          <div className="flex items-center">
            {currentSection && (
              <>
                <currentSection.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentSection.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentSection.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-8 pb-16">
          {currentSection && (
            <currentSection.component />
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informations Personnelles
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Changer le Mot de Passe
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Actions du Compte
        </h3>
        
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <div className="font-medium">Exporter mes données</div>
            <div className="text-sm text-blue-600">Télécharger toutes vos mind maps</div>
          </button>
          
          <button className="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200">
            <div className="font-medium">Supprimer mon compte</div>
            <div className="text-sm text-red-600">Action irréversible</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Application Settings Component
const ApplicationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'fr',
    autoSave: true,
    autoSaveInterval: 30,
    showGridLines: true,
    enableKeyboardShortcuts: true,
    enableAnimations: true,
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* Appearance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thème
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="auto">Automatique</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Langue
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Save */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sauvegarde Automatique</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Activer la sauvegarde automatique</div>
              <div className="text-sm text-gray-600">Sauvegarder automatiquement vos modifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {settings.autoSave && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalle de sauvegarde (secondes)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={settings.autoSaveInterval}
                onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interface</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Afficher la grille</div>
              <div className="text-sm text-gray-600">Grille d'aide sur le canvas</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showGridLines}
                onChange={(e) => setSettings({ ...settings, showGridLines: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Raccourcis clavier</div>
              <div className="text-sm text-gray-600">Activer les raccourcis clavier</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableKeyboardShortcuts}
                onChange={(e) => setSettings({ ...settings, enableKeyboardShortcuts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Animations</div>
              <div className="text-sm text-gray-600">Activer les transitions et animations</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAnimations}
                onChange={(e) => setSettings({ ...settings, enableAnimations: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Canvas Settings Component
const CanvasSettings: React.FC = () => {
  const [canvasSettings, setCanvasSettings] = useState({
    defaultNodeColor: '#6b7280',
    defaultNodeShape: 'rectangle',
    defaultFontSize: 14,
    defaultConnectionStyle: 'straight',
    gridSize: 20,
    snapToGrid: false,
    defaultZoom: 100,
    maxZoom: 300,
    minZoom: 25,
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* Default Node Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nœuds par Défaut</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur par défaut
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={canvasSettings.defaultNodeColor}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, defaultNodeColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={canvasSettings.defaultNodeColor}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, defaultNodeColor: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#6b7280"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forme par défaut
            </label>
            <select
              value={canvasSettings.defaultNodeShape}
              onChange={(e) => setCanvasSettings({ ...canvasSettings, defaultNodeShape: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rectangle">Rectangle</option>
              <option value="rounded-rectangle">Rectangle arrondi</option>
              <option value="circle">Cercle</option>
              <option value="ellipse">Ellipse</option>
              <option value="diamond">Diamant</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille de police par défaut
            </label>
            <input
              type="number"
              min="8"
              max="32"
              value={canvasSettings.defaultFontSize}
              onChange={(e) => setCanvasSettings({ ...canvasSettings, defaultFontSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Grille du Canvas</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Aligner sur la grille</div>
              <div className="text-sm text-gray-600">Aligner automatiquement les nœuds sur la grille</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={canvasSettings.snapToGrid}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, snapToGrid: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille de la grille (pixels)
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={canvasSettings.gridSize}
              onChange={(e) => setCanvasSettings({ ...canvasSettings, gridSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Zoom Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Zoom</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom par défaut (%)
            </label>
            <input
              type="number"
              min="25"
              max="300"
              step="25"
              value={canvasSettings.defaultZoom}
              onChange={(e) => setCanvasSettings({ ...canvasSettings, defaultZoom: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom minimum (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                step="5"
                value={canvasSettings.minZoom}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, minZoom: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom maximum (%)
              </label>
              <input
                type="number"
                min="200"
                max="500"
                step="25"
                value={canvasSettings.maxZoom}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, maxZoom: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other sections
const ExportSettings: React.FC = () => {
  const [exportSettings, setExportSettings] = useState({
    defaultFormat: 'png',
    quality: 90,
    scale: 1.0,
    includeBackground: true,
    backgroundColor: '#ffffff',
    autoOpenDownload: true,
    compressionLevel: 'medium',
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* Default Export Format */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Format par Défaut</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'export par défaut
            </label>
            <select
              value={exportSettings.defaultFormat}
              onChange={(e) => setExportSettings({ ...exportSettings, defaultFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="png">PNG (Image)</option>
              <option value="svg">SVG (Vectoriel)</option>
              <option value="pdf">PDF (Document)</option>
              <option value="json">JSON (Données)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualité PNG ({exportSettings.quality}%)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={exportSettings.quality}
              onChange={(e) => setExportSettings({ ...exportSettings, quality: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Faible</span>
              <span>Élevée</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Échelle d'export ({exportSettings.scale}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.5"
              value={exportSettings.scale}
              onChange={(e) => setExportSettings({ ...exportSettings, scale: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Arrière-plan</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Inclure l'arrière-plan</div>
              <div className="text-sm text-gray-600">Inclure la couleur d'arrière-plan dans l'export</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.includeBackground}
                onChange={(e) => setExportSettings({ ...exportSettings, includeBackground: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {exportSettings.includeBackground && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur d'arrière-plan
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={exportSettings.backgroundColor}
                  onChange={(e) => setExportSettings({ ...exportSettings, backgroundColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={exportSettings.backgroundColor}
                  onChange={(e) => setExportSettings({ ...exportSettings, backgroundColor: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Behavior */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Comportement</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Ouvrir automatiquement le téléchargement</div>
              <div className="text-sm text-gray-600">Ouvrir le fichier après l'export</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.autoOpenDownload}
                onChange={(e) => setExportSettings({ ...exportSettings, autoOpenDownload: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de compression
            </label>
            <select
              value={exportSettings.compressionLevel}
              onChange={(e) => setExportSettings({ ...exportSettings, compressionLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Faible (fichier plus volumineux)</option>
              <option value="medium">Moyen (équilibré)</option>
              <option value="high">Élevé (fichier plus petit)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const CollaborationSettings: React.FC = () => {
  const [collabSettings, setCollabSettings] = useState({
    defaultVisibility: 'private',
    allowComments: true,
    enableRealTime: true,
    autoInviteByEmail: false,
    maxCollaborators: 10,
    requireApproval: true,
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* Default Sharing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Partage par Défaut</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité par défaut des nouvelles mind maps
            </label>
            <select
              value={collabSettings.defaultVisibility}
              onChange={(e) => setCollabSettings({ ...collabSettings, defaultVisibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Privé (seulement moi)</option>
              <option value="restricted">Restreint (personnes invitées)</option>
              <option value="public">Public (visible par tous)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre maximum de collaborateurs
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={collabSettings.maxCollaborators}
              onChange={(e) => setCollabSettings({ ...collabSettings, maxCollaborators: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Collaboration Features */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fonctionnalités de Collaboration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Autoriser les commentaires</div>
              <div className="text-sm text-gray-600">Les collaborateurs peuvent ajouter des commentaires</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={collabSettings.allowComments}
                onChange={(e) => setCollabSettings({ ...collabSettings, allowComments: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Collaboration en temps réel</div>
              <div className="text-sm text-gray-600">Voir les modifications des autres en direct</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={collabSettings.enableRealTime}
                onChange={(e) => setCollabSettings({ ...collabSettings, enableRealTime: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Requérir une approbation</div>
              <div className="text-sm text-gray-600">Approuver manuellement les nouvelles collaborations</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={collabSettings.requireApproval}
                onChange={(e) => setCollabSettings({ ...collabSettings, requireApproval: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Invitation Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invitations</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Invitation automatique par email</div>
              <div className="text-sm text-gray-600">Inviter automatiquement en tapant une adresse email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={collabSettings.autoInviteByEmail}
                onChange={(e) => setCollabSettings({ ...collabSettings, autoInviteByEmail: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacySettings: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: false,
    shareAnalytics: false,
    allowIndexing: false,
    showOnlineStatus: true,
    dataRetention: '1year',
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* Profile Visibility */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Visibilité du Profil</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Profil public</div>
              <div className="text-sm text-gray-600">Rendre votre profil visible aux autres utilisateurs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.publicProfile}
                onChange={(e) => setPrivacySettings({ ...privacySettings, publicProfile: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Afficher le statut en ligne</div>
              <div className="text-sm text-gray-600">Indiquer quand vous êtes connecté</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.showOnlineStatus}
                onChange={(e) => setPrivacySettings({ ...privacySettings, showOnlineStatus: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Données et Analytiques</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Partager les données d'utilisation</div>
              <div className="text-sm text-gray-600">Aider à améliorer l'application avec vos données anonymisées</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.shareAnalytics}
                onChange={(e) => setPrivacySettings({ ...privacySettings, shareAnalytics: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Autoriser l'indexation</div>
              <div className="text-sm text-gray-600">Permettre aux moteurs de recherche d'indexer vos mind maps publiques</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.allowIndexing}
                onChange={(e) => setPrivacySettings({ ...privacySettings, allowIndexing: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rétention des données
            </label>
            <select
              value={privacySettings.dataRetention}
              onChange={(e) => setPrivacySettings({ ...privacySettings, dataRetention: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="3months">3 mois</option>
              <option value="6months">6 mois</option>
              <option value="1year">1 an</option>
              <option value="2years">2 ans</option>
              <option value="indefinite">Indéfini</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  const [notifSettings, setNotifSettings] = useState({
    enableAll: true,
    email: true,
    push: false,
    collaboration: true,
    comments: true,
    exports: false,
    updates: true,
    frequency: 'immediate',
  });

  return (
    <div className="max-w-2xl space-y-8">
      {/* General Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications Générales</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Activer toutes les notifications</div>
              <div className="text-sm text-gray-600">Master switch pour toutes les notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, enableAll: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence des notifications
            </label>
            <select
              value={notifSettings.frequency}
              onChange={(e) => setNotifSettings({ ...notifSettings, frequency: e.target.value })}
              disabled={!notifSettings.enableAll}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="immediate">Immédiat</option>
              <option value="hourly">Toutes les heures</option>
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Types de Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Notifications par email</div>
              <div className="text-sm text-gray-600">Recevoir des notifications par email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.email && notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, email: e.target.checked })}
                disabled={!notifSettings.enableAll}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Notifications push</div>
              <div className="text-sm text-gray-600">Notifications du navigateur</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.push && notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, push: e.target.checked })}
                disabled={!notifSettings.enableAll}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Content Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contenu</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Collaborations</div>
              <div className="text-sm text-gray-600">Invitations et activités de collaboration</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.collaboration && notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, collaboration: e.target.checked })}
                disabled={!notifSettings.enableAll}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Commentaires</div>
              <div className="text-sm text-gray-600">Nouveaux commentaires sur vos mind maps</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.comments && notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, comments: e.target.checked })}
                disabled={!notifSettings.enableAll}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Exports terminés</div>
              <div className="text-sm text-gray-600">Confirmation quand vos exports sont prêts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.exports && notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, exports: e.target.checked })}
                disabled={!notifSettings.enableAll}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Mises à jour de l'application</div>
              <div className="text-sm text-gray-600">Nouvelles fonctionnalités et améliorations</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifSettings.updates && notifSettings.enableAll}
                onChange={(e) => setNotifSettings({ ...notifSettings, updates: e.target.checked })}
                disabled={!notifSettings.enableAll}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;