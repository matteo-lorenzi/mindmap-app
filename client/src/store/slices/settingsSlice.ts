import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types pour les paramètres
export interface UserSettings {
  // Profil utilisateur
  name: string;
  email: string;
  avatarUrl?: string;

  // Préférences d'apparence
  theme: "light" | "dark" | "auto";
  language: "fr" | "en" | "es" | "de";

  // Paramètres d'application
  autoSave: boolean;
  autoSaveInterval: number; // en secondes
  showGridLines: boolean;
  enableKeyboardShortcuts: boolean;
  enableAnimations: boolean;

  // Paramètres du canvas
  defaultNodeColor: string;
  defaultTextColor: string;
  defaultNodeShape:
    | "rectangle"
    | "rounded-rectangle"
    | "circle"
    | "ellipse"
    | "diamond";
  defaultFontSize: number;
  defaultConnectionStyle: "straight" | "curved" | "dashed" | "dotted";
  gridSize: number;
  snapToGrid: boolean;
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;

  // Paramètres d'export
  defaultExportFormat: "png" | "svg" | "pdf" | "json";
  exportQuality: number; // 1-100 pour PNG
  exportScale: number; // 0.5-3.0
  includeBackground: boolean;
  backgroundColor: string;

  // Paramètres de collaboration
  defaultMindmapVisibility: "private" | "public";
  allowComments: boolean;
  enableRealTimeCollab: boolean;

  // Notifications
  enableNotifications: boolean;
  emailNotifications: boolean;
  collaborationNotifications: boolean;
  exportNotifications: boolean;

  // Confidentialité
  shareAnalytics: boolean;
  publicProfile: boolean;
}

export interface SettingsState {
  userSettings: UserSettings;
  isLoading: boolean;
  error?: string;
  hasUnsavedChanges: boolean;
  lastSaved?: string;
}

// Paramètres par défaut
const defaultSettings: UserSettings = {
  // Profil
  name: "",
  email: "",

  // Apparence
  theme: "light",
  language: "fr",

  // Application
  autoSave: true,
  autoSaveInterval: 30,
  showGridLines: true,
  enableKeyboardShortcuts: true,
  enableAnimations: true,

  // Canvas
  defaultNodeColor: "#6b7280",
  defaultTextColor: "#ffffff",
  defaultNodeShape: "rectangle",
  defaultFontSize: 14,
  defaultConnectionStyle: "straight",
  gridSize: 20,
  snapToGrid: false,
  defaultZoom: 100,
  maxZoom: 300,
  minZoom: 25,

  // Export
  defaultExportFormat: "png",
  exportQuality: 90,
  exportScale: 1.0,
  includeBackground: true,
  backgroundColor: "#ffffff",

  // Collaboration
  defaultMindmapVisibility: "private",
  allowComments: true,
  enableRealTimeCollab: true,

  // Notifications
  enableNotifications: true,
  emailNotifications: true,
  collaborationNotifications: true,
  exportNotifications: false,

  // Confidentialité
  shareAnalytics: false,
  publicProfile: false,
};

// Thunks pour les opérations asynchrones
export const loadUserSettings = createAsyncThunk(
  "settings/loadUserSettings",
  async (_, { rejectWithValue }) => {
    try {
      // Charger depuis localStorage ou API
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return JSON.parse(savedSettings) as UserSettings;
      }

      // TODO: Charger depuis l'API quand disponible
      // const response = await settingsAPI.getUserSettings();
      // return response.data;

      return defaultSettings;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Erreur lors du chargement des paramètres"
      );
    }
  }
);

export const saveUserSettings = createAsyncThunk(
  "settings/saveUserSettings",
  async (settings: UserSettings, { rejectWithValue }) => {
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));

      // TODO: Sauvegarder via l'API quand disponible
      // await settingsAPI.updateUserSettings(settings);

      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 500));

      return settings;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Erreur lors de la sauvegarde des paramètres"
      );
    }
  }
);

export const resetUserSettings = createAsyncThunk(
  "settings/resetUserSettings",
  async (_, { rejectWithValue }) => {
    try {
      // Supprimer les paramètres sauvegardés
      localStorage.removeItem("userSettings");

      // TODO: Reset via l'API quand disponible
      // await settingsAPI.resetUserSettings();

      return defaultSettings;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Erreur lors de la réinitialisation des paramètres"
      );
    }
  }
);

// État initial
const initialState: SettingsState = {
  userSettings: defaultSettings,
  isLoading: false,
  error: undefined,
  hasUnsavedChanges: false,
  lastSaved: undefined,
};

// Slice Redux
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Mettre à jour un paramètre spécifique
    updateSetting: (
      state,
      action: PayloadAction<{ key: keyof UserSettings; value: any }>
    ) => {
      const { key, value } = action.payload;
      (state.userSettings as any)[key] = value;
      state.hasUnsavedChanges = true;
      state.error = undefined;
    },

    // Mettre à jour plusieurs paramètres
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.userSettings = { ...state.userSettings, ...action.payload };
      state.hasUnsavedChanges = true;
      state.error = undefined;
    },

    // Marquer comme sauvegardé
    markAsSaved: (state) => {
      state.hasUnsavedChanges = false;
      state.lastSaved = new Date().toISOString();
    },

    // Annuler les modifications non sauvegardées
    discardChanges: (state) => {
      // Recharger depuis localStorage
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        state.userSettings = JSON.parse(savedSettings);
      } else {
        state.userSettings = defaultSettings;
      }
      state.hasUnsavedChanges = false;
      state.error = undefined;
    },

    // Effacer les erreurs
    clearError: (state) => {
      state.error = undefined;
    },

    // Appliquer le thème
    applyTheme: (state, action: PayloadAction<"light" | "dark" | "auto">) => {
      state.userSettings.theme = action.payload;
      state.hasUnsavedChanges = true;

      // Appliquer immédiatement le thème
      const root = document.documentElement;
      if (action.payload === "dark") {
        root.classList.add("dark");
      } else if (action.payload === "light") {
        root.classList.remove("dark");
      } else {
        // Auto: utiliser la préférence système
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Chargement des paramètres
    builder
      .addCase(loadUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(loadUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSettings = { ...defaultSettings, ...action.payload };
        state.hasUnsavedChanges = false;
        state.error = undefined;
      })
      .addCase(loadUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sauvegarde des paramètres
    builder
      .addCase(saveUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(saveUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSettings = action.payload;
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
        state.error = undefined;
      })
      .addCase(saveUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Réinitialisation des paramètres
    builder
      .addCase(resetUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(resetUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSettings = action.payload;
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
        state.error = undefined;
      })
      .addCase(resetUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  updateSetting,
  updateSettings,
  markAsSaved,
  discardChanges,
  clearError,
  applyTheme,
} = settingsSlice.actions;

// Sélecteurs
export const selectUserSettings = (state: { settings: SettingsState }) =>
  state.settings.userSettings;
export const selectSettingsLoading = (state: { settings: SettingsState }) =>
  state.settings.isLoading;
export const selectSettingsError = (state: { settings: SettingsState }) =>
  state.settings.error;
export const selectHasUnsavedChanges = (state: { settings: SettingsState }) =>
  state.settings.hasUnsavedChanges;
export const selectLastSaved = (state: { settings: SettingsState }) =>
  state.settings.lastSaved;

// Sélecteurs spécifiques
export const selectTheme = (state: { settings: SettingsState }) =>
  state.settings.userSettings.theme;
export const selectLanguage = (state: { settings: SettingsState }) =>
  state.settings.userSettings.language;
export const selectCanvasSettings = (state: { settings: SettingsState }) => ({
  defaultNodeColor: state.settings.userSettings.defaultNodeColor,
  defaultTextColor: state.settings.userSettings.defaultTextColor,
  defaultNodeShape: state.settings.userSettings.defaultNodeShape,
  defaultFontSize: state.settings.userSettings.defaultFontSize,
  defaultConnectionStyle: state.settings.userSettings.defaultConnectionStyle,
  gridSize: state.settings.userSettings.gridSize,
  snapToGrid: state.settings.userSettings.snapToGrid,
  showGridLines: state.settings.userSettings.showGridLines,
});

export const selectExportSettings = (state: { settings: SettingsState }) => ({
  defaultExportFormat: state.settings.userSettings.defaultExportFormat,
  exportQuality: state.settings.userSettings.exportQuality,
  exportScale: state.settings.userSettings.exportScale,
  includeBackground: state.settings.userSettings.includeBackground,
  backgroundColor: state.settings.userSettings.backgroundColor,
});

export default settingsSlice.reducer;
