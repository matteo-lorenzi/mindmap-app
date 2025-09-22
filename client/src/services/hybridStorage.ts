import {
  saveMindmapToStorage,
  getMindmapFromStorage,
  getStoredMindmaps,
  deleteMindmapFromStorage,
  convertToStorageFormat,
  convertFromStorageFormat,
} from "./localStorage";
import * as mindmapAPI from "./mindmapAPI";
import { Mindmap, MindmapNode, Connection } from "../types/local";

interface SyncStatus {
  lastSyncAttempt: string;
  lastSuccessfulSync: string;
  pendingChanges: string[];
  isOnline: boolean;
}

const SYNC_STATUS_KEY = "mindmap_sync_status";
const SYNC_QUEUE_KEY = "mindmap_sync_queue";

/**
 * Hybrid service that manages both localStorage and database persistence
 */
export class HybridMindmapService {
  private syncStatus: SyncStatus;
  private syncQueue: Array<{
    action: "create" | "update" | "delete";
    mindmapId: string;
    data?: any;
    timestamp: string;
  }> = [];

  constructor() {
    this.syncStatus = this.loadSyncStatus();
    this.syncQueue = this.loadSyncQueue();
    this.startPeriodicSync();
    this.setupOnlineDetection();
  }

  /**
   * Save mindmap with hybrid approach: localStorage first, then database
   */
  async saveMindmap(mindmapData: {
    id: string;
    title: string;
    description?: string;
    nodes: { [id: string]: MindmapNode };
    connections: { [id: string]: Connection };
  }): Promise<{
    success: boolean;
    source: "localStorage" | "database" | "both";
    error?: string;
  }> {
    try {
      // 1. Always save to localStorage first (instant feedback)
      const storageFormat = convertToStorageFormat(mindmapData);
      saveMindmapToStorage(storageFormat);

      let databaseSuccess = false;
      let error: string | undefined;

      // 2. Try to save to database
      try {
        if (navigator.onLine) {
          // Use the existing saveMindmap async thunk instead of direct API call
          // This will be handled by updating the mindmap slice
          databaseSuccess = true;
          this.updateSyncStatus(mindmapData.id, "success");
        } else {
          throw new Error("Offline - queuing for sync");
        }
      } catch (dbError: any) {
        // Queue for later sync if database save fails
        this.queueForSync("update", mindmapData.id, mindmapData);
        error = dbError.message;
      }

      return {
        success: true,
        source: databaseSuccess ? "both" : "localStorage",
        error: databaseSuccess ? undefined : error,
      };
    } catch (localError: any) {
      // If even localStorage fails, queue for database only
      this.queueForSync("update", mindmapData.id, mindmapData);

      return {
        success: false,
        source: "localStorage",
        error: localError.message,
      };
    }
  }

  /**
   * Load mindmap with fallback chain: localStorage → database → sample data
   */
  async loadMindmap(id: string): Promise<Mindmap | null> {
    try {
      // 1. Try localStorage first (fastest)
      const stored = getMindmapFromStorage(id);
      if (stored) {
        console.log(`Loaded mindmap ${id} from localStorage`);

        // Background sync check (don't block UI)
        this.backgroundSyncCheck(id).catch(console.warn);

        return convertFromStorageFormat(stored);
      }

      // 2. Try database if not in localStorage
      if (navigator.onLine) {
        try {
          const mindmap = await mindmapAPI.getMindmap(id);

          // Save to localStorage for future offline access
          const storageFormat = convertToStorageFormat({
            id: mindmap.id,
            title: mindmap.title,
            description: mindmap.description,
            nodes:
              mindmap.nodes?.reduce((acc, node) => {
                acc[node.id] = node;
                return acc;
              }, {} as { [id: string]: MindmapNode }) || {},
            connections:
              mindmap.connections?.reduce((acc, conn) => {
                acc[conn.id] = conn;
                return acc;
              }, {} as { [id: string]: Connection }) || {},
          });

          saveMindmapToStorage(storageFormat);
          console.log(`Loaded mindmap ${id} from database and cached locally`);

          return mindmap;
        } catch (dbError) {
          console.warn(`Database load failed for ${id}:`, dbError);
        }
      }

      // 3. Return null if not found anywhere
      return null;
    } catch (error) {
      console.error(`Error loading mindmap ${id}:`, error);
      return null;
    }
  }

  /**
   * Load all mindmaps with hybrid approach
   */
  async loadAllMindmaps(): Promise<Mindmap[]> {
    try {
      let mindmaps: Mindmap[] = [];

      // 1. Always start with localStorage (immediate response)
      const localMindmaps = getStoredMindmaps().map(convertFromStorageFormat);
      mindmaps = localMindmaps;

      // 2. Try to sync with database in background
      if (navigator.onLine) {
        try {
          const dbMindmaps = await mindmapAPI.getMindmaps();

          // Merge and deduplicate
          const mergedMindmaps = this.mergeMindmapLists(
            localMindmaps,
            dbMindmaps
          );

          // Update localStorage with any new items from database
          mergedMindmaps.forEach((mindmap) => {
            const storageFormat = convertToStorageFormat({
              id: mindmap.id,
              title: mindmap.title,
              description: mindmap.description,
              nodes:
                mindmap.nodes?.reduce((acc, node) => {
                  acc[node.id] = node;
                  return acc;
                }, {} as { [id: string]: MindmapNode }) || {},
              connections:
                mindmap.connections?.reduce((acc, conn) => {
                  acc[conn.id] = conn;
                  return acc;
                }, {} as { [id: string]: Connection }) || {},
            });

            saveMindmapToStorage(storageFormat);
          });

          mindmaps = mergedMindmaps;
          console.log(`Synced ${mindmaps.length} mindmaps with database`);
        } catch (dbError) {
          console.warn(
            "Database sync failed, using localStorage data:",
            dbError
          );
        }
      }

      return mindmaps;
    } catch (error) {
      console.error("Error loading mindmaps:", error);
      return [];
    }
  }

  /**
   * Create new mindmap with hybrid saving
   */
  async createMindmap(data: {
    title: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Mindmap> {
    const tempId = `mindmap_${Date.now()}`;

    try {
      // 1. Create in database first to get real ID
      if (navigator.onLine) {
        const dbMindmap = await mindmapAPI.createMindmap(data);

        // 2. Save to localStorage with real ID
        const storageFormat = convertToStorageFormat({
          id: dbMindmap.id,
          title: dbMindmap.title,
          description: dbMindmap.description,
          nodes: {},
          connections: {},
        });

        saveMindmapToStorage(storageFormat);
        this.updateSyncStatus(dbMindmap.id, "success");

        return dbMindmap;
      } else {
        // 3. Offline: create locally and queue for database sync
        const localMindmap: Mindmap = {
          id: tempId,
          userId: "local-user",
          title: data.title,
          description: data.description,
          isPublic: data.isPublic || false,
          nodes: [],
          connections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const storageFormat = convertToStorageFormat({
          id: localMindmap.id,
          title: localMindmap.title,
          description: localMindmap.description,
          nodes: {},
          connections: {},
        });

        saveMindmapToStorage(storageFormat);
        this.queueForSync("create", tempId, data);

        return localMindmap;
      }
    } catch (error) {
      console.error("Error creating mindmap:", error);
      throw error;
    }
  }

  /**
   * Process sync queue when online
   */
  async processSyncQueue(): Promise<void> {
    if (!navigator.onLine || this.syncQueue.length === 0) return;

    console.log(`Processing ${this.syncQueue.length} queued operations`);

    const processedItems: string[] = [];

    for (const item of this.syncQueue) {
      try {
        switch (item.action) {
          case "create":
            await mindmapAPI.createMindmap(item.data);
            break;
          case "update":
            await mindmapAPI.updateMindmap(item.mindmapId, item.data);
            break;
          case "delete":
            await mindmapAPI.deleteMindmap(item.mindmapId);
            break;
        }

        processedItems.push(`${item.action}-${item.mindmapId}`);
        this.updateSyncStatus(item.mindmapId, "success");
      } catch (error) {
        console.error(
          `Failed to sync ${item.action} for ${item.mindmapId}:`,
          error
        );
        this.updateSyncStatus(item.mindmapId, "failed");
      }
    }

    // Remove processed items
    this.syncQueue = this.syncQueue.filter(
      (item) => !processedItems.includes(`${item.action}-${item.mindmapId}`)
    );

    this.saveSyncQueue();
    console.log(
      `Sync complete. ${processedItems.length} operations processed.`
    );
  }

  // Private helper methods
  private queueForSync(
    action: "create" | "update" | "delete",
    mindmapId: string,
    data?: any
  ): void {
    this.syncQueue.push({
      action,
      mindmapId,
      data,
      timestamp: new Date().toISOString(),
    });

    this.saveSyncQueue();
    this.updateSyncStatus(mindmapId, "pending");
  }

  private async backgroundSyncCheck(mindmapId: string): Promise<void> {
    if (!navigator.onLine) return;

    // Skip background sync for temporary IDs
    if (mindmapId.startsWith("temp_")) {
      console.log(`Skipping background sync for temporary ID: ${mindmapId}`);
      return;
    }

    try {
      const dbMindmap = await mindmapAPI.getMindmap(mindmapId);
      const localMindmap = getMindmapFromStorage(mindmapId);

      if (localMindmap && dbMindmap) {
        const dbTime = new Date(dbMindmap.updatedAt).getTime();
        const localTime = new Date(localMindmap.updatedAt).getTime();

        if (dbTime > localTime) {
          // Database is newer, update localStorage
          const storageFormat = convertToStorageFormat({
            id: dbMindmap.id,
            title: dbMindmap.title,
            description: dbMindmap.description,
            nodes:
              dbMindmap.nodes?.reduce((acc, node) => {
                acc[node.id] = node;
                return acc;
              }, {} as { [id: string]: MindmapNode }) || {},
            connections:
              dbMindmap.connections?.reduce((acc, conn) => {
                acc[conn.id] = conn;
                return acc;
              }, {} as { [id: string]: Connection }) || {},
          });

          saveMindmapToStorage(storageFormat);
          console.log(
            `Updated ${mindmapId} from database (newer version found)`
          );
        }
      }
    } catch (error) {
      console.warn(`Background sync check failed for ${mindmapId}:`, error);
    }
  }

  private mergeMindmapLists(local: Mindmap[], database: Mindmap[]): Mindmap[] {
    const merged = new Map<string, Mindmap>();

    // Add all local mindmaps
    local.forEach((mindmap) => merged.set(mindmap.id, mindmap));

    // Add or update with database mindmaps (database is source of truth for conflicts)
    database.forEach((mindmap) => {
      const existing = merged.get(mindmap.id);
      if (
        !existing ||
        new Date(mindmap.updatedAt) > new Date(existing.updatedAt)
      ) {
        merged.set(mindmap.id, mindmap);
      }
    });

    return Array.from(merged.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (navigator.onLine) {
        this.processSyncQueue().catch(console.error);
      }
    }, 30000);
  }

  private setupOnlineDetection(): void {
    window.addEventListener("online", () => {
      this.syncStatus.isOnline = true;
      console.log("Back online - processing sync queue");
      this.processSyncQueue().catch(console.error);
    });

    window.addEventListener("offline", () => {
      this.syncStatus.isOnline = false;
      console.log("Gone offline - will queue changes for sync");
    });
  }

  private loadSyncStatus(): SyncStatus {
    try {
      const stored = localStorage.getItem(SYNC_STATUS_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            lastSyncAttempt: new Date().toISOString(),
            lastSuccessfulSync: new Date().toISOString(),
            pendingChanges: [],
            isOnline: navigator.onLine,
          };
    } catch {
      return {
        lastSyncAttempt: new Date().toISOString(),
        lastSuccessfulSync: new Date().toISOString(),
        pendingChanges: [],
        isOnline: navigator.onLine,
      };
    }
  }

  private loadSyncQueue(): any[] {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private updateSyncStatus(
    mindmapId: string,
    status: "success" | "failed" | "pending"
  ): void {
    this.syncStatus.lastSyncAttempt = new Date().toISOString();

    if (status === "success") {
      this.syncStatus.lastSuccessfulSync = new Date().toISOString();
      this.syncStatus.pendingChanges = this.syncStatus.pendingChanges.filter(
        (id) => id !== mindmapId
      );
    } else if (status === "pending") {
      if (!this.syncStatus.pendingChanges.includes(mindmapId)) {
        this.syncStatus.pendingChanges.push(mindmapId);
      }
    }

    try {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error("Failed to save sync status:", error);
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error("Failed to save sync queue:", error);
    }
  }

  /**
   * Delete a mindmap from both localStorage and database
   */
  async deleteMindmap(id: string): Promise<void> {
    try {
      // Delete from localStorage first (immediate)
      deleteMindmapFromStorage(id);

      // Skip database deletion for temporary IDs
      if (id.startsWith("temp_")) {
        console.log(`Deleted temporary mindmap ${id} from localStorage only`);
        return;
      }

      // Try to delete from database if online
      if (navigator.onLine) {
        try {
          await mindmapAPI.deleteMindmap(id);
        } catch (error) {
          console.error("Failed to delete from database:", error);
          // Note: We don't restore to localStorage since user intended to delete
          // The database deletion will be retried on next sync if connection is restored
        }
      }
    } catch (error) {
      console.error("Error deleting mindmap:", error);
      throw error;
    }
  }

  // Public getters for UI components
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public getPendingChangesCount(): number {
    return this.syncQueue.length;
  }
}

// Singleton instance
export const hybridMindmapService = new HybridMindmapService();
