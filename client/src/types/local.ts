// Simplified local types for immediate use

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface Mindmap {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  nodes?: MindmapNode[];
  connections?: Connection[];
  collaborations?: Array<{
    id: string;
    role: "viewer" | "editor" | "owner";
    userId: string;
    user: User;
    createdAt: string;
    updatedAt: string;
  }>;
  _count?: {
    nodes: number;
    connections: number;
  };
}

export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: string;
  shape: "rectangle" | "ellipse" | "circle" | "diamond" | "rounded-rectangle";
  createdAt: string;
  updatedAt: string;
  mindmapId: string;
}

export interface Connection {
  id: string;
  label?: string;
  style: "solid" | "dashed" | "dotted" | "straight";
  color: string;
  strokeColor: string;
  strokeWidth: number;
  createdAt: string;
  updatedAt: string;
  mindmapId: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface CreateMindmapRequest {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateMindmapRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
}

// UI State
export interface MindmapCanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodes: string[];
  selectedConnections: string[];
  isDragging: boolean;
  isConnecting: boolean;
  connectingFromNode?: string;
  mousePosition: { x: number; y: number };
}

export interface MindmapState {
  id?: string;
  title: string;
  description?: string;
  nodes: { [id: string]: MindmapNode };
  connections: { [id: string]: Connection };
  isLoading: boolean;
  error?: string;
  lastSaved?: string;
  hasUnsavedChanges: boolean;
  mindmaps: Mindmap[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export type Tool = "select" | "pan" | "node" | "connection" | "text" | "delete";

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: "primary" | "secondary" | "danger";
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface UIState {
  canvas: MindmapCanvasState;
  selectedTool: Tool;
  showSidebar: boolean;
  showProperties: boolean;
  theme: "light" | "dark";
  notifications: Notification[];
}
