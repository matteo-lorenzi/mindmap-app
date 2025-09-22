import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  MindmapState,
  Mindmap,
  MindmapNode,
  Connection,
  CreateMindmapRequest,
  UpdateMindmapRequest,
} from "../../types/local";
import * as mindmapAPI from "../../services/mindmapAPI";
import { hybridMindmapService } from "../../services/hybridStorage";

// Async thunks
export const fetchMindmaps = createAsyncThunk(
  "mindmap/fetchMindmaps",
  async (_, { rejectWithValue }) => {
    try {
      // Use hybrid service for loading all mindmaps
      const mindmaps = await hybridMindmapService.loadAllMindmaps();
      return mindmaps;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch mindmaps");
    }
  }
);

export const fetchMindmap = createAsyncThunk(
  "mindmap/fetchMindmap",
  async (id: string, { rejectWithValue }) => {
    try {
      // Use hybrid service for loading mindmap
      const mindmap = await hybridMindmapService.loadMindmap(id);

      if (mindmap) {
        return mindmap;
      }

      // If not found anywhere, create a new mindmap with sample data
      const sampleMindmap: Mindmap = {
        id,
        userId: "local-user",
        title: `New Mind Map`,
        description: "Start building your mind map",
        isPublic: false,
        nodes: [
          {
            id: "node-1",
            mindmapId: id,
            text: "Central Topic",
            x: 400,
            y: 300,
            width: 150,
            height: 80,
            color: "#ffffff",
            backgroundColor: "#6b7280",
            fontSize: 16,
            fontWeight: "bold",
            shape: "rectangle",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        connections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save using hybrid service
      await hybridMindmapService.saveMindmap({
        id: sampleMindmap.id,
        title: sampleMindmap.title,
        description: sampleMindmap.description,
        nodes:
          sampleMindmap.nodes?.reduce((acc, node) => {
            acc[node.id] = node;
            return acc;
          }, {} as { [id: string]: MindmapNode }) || {},
        connections: {},
      });

      return sampleMindmap;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch mindmap");
    }
  }
);

export const createMindmap = createAsyncThunk(
  "mindmap/createMindmap",
  async (data: CreateMindmapRequest, { rejectWithValue }) => {
    try {
      // Create mindmap directly in database first to get proper CUID
      const dbMindmap = await mindmapAPI.createMindmap({
        title: data.title,
        description: data.description,
        isPublic: false,
      });

      // Create initial node data
      const nodeId = `node_${Date.now()}`;
      const mindmapData = {
        id: dbMindmap.id, // Use real database ID
        title: dbMindmap.title,
        description: dbMindmap.description || "",
        nodes: {
          [nodeId]: {
            id: nodeId,
            mindmapId: dbMindmap.id,
            text: "Central Topic",
            x: 400,
            y: 300,
            width: 150,
            height: 80,
            color: "#ffffff",
            backgroundColor: "#6b7280",
            fontSize: 16,
            fontWeight: "bold",
            shape: "rectangle" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        connections: {},
      };

      // Save to localStorage for offline access
      await hybridMindmapService.saveMindmap(mindmapData);

      // Convert to Mindmap format for state
      const mindmap: Mindmap = {
        id: dbMindmap.id,
        userId: dbMindmap.userId,
        title: dbMindmap.title,
        description: dbMindmap.description || "",
        isPublic: dbMindmap.isPublic,
        nodes: Object.values(mindmapData.nodes),
        connections: Object.values(mindmapData.connections),
        createdAt: dbMindmap.createdAt,
        updatedAt: dbMindmap.updatedAt,
      };

      return mindmap;
    } catch (error: any) {
      // Fallback to localStorage-only mode if database fails
      console.warn("Database creation failed, using localStorage only:", error);

      const tempId = `temp_${Date.now()}`;
      const nodeId = `node_${Date.now()}`;

      const mindmapData = {
        id: tempId,
        title: data.title,
        description: data.description || "",
        nodes: {
          [nodeId]: {
            id: nodeId,
            mindmapId: tempId,
            text: "Central Topic",
            x: 400,
            y: 300,
            width: 150,
            height: 80,
            color: "#ffffff",
            backgroundColor: "#6b7280",
            fontSize: 16,
            fontWeight: "bold",
            shape: "rectangle" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        connections: {},
      };

      // Save to localStorage only
      await hybridMindmapService.saveMindmap(mindmapData);

      const mindmap: Mindmap = {
        id: tempId,
        userId: "local-user",
        title: mindmapData.title,
        description: mindmapData.description,
        isPublic: false,
        nodes: Object.values(mindmapData.nodes),
        connections: Object.values(mindmapData.connections),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return mindmap;
    }
  }
);

export const saveMindmap = createAsyncThunk(
  "mindmap/saveMindmap",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const mindmapState = state.mindmap;

      if (!mindmapState.id) {
        throw new Error("No mindmap to save");
      }

      // Save using hybrid service
      await hybridMindmapService.saveMindmap({
        id: mindmapState.id,
        title: mindmapState.title,
        description: mindmapState.description,
        nodes: mindmapState.nodes,
        connections: mindmapState.connections,
      });

      return {
        id: mindmapState.id,
        savedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to save mindmap");
    }
  }
);

export const updateMindmap = createAsyncThunk(
  "mindmap/updateMindmap",
  async (
    { id, data }: { id: string; data: UpdateMindmapRequest },
    { rejectWithValue }
  ) => {
    try {
      return await mindmapAPI.updateMindmap(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update mindmap"
      );
    }
  }
);

export const deleteMindmap = createAsyncThunk(
  "mindmap/deleteMindmap",
  async (id: string, { rejectWithValue }) => {
    try {
      // Delete using hybrid service
      await hybridMindmapService.deleteMindmap(id);

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete mindmap");
    }
  }
);

// Initial state
const initialState: MindmapState & { mindmaps: Mindmap[] } = {
  mindmaps: [],
  id: undefined,
  title: "",
  description: undefined,
  nodes: {},
  connections: {},
  isLoading: false,
  error: undefined,
  lastSaved: undefined,
  hasUnsavedChanges: false,
};

// Mindmap slice
const mindmapSlice = createSlice({
  name: "mindmap",
  initialState,
  reducers: {
    // Current mindmap operations
    setCurrentMindmap: (state, action: PayloadAction<Mindmap>) => {
      const mindmap = action.payload;
      state.id = mindmap.id;
      state.title = mindmap.title;
      state.description = mindmap.description;

      // Convert arrays to objects for easier access
      state.nodes =
        mindmap.nodes?.reduce((acc, node) => {
          acc[node.id] = node;
          return acc;
        }, {} as { [id: string]: MindmapNode }) || {};

      state.connections =
        mindmap.connections?.reduce((acc, connection) => {
          acc[connection.id] = connection;
          return acc;
        }, {} as { [id: string]: Connection }) || {};

      state.hasUnsavedChanges = false;
      state.error = undefined;
    },

    clearCurrentMindmap: (state) => {
      state.id = undefined;
      state.title = "";
      state.description = undefined;
      state.nodes = {};
      state.connections = {};
      state.hasUnsavedChanges = false;
      state.error = undefined;
    },

    updateMindmapInfo: (
      state,
      action: PayloadAction<{ title?: string; description?: string }>
    ) => {
      if (action.payload.title !== undefined) {
        state.title = action.payload.title;
      }
      if (action.payload.description !== undefined) {
        state.description = action.payload.description;
      }
      state.hasUnsavedChanges = true;
    },

    // Node operations
    addNode: (state, action: PayloadAction<MindmapNode>) => {
      state.nodes[action.payload.id] = action.payload;
      state.hasUnsavedChanges = true;
    },

    updateNode: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<MindmapNode> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.nodes[id]) {
        state.nodes[id] = { ...state.nodes[id], ...updates };
        state.hasUnsavedChanges = true;
      }
    },

    deleteNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      delete state.nodes[nodeId];

      // Remove connections associated with this node
      Object.keys(state.connections).forEach((connectionId) => {
        const connection = state.connections[connectionId];
        if (
          connection.fromNodeId === nodeId ||
          connection.toNodeId === nodeId
        ) {
          delete state.connections[connectionId];
        }
      });

      state.hasUnsavedChanges = true;
    },

    batchUpdateNodes: (
      state,
      action: PayloadAction<
        Array<{ id: string; updates: Partial<MindmapNode> }>
      >
    ) => {
      action.payload.forEach(({ id, updates }) => {
        if (state.nodes[id]) {
          state.nodes[id] = { ...state.nodes[id], ...updates };
        }
      });
      state.hasUnsavedChanges = true;
    },

    // Connection operations
    addConnection: (state, action: PayloadAction<Connection>) => {
      state.connections[action.payload.id] = action.payload;
      state.hasUnsavedChanges = true;
    },

    updateConnection: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Connection> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.connections[id]) {
        state.connections[id] = { ...state.connections[id], ...updates };
        state.hasUnsavedChanges = true;
      }
    },

    deleteConnection: (state, action: PayloadAction<string>) => {
      delete state.connections[action.payload];
      state.hasUnsavedChanges = true;
    },

    // Utility actions
    markAsSaved: (state) => {
      state.hasUnsavedChanges = false;
      state.lastSaved = new Date().toISOString();
    },

    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    // Fetch mindmaps
    builder
      .addCase(fetchMindmaps.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(
        fetchMindmaps.fulfilled,
        (state, action: PayloadAction<Mindmap[]>) => {
          state.isLoading = false;
          state.mindmaps = action.payload;
          state.error = undefined;
        }
      )
      .addCase(fetchMindmaps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single mindmap
    builder
      .addCase(fetchMindmap.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(
        fetchMindmap.fulfilled,
        (state, action: PayloadAction<Mindmap>) => {
          state.isLoading = false;
          const mindmap = action.payload;
          state.id = mindmap.id;
          state.title = mindmap.title;
          state.description = mindmap.description;

          state.nodes =
            mindmap.nodes?.reduce((acc, node) => {
              acc[node.id] = node;
              return acc;
            }, {} as { [id: string]: MindmapNode }) || {};

          state.connections =
            mindmap.connections?.reduce((acc, connection) => {
              acc[connection.id] = connection;
              return acc;
            }, {} as { [id: string]: Connection }) || {};

          state.hasUnsavedChanges = false;
          state.error = undefined;
        }
      )
      .addCase(fetchMindmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create mindmap
    builder
      .addCase(createMindmap.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(
        createMindmap.fulfilled,
        (state, action: PayloadAction<Mindmap>) => {
          state.isLoading = false;
          state.mindmaps.push(action.payload);
          state.error = undefined;
        }
      )
      .addCase(createMindmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save mindmap
    builder
      .addCase(saveMindmap.pending, (state) => {
        // Don't set loading state for saves to avoid UI flicker
        state.error = undefined;
      })
      .addCase(
        saveMindmap.fulfilled,
        (state, action: PayloadAction<{ id: string; savedAt: string }>) => {
          state.hasUnsavedChanges = false;
          state.lastSaved = action.payload.savedAt;
          state.error = undefined;
        }
      )
      .addCase(saveMindmap.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update mindmap
    builder
      .addCase(
        updateMindmap.fulfilled,
        (state, action: PayloadAction<Mindmap>) => {
          const updatedMindmap = action.payload;
          const index = state.mindmaps.findIndex(
            (m) => m.id === updatedMindmap.id
          );
          if (index !== -1) {
            state.mindmaps[index] = updatedMindmap;
          }

          if (state.id === updatedMindmap.id) {
            state.title = updatedMindmap.title;
            state.description = updatedMindmap.description;
            state.hasUnsavedChanges = false;
            state.lastSaved = new Date().toISOString();
          }
        }
      )
      .addCase(updateMindmap.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete mindmap
    builder
      .addCase(
        deleteMindmap.fulfilled,
        (state, action: PayloadAction<string>) => {
          const deletedId = action.payload;
          state.mindmaps = state.mindmaps.filter((m) => m.id !== deletedId);

          if (state.id === deletedId) {
            state.id = undefined;
            state.title = "";
            state.description = undefined;
            state.nodes = {};
            state.connections = {};
            state.hasUnsavedChanges = false;
          }
        }
      )
      .addCase(deleteMindmap.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentMindmap,
  clearCurrentMindmap,
  updateMindmapInfo,
  addNode,
  updateNode,
  deleteNode,
  batchUpdateNodes,
  addConnection,
  updateConnection,
  deleteConnection,
  markAsSaved,
  clearError,
} = mindmapSlice.actions;

export default mindmapSlice.reducer;
