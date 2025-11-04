/**
 * Y.js Workflow Provider
 *
 * Manages Y.js document for conflict-free collaborative workflow editing.
 * Provides CRDT-based synchronization for workflow nodes, edges, and metadata.
 */

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// ============================================================
// TYPES
// ============================================================

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  [key: string]: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, any>;
}

export interface YjsWorkflowProviderOptions {
  workflowId: string;
  userId: string;
  userName: string;
  wsUrl?: string;
  onSync?: (synced: boolean) => void;
  onUpdate?: (update: Uint8Array, origin: any) => void;
  onLocalChange?: () => void;
  onRemoteChange?: (changes: any) => void;
}

// ============================================================
// Y.JS WORKFLOW PROVIDER
// ============================================================

export class YjsWorkflowProvider {
  private ydoc: Y.Doc;
  private wsProvider: WebsocketProvider | null = null;
  private nodesMap: Y.Map<any>;
  private edgesMap: Y.Map<any>;
  private metadataMap: Y.Map<any>;
  private awareness: any;

  private workflowId: string;
  private userId: string;
  private userName: string;
  private wsUrl: string;

  private onSyncCallback?: (synced: boolean) => void;
  private onUpdateCallback?: (update: Uint8Array, origin: any) => void;
  private onLocalChangeCallback?: () => void;
  private onRemoteChangeCallback?: (changes: any) => void;

  constructor(options: YjsWorkflowProviderOptions) {
    this.workflowId = options.workflowId;
    this.userId = options.userId;
    this.userName = options.userName;
    this.wsUrl = options.wsUrl || 'ws://localhost:1234';

    this.onSyncCallback = options.onSync;
    this.onUpdateCallback = options.onUpdate;
    this.onLocalChangeCallback = options.onLocalChange;
    this.onRemoteChangeCallback = options.onRemoteChange;

    // Create Y.js document
    this.ydoc = new Y.Doc();

    // Create shared types
    this.nodesMap = this.ydoc.getMap('nodes');
    this.edgesMap = this.ydoc.getMap('edges');
    this.metadataMap = this.ydoc.getMap('metadata');

    // Set up observers
    this.setupObservers();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Connect to WebSocket provider for sync
   */
  connect(): void {
    if (this.wsProvider) {
      console.warn('Y.js provider already connected');
      return;
    }

    // Create WebSocket provider for syncing
    this.wsProvider = new WebsocketProvider(
      this.wsUrl,
      `workflow-${this.workflowId}`,
      this.ydoc,
      {
        connect: true,
        // WebRTC for peer-to-peer (optional)
        // WebrtcProvider: true,
      }
    );

    // Get awareness for cursor positions
    this.awareness = this.wsProvider.awareness;

    // Set local user info
    this.awareness.setLocalStateField('user', {
      id: this.userId,
      name: this.userName,
      color: this.getUserColor(this.userId),
    });

    // Listen to sync status
    this.wsProvider.on('sync', (synced: boolean) => {
      console.log(`Y.js ${synced ? 'synced' : 'not synced'}`);
      this.onSyncCallback?.(synced);
    });

    // Listen to connection status
    this.wsProvider.on('status', ({ status }: { status: string }) => {
      console.log('Y.js WebSocket status:', status);
    });

    console.log('Y.js WebSocket provider connected');
  }

  /**
   * Disconnect from WebSocket provider
   */
  disconnect(): void {
    if (this.wsProvider) {
      this.wsProvider.disconnect();
      this.wsProvider.destroy();
      this.wsProvider = null;
    }
  }

  /**
   * Destroy the Y.js document and clean up
   */
  destroy(): void {
    this.disconnect();
    this.ydoc.destroy();
  }

  // ============================================================
  // OBSERVERS
  // ============================================================

  private setupObservers(): void {
    // Observe all changes to the document
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      this.onUpdateCallback?.(update, origin);

      // Determine if this is a local or remote change
      if (origin === this) {
        this.onLocalChangeCallback?.();
      } else if (origin !== null) {
        // Remote change
        const changes = this.extractChanges(update);
        this.onRemoteChangeCallback?.(changes);
      }
    });

    // Observe nodes map changes
    this.nodesMap.observe((event) => {
      console.log('Nodes changed:', event.changes.keys);
    });

    // Observe edges map changes
    this.edgesMap.observe((event) => {
      console.log('Edges changed:', event.changes.keys);
    });

    // Observe metadata changes
    this.metadataMap.observe((event) => {
      console.log('Metadata changed:', event.changes.keys);
    });
  }

  private extractChanges(update: Uint8Array): any {
    // Parse the update to extract what changed
    // This is a simplified version - Y.js provides more detailed change tracking
    return {
      nodes: Array.from(this.nodesMap.keys()),
      edges: Array.from(this.edgesMap.keys()),
      timestamp: Date.now(),
    };
  }

  // ============================================================
  // NODES OPERATIONS
  // ============================================================

  /**
   * Add a node to the workflow
   */
  addNode(node: WorkflowNode): void {
    this.ydoc.transact(() => {
      this.nodesMap.set(node.id, node);
    }, this); // 'this' as origin marks it as local change
  }

  /**
   * Update a node in the workflow
   */
  updateNode(nodeId: string, updates: Partial<WorkflowNode>): void {
    this.ydoc.transact(() => {
      const existing = this.nodesMap.get(nodeId);
      if (existing) {
        this.nodesMap.set(nodeId, { ...existing, ...updates });
      }
    }, this);
  }

  /**
   * Remove a node from the workflow
   */
  removeNode(nodeId: string): void {
    this.ydoc.transact(() => {
      this.nodesMap.delete(nodeId);
    }, this);
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): WorkflowNode | undefined {
    return this.nodesMap.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    this.nodesMap.forEach((node) => {
      nodes.push(node);
    });
    return nodes;
  }

  // ============================================================
  // EDGES OPERATIONS
  // ============================================================

  /**
   * Add an edge to the workflow
   */
  addEdge(edge: WorkflowEdge): void {
    this.ydoc.transact(() => {
      this.edgesMap.set(edge.id, edge);
    }, this);
  }

  /**
   * Update an edge in the workflow
   */
  updateEdge(edgeId: string, updates: Partial<WorkflowEdge>): void {
    this.ydoc.transact(() => {
      const existing = this.edgesMap.get(edgeId);
      if (existing) {
        this.edgesMap.set(edgeId, { ...existing, ...updates });
      }
    }, this);
  }

  /**
   * Remove an edge from the workflow
   */
  removeEdge(edgeId: string): void {
    this.ydoc.transact(() => {
      this.edgesMap.delete(edgeId);
    }, this);
  }

  /**
   * Get an edge by ID
   */
  getEdge(edgeId: string): WorkflowEdge | undefined {
    return this.edgesMap.get(edgeId);
  }

  /**
   * Get all edges
   */
  getAllEdges(): WorkflowEdge[] {
    const edges: WorkflowEdge[] = [];
    this.edgesMap.forEach((edge) => {
      edges.push(edge);
    });
    return edges;
  }

  // ============================================================
  // METADATA OPERATIONS
  // ============================================================

  /**
   * Set metadata field
   */
  setMetadata(key: string, value: any): void {
    this.ydoc.transact(() => {
      this.metadataMap.set(key, value);
    }, this);
  }

  /**
   * Get metadata field
   */
  getMetadata(key: string): any {
    return this.metadataMap.get(key);
  }

  /**
   * Get all metadata
   */
  getAllMetadata(): Record<string, any> {
    const metadata: Record<string, any> = {};
    this.metadataMap.forEach((value, key) => {
      metadata[key] = value;
    });
    return metadata;
  }

  // ============================================================
  // WORKFLOW OPERATIONS
  // ============================================================

  /**
   * Load entire workflow into Y.js
   */
  loadWorkflow(workflow: WorkflowData): void {
    this.ydoc.transact(() => {
      // Clear existing data
      this.nodesMap.clear();
      this.edgesMap.clear();
      this.metadataMap.clear();

      // Load nodes
      workflow.nodes?.forEach((node) => {
        this.nodesMap.set(node.id, node);
      });

      // Load edges
      workflow.edges?.forEach((edge) => {
        this.edgesMap.set(edge.id, edge);
      });

      // Load metadata
      if (workflow.metadata) {
        Object.entries(workflow.metadata).forEach(([key, value]) => {
          this.metadataMap.set(key, value);
        });
      }
    }, this);
  }

  /**
   * Export entire workflow from Y.js
   */
  exportWorkflow(): WorkflowData {
    return {
      nodes: this.getAllNodes(),
      edges: this.getAllEdges(),
      metadata: this.getAllMetadata(),
    };
  }

  /**
   * Get workflow as JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.exportWorkflow(), null, 2);
  }

  // ============================================================
  // AWARENESS (CURSORS & PRESENCE)
  // ============================================================

  /**
   * Set cursor position for local user
   */
  setCursor(position: { x: number; y: number; nodeId?: string }): void {
    if (this.awareness) {
      this.awareness.setLocalStateField('cursor', position);
    }
  }

  /**
   * Get all user cursors
   */
  getCursors(): Map<number, any> {
    if (!this.awareness) return new Map();

    const cursors = new Map();
    this.awareness.getStates().forEach((state: any, clientId: number) => {
      if (state.cursor && state.user) {
        cursors.set(clientId, {
          user: state.user,
          cursor: state.cursor,
        });
      }
    });
    return cursors;
  }

  /**
   * Subscribe to awareness changes (cursors, presence)
   */
  onAwarenessChange(callback: (changes: any) => void): () => void {
    if (!this.awareness) {
      return () => {};
    }

    const handler = ({ added, updated, removed }: any) => {
      callback({ added, updated, removed });
    };

    this.awareness.on('change', handler);

    // Return unsubscribe function
    return () => {
      this.awareness.off('change', handler);
    };
  }

  // ============================================================
  // UNDO/REDO
  // ============================================================

  /**
   * Create undo manager for nodes and edges
   */
  createUndoManager(): Y.UndoManager {
    return new Y.UndoManager([this.nodesMap, this.edgesMap], {
      trackedOrigins: new Set([this]),
    });
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  private getUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D9', '#A8E6CF',
    ];

    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get Y.js document (advanced usage)
   */
  getDocument(): Y.Doc {
    return this.ydoc;
  }

  /**
   * Get WebSocket provider (advanced usage)
   */
  getProvider(): WebsocketProvider | null {
    return this.wsProvider;
  }

  /**
   * Get awareness (advanced usage)
   */
  getAwareness(): any {
    return this.awareness;
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default YjsWorkflowProvider;
