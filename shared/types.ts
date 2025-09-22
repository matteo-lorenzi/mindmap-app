// Shared types for mind map application

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  nodes?: Node[];
  connections?: Connection[];
  collaborations?: Collaboration[];
  _count?: {
    nodes: number;
    connections: number;
  };
}

export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize: number;
  shape: 'rectangle' | 'ellipse' | 'circle' | 'diamond';
  createdAt: string;
  updatedAt: string;
  mindmapId: string;
  mindmap?: Mindmap;
  connectionsFrom?: Connection[];
  connectionsTo?: Connection[];
}

export interface Connection {
  id: string;
  label?: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  createdAt: string;
  updatedAt: string;
  mindmapId: string;
  fromNodeId: string;
  toNodeId: string;
  mindmap?: Mindmap;
  fromNode?: Node;
  toNode?: Node;
}

export interface Collaboration {
  id: string;
  role: 'viewer' | 'editor' | 'owner';
  createdAt: string;
  updatedAt: string;
  userId: string;
  mindmapId: string;
  user?: User;
  mindmap?: Mindmap;
}

// API Request/Response types

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

export interface CreateNodeRequest {
  mindmapId: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  shape?: Node['shape'];
}

export interface UpdateNodeRequest {
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  shape?: Node['shape'];
}

export interface BatchUpdateNodesRequest {
  updates: Array<{
    id: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    color?: string;
    fontSize?: number;
    shape?: Node['shape'];
  }>;
}

export interface CreateConnectionRequest {
  mindmapId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  style?: Connection['style'];
  color?: string;
}

export interface UpdateConnectionRequest {
  label?: string;
  style?: Connection['style'];
  color?: string;
}

export interface AddCollaboratorRequest {
  email: string;
  role?: Collaboration['role'];
}

// Canvas/UI related types

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNodes: string[];
  selectedConnections: string[];
  isDragging: boolean;
  isConnecting: boolean;
  connectingFromNode?: string;
  mousePosition: Point;
}

export interface MindmapState {
  id?: string;
  title: string;
  description?: string;
  nodes: { [id: string]: Node };
  connections: { [id: string]: Connection };
  isLoading: boolean;
  error?: string;
  lastSaved?: string;
  hasUnsavedChanges: boolean;
}

// Socket.io event types

export interface SocketEvents {
  // Client to server
  'join-mindmap': (mindmapId: string) => void;
  'leave-mindmap': (mindmapId: string) => void;
  'node-update': (data: { mindmapId: string; node: Node }) => void;
  'connection-update': (data: { mindmapId: string; connection: Connection }) => void;

  // Server to client
  'node-updated': (data: { mindmapId: string; node: Node }) => void;
  'connection-updated': (data: { mindmapId: string; connection: Connection }) => void;
  'user-joined': (data: { userId: string; userName: string }) => void;
  'user-left': (data: { userId: string; userName: string }) => void;
}

// Export/Import types

export interface ExportOptions {
  format: 'json' | 'png' | 'pdf' | 'svg';
  includeMetadata?: boolean;
  backgroundColor?: string;
  padding?: number;
  scale?: number;
}

export interface ExportData {
  mindmap: Omit<Mindmap, 'user' | 'collaborations'>;
  nodes: Node[];
  connections: Connection[];
  exportedAt: string;
  version: string;
}

// Theme types

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

// Error types

export interface APIError {
  error: string;
  message?: string;
  statusCode?: number;
}

// Utility types

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};