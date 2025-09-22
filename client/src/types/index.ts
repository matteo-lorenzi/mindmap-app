// Re-export shared types
export * from "./local";

// Import API types from services
import type {
  CreateNodeRequest,
  UpdateNodeRequest,
  BatchUpdateNodesRequest,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  AddCollaboratorRequest,
  Collaboration,
} from "../services/mindmapAPI";

// Import all types from local for use in this file
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Mindmap,
  MindmapNode as Node, // Alias for backward compatibility
  Connection,
  CreateMindmapRequest,
  UpdateMindmapRequest,
  MindmapState,
  MindmapCanvasState as CanvasState,
} from "./local";

// Frontend-specific types
export interface AppState {
  auth: AuthState;
  mindmap: MindmapState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface UIState {
  canvas: CanvasState;
  selectedTool: Tool;
  showSidebar: boolean;
  showProperties: boolean;
  theme: "light" | "dark";
  notifications: Notification[];
}

export type Tool = "select" | "pan" | "node" | "connection" | "text" | "delete";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: "primary" | "secondary" | "danger";
}

// Component Props types
export interface MindmapCanvasProps {
  mindmap: Mindmap;
  nodes: Node[];
  connections: Connection[];
  canvasState: CanvasState;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete: (nodeId: string) => void;
  onConnectionCreate: (fromNodeId: string, toNodeId: string) => void;
  onConnectionDelete: (connectionId: string) => void;
  onCanvasStateChange: (state: Partial<CanvasState>) => void;
}

export interface NodeComponentProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (updates: Partial<Node>) => void;
  onDelete: () => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
}

export interface ConnectionComponentProps {
  connection: Connection;
  fromNode: Node;
  toNode: Node;
  isSelected: boolean;
  onSelect: (connectionId: string) => void;
  onUpdate: (updates: Partial<Connection>) => void;
  onDelete: () => void;
}

export interface ToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
}

export interface PropertiesPanelProps {
  selectedNodes: Node[];
  selectedConnections: Connection[];
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onConnectionUpdate: (
    connectionId: string,
    updates: Partial<Connection>
  ) => void;
}

// API Service types
export interface APIService {
  // Auth methods
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  refreshToken: () => Promise<{ token: string }>;
  getCurrentUser: () => Promise<{ user: User }>;

  // Mindmap methods
  getMindmaps: () => Promise<Mindmap[]>;
  getMindmap: (id: string) => Promise<Mindmap>;
  createMindmap: (data: CreateMindmapRequest) => Promise<Mindmap>;
  updateMindmap: (id: string, data: UpdateMindmapRequest) => Promise<Mindmap>;
  deleteMindmap: (id: string) => Promise<void>;

  // Node methods
  createNode: (data: CreateNodeRequest) => Promise<Node>;
  updateNode: (id: string, data: UpdateNodeRequest) => Promise<Node>;
  deleteNode: (id: string) => Promise<void>;
  batchUpdateNodes: (data: BatchUpdateNodesRequest) => Promise<Node[]>;

  // Connection methods
  createConnection: (data: CreateConnectionRequest) => Promise<Connection>;
  updateConnection: (
    id: string,
    data: UpdateConnectionRequest
  ) => Promise<Connection>;
  deleteConnection: (id: string) => Promise<void>;

  // Collaboration methods
  addCollaborator: (
    mindmapId: string,
    data: AddCollaboratorRequest
  ) => Promise<Collaboration>;
  removeCollaborator: (mindmapId: string, userId: string) => Promise<void>;
}

// Redux Action Types
export interface ReduxAction<T = any> {
  type: string;
  payload?: T;
}

// Local Storage types
export interface LocalStorageData {
  auth?: {
    token: string;
    user: User;
  };
  ui?: {
    theme: "light" | "dark";
    sidebarCollapsed: boolean;
  };
  drafts?: {
    [mindmapId: string]: {
      nodes: { [id: string]: Node };
      connections: { [id: string]: Connection };
      lastModified: string;
    };
  };
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}
