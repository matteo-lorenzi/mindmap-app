import { apiClient } from "./authAPI";
import {
  Mindmap,
  MindmapNode,
  Connection,
  CreateMindmapRequest,
  UpdateMindmapRequest,
} from "../types/local";

// Additional request types
export interface CreateNodeRequest {
  mindmapId: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string;
  shape?: "rectangle" | "ellipse" | "circle" | "diamond" | "rounded-rectangle";
}

export interface UpdateNodeRequest {
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string;
  shape?: "rectangle" | "ellipse" | "circle" | "diamond" | "rounded-rectangle";
}

export interface BatchUpdateNodesRequest {
  nodes: Array<{ id: string; updates: UpdateNodeRequest }>;
}

export interface CreateConnectionRequest {
  mindmapId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  style?: "solid" | "dashed" | "dotted" | "straight";
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface UpdateConnectionRequest {
  label?: string;
  style?: "solid" | "dashed" | "dotted" | "straight";
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface AddCollaboratorRequest {
  email: string;
  role: "viewer" | "editor" | "owner";
}

export interface Collaboration {
  id: string;
  role: "viewer" | "editor" | "owner";
  userId: string;
  mindmapId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mindmap operations
export const getMindmaps = async (): Promise<Mindmap[]> => {
  const response = await apiClient.get("/mindmaps");
  return response.data;
};

export const getMindmap = async (id: string): Promise<Mindmap> => {
  const response = await apiClient.get(`/mindmaps/${id}`);
  return response.data;
};

export const createMindmap = async (
  data: CreateMindmapRequest
): Promise<Mindmap> => {
  const response = await apiClient.post("/mindmaps", data);
  return response.data;
};

export const updateMindmap = async (
  id: string,
  data: UpdateMindmapRequest
): Promise<Mindmap> => {
  const response = await apiClient.put(`/mindmaps/${id}`, data);
  return response.data;
};

export const deleteMindmap = async (id: string): Promise<void> => {
  await apiClient.delete(`/mindmaps/${id}`);
};

// Node operations
export const createNode = async (
  data: CreateNodeRequest
): Promise<MindmapNode> => {
  const response = await apiClient.post("/nodes", data);
  return response.data;
};

export const updateNode = async (
  id: string,
  data: UpdateNodeRequest
): Promise<MindmapNode> => {
  const response = await apiClient.put(`/nodes/${id}`, data);
  return response.data;
};

export const deleteNode = async (id: string): Promise<void> => {
  await apiClient.delete(`/nodes/${id}`);
};

export const batchUpdateNodes = async (
  data: BatchUpdateNodesRequest
): Promise<MindmapNode[]> => {
  const response = await apiClient.patch("/nodes/batch", data);
  return response.data;
};

// Connection operations
export const createConnection = async (
  data: CreateConnectionRequest
): Promise<Connection> => {
  const response = await apiClient.post("/connections", data);
  return response.data;
};

export const updateConnection = async (
  id: string,
  data: UpdateConnectionRequest
): Promise<Connection> => {
  const response = await apiClient.put(`/connections/${id}`, data);
  return response.data;
};

export const deleteConnection = async (id: string): Promise<void> => {
  await apiClient.delete(`/connections/${id}`);
};

export const getConnectionsForMindmap = async (
  mindmapId: string
): Promise<Connection[]> => {
  const response = await apiClient.get(`/connections/mindmap/${mindmapId}`);
  return response.data;
};

// Collaboration operations
export const addCollaborator = async (
  mindmapId: string,
  data: AddCollaboratorRequest
): Promise<Collaboration> => {
  const response = await apiClient.post(
    `/mindmaps/${mindmapId}/collaborators`,
    data
  );
  return response.data;
};

export const removeCollaborator = async (
  mindmapId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/mindmaps/${mindmapId}/collaborators/${userId}`);
};

// Export operations (to be implemented later)
export const exportMindmap = async (
  mindmapId: string,
  format: "json" | "png" | "pdf" | "svg"
): Promise<Blob> => {
  const response = await apiClient.get(`/mindmaps/${mindmapId}/export`, {
    params: { format },
    responseType: "blob",
  });
  return response.data;
};

// Search operations (for future implementation)
export const searchMindmaps = async (query: string): Promise<Mindmap[]> => {
  const response = await apiClient.get("/mindmaps/search", {
    params: { q: query },
  });
  return response.data;
};
