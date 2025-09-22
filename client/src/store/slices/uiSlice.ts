import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Tool, Notification, MindmapCanvasState } from '../../types/local';

// Initial canvas state
const initialCanvasState: MindmapCanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedNodes: [],
  selectedConnections: [],
  isDragging: false,
  isConnecting: false,
  connectingFromNode: undefined,
  mousePosition: { x: 0, y: 0 },
};

// Initial state
const initialState: UIState = {
  canvas: initialCanvasState,
  selectedTool: 'select',
  showSidebar: true,
  showProperties: false,
  theme: 'light',
  notifications: [],
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Tool selection
    setSelectedTool: (state, action: PayloadAction<Tool>) => {
      state.selectedTool = action.payload;
      // Clear connecting state when switching tools
      if (action.payload !== 'connection') {
        state.canvas.isConnecting = false;
        state.canvas.connectingFromNode = undefined;
      }
    },

    // Canvas operations
    updateCanvasState: (state, action: PayloadAction<Partial<MindmapCanvasState>>) => {
      state.canvas = { ...state.canvas, ...action.payload };
    },

    setZoom: (state, action: PayloadAction<number>) => {
      state.canvas.zoom = Math.max(0.1, Math.min(3, action.payload));
    },

    setPan: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.canvas.panX = action.payload.x;
      state.canvas.panY = action.payload.y;
    },

    resetCanvasView: (state) => {
      state.canvas.zoom = 1;
      state.canvas.panX = 0;
      state.canvas.panY = 0;
    },

    setMousePosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.canvas.mousePosition = action.payload;
    },

    // Selection operations
    selectNodes: (state, action: PayloadAction<string[]>) => {
      state.canvas.selectedNodes = action.payload;
      // Clear connection selection when selecting nodes
      if (action.payload.length > 0) {
        state.canvas.selectedConnections = [];
      }
    },

    selectConnections: (state, action: PayloadAction<string[]>) => {
      state.canvas.selectedConnections = action.payload;
      // Clear node selection when selecting connections
      if (action.payload.length > 0) {
        state.canvas.selectedNodes = [];
      }
    },

    toggleNodeSelection: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      const index = state.canvas.selectedNodes.indexOf(nodeId);
      
      if (index === -1) {
        state.canvas.selectedNodes.push(nodeId);
      } else {
        state.canvas.selectedNodes.splice(index, 1);
      }
    },

    clearSelection: (state) => {
      state.canvas.selectedNodes = [];
      state.canvas.selectedConnections = [];
    },

    // Connection mode
    startConnecting: (state, action: PayloadAction<string>) => {
      state.canvas.isConnecting = true;
      state.canvas.connectingFromNode = action.payload;
      state.selectedTool = 'connection';
    },

    stopConnecting: (state) => {
      state.canvas.isConnecting = false;
      state.canvas.connectingFromNode = undefined;
    },

    // Drag operations
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.canvas.isDragging = action.payload;
    },

    // Panel visibility
    toggleSidebar: (state) => {
      state.showSidebar = !state.showSidebar;
    },

    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.showSidebar = action.payload;
    },

    toggleProperties: (state) => {
      state.showProperties = !state.showProperties;
    },

    setProperties: (state, action: PayloadAction<boolean>) => {
      state.showProperties = action.payload;
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      // Save to localStorage
      localStorage.setItem('theme', action.payload);
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...action.payload,
      };
      state.notifications.push(notification);

      // Auto-remove notifications after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          // This will be handled by the notification component
        }, notification.duration || 5000);
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Keyboard shortcuts and interactions
    setKeyboardShortcutsEnabled: (state, action: PayloadAction<boolean>) => {
      // This could be expanded for accessibility options
      // For now, it's a placeholder for future keyboard navigation features
    },
  },
});

export const {
  setSelectedTool,
  updateCanvasState,
  setZoom,
  setPan,
  resetCanvasView,
  setMousePosition,
  selectNodes,
  selectConnections,
  toggleNodeSelection,
  clearSelection,
  startConnecting,
  stopConnecting,
  setDragging,
  toggleSidebar,
  setSidebar,
  toggleProperties,
  setProperties,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setKeyboardShortcutsEnabled,
} = uiSlice.actions;

export default uiSlice.reducer;