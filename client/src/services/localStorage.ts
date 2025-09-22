import { Mindmap, MindmapNode, Connection } from "../types/local";

const MINDMAPS_KEY = "mindmaps";
const CURRENT_MINDMAP_KEY = "currentMindmap";

export interface StoredMindmap {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  nodes: MindmapNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Get all stored mind maps from localStorage
 */
export const getStoredMindmaps = (): StoredMindmap[] => {
  try {
    const stored = localStorage.getItem(MINDMAPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading mindmaps from localStorage:", error);
    return [];
  }
};

/**
 * Save a mind map to localStorage
 */
export const saveMindmapToStorage = (mindmap: StoredMindmap): void => {
  try {
    const mindmaps = getStoredMindmaps();
    const existingIndex = mindmaps.findIndex((m) => m.id === mindmap.id);

    const updatedMindmap = {
      ...mindmap,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing
      mindmaps[existingIndex] = updatedMindmap;
    } else {
      // Add new
      mindmaps.push(updatedMindmap);
    }

    localStorage.setItem(MINDMAPS_KEY, JSON.stringify(mindmaps));
    console.log(`Saved mindmap "${mindmap.title}" to localStorage`);
  } catch (error) {
    console.error("Error saving mindmap to localStorage:", error);
    throw new Error("Failed to save mindmap");
  }
};

/**
 * Get a specific mind map from localStorage
 */
export const getMindmapFromStorage = (id: string): StoredMindmap | null => {
  try {
    const mindmaps = getStoredMindmaps();
    return mindmaps.find((m) => m.id === id) || null;
  } catch (error) {
    console.error("Error loading mindmap from localStorage:", error);
    return null;
  }
};

/**
 * Delete a mind map from localStorage
 */
export const deleteMindmapFromStorage = (id: string): void => {
  try {
    const mindmaps = getStoredMindmaps();
    const filteredMindmaps = mindmaps.filter((m) => m.id !== id);
    localStorage.setItem(MINDMAPS_KEY, JSON.stringify(filteredMindmaps));
    console.log(`Deleted mindmap ${id} from localStorage`);
  } catch (error) {
    console.error("Error deleting mindmap from localStorage:", error);
    throw new Error("Failed to delete mindmap");
  }
};

/**
 * Create a new mind map in localStorage
 */
export const createMindmapInStorage = (
  title: string,
  description?: string
): StoredMindmap => {
  const newMindmap: StoredMindmap = {
    id: `mindmap_${Date.now()}`,
    userId: "local-user",
    title,
    description,
    isPublic: false,
    nodes: [],
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveMindmapToStorage(newMindmap);
  return newMindmap;
};

/**
 * Save current editing state to localStorage for recovery
 */
export const saveCurrentEditingState = (mindmapData: {
  id: string;
  title: string;
  description?: string;
  nodes: { [id: string]: MindmapNode };
  connections: { [id: string]: Connection };
}): void => {
  try {
    localStorage.setItem(
      CURRENT_MINDMAP_KEY,
      JSON.stringify({
        ...mindmapData,
        lastSaved: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error saving current editing state:", error);
  }
};

/**
 * Load current editing state from localStorage
 */
export const loadCurrentEditingState = (): any | null => {
  try {
    const stored = localStorage.getItem(CURRENT_MINDMAP_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading current editing state:", error);
    return null;
  }
};

/**
 * Clear current editing state
 */
export const clearCurrentEditingState = (): void => {
  try {
    localStorage.removeItem(CURRENT_MINDMAP_KEY);
  } catch (error) {
    console.error("Error clearing current editing state:", error);
  }
};

/**
 * Convert Redux state to storage format
 */
export const convertToStorageFormat = (mindmapState: {
  id: string;
  title: string;
  description?: string;
  nodes: { [id: string]: MindmapNode };
  connections: { [id: string]: Connection };
}): StoredMindmap => {
  return {
    id: mindmapState.id,
    title: mindmapState.title,
    description: mindmapState.description,
    isPublic: false,
    userId: "local-user",
    nodes: Object.values(mindmapState.nodes),
    connections: Object.values(mindmapState.connections),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert storage format to Redux state format
 */
export const convertFromStorageFormat = (stored: StoredMindmap): Mindmap => {
  return {
    id: stored.id,
    userId: stored.userId,
    title: stored.title,
    description: stored.description,
    isPublic: stored.isPublic,
    nodes: stored.nodes,
    connections: stored.connections,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
};
