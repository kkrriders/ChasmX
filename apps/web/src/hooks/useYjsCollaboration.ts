/**
 * useYjsCollaboration Hook
 *
 * React hook for Y.js-based collaborative workflow editing.
 * Provides conflict-free replicated data types (CRDT) for nodes and edges.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { UndoManager } from 'yjs';
import {
  YjsWorkflowProvider,
  WorkflowNode,
  WorkflowEdge,
  WorkflowData,
} from '@/lib/yjs/YjsWorkflowProvider';
import { collaborationConfig } from '@/lib/collaboration-config';

// ============================================================
// TYPES
// ============================================================

export interface UseYjsCollaborationOptions {
  workflowId: string;
  userId: string;
  userName: string;
  wsUrl?: string;
  enabled?: boolean;
  initialData?: WorkflowData;
  onSync?: (synced: boolean) => void;
  onRemoteChange?: (changes: any) => void;
}

export interface YjsCollaborationState {
  // Connection state
  isConnected: boolean;
  isSynced: boolean;

  // Workflow data
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: Record<string, any>;

  // Operations
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (nodeId: string) => void;

  addEdge: (edge: WorkflowEdge) => void;
  updateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void;
  removeEdge: (edgeId: string) => void;

  setMetadata: (key: string, value: any) => void;
  getMetadata: (key: string) => any;

  // Cursor operations
  setCursor: (position: { x: number; y: number; nodeId?: string }) => void;
  cursors: Map<number, any>;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Utilities
  exportWorkflow: () => WorkflowData;
  provider: YjsWorkflowProvider | null;
}

// ============================================================
// HOOK
// ============================================================

export function useYjsCollaboration({
  workflowId,
  userId,
  userName,
  wsUrl = collaborationConfig.yjsWsUrl,
  enabled = true,
  initialData,
  onSync,
  onRemoteChange,
}: UseYjsCollaborationOptions): YjsCollaborationState {
  const providerRef = useRef<YjsWorkflowProvider | null>(null);
  const undoManagerRef = useRef<UndoManager | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [cursors, setCursors] = useState<Map<number, any>>(new Map());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ============================================================
  // INITIALIZATION
  // ============================================================

  useEffect(() => {
    if (!enabled) return;

    // Create Y.js provider
    const provider = new YjsWorkflowProvider({
      workflowId,
      userId,
      userName,
      wsUrl,
      onSync: (synced) => {
        setIsSynced(synced);
        onSync?.(synced);
      },
      onLocalChange: () => {
        // Update local state
        updateState();
      },
      onRemoteChange: (changes) => {
        // Update local state from remote changes
        updateState();
        onRemoteChange?.(changes);
      },
    });

    providerRef.current = provider;

    // Load initial data if provided
    if (initialData) {
      provider.loadWorkflow(initialData);
    }

    // Connect to WebSocket
    provider.connect();
    setIsConnected(true);

    // Create undo manager
    const undoManager = provider.createUndoManager();
    undoManagerRef.current = undoManager;

    // Listen to undo manager changes
    undoManager.on('stack-item-added', () => {
      setCanUndo(undoManager.canUndo());
      setCanRedo(undoManager.canRedo());
    });

    undoManager.on('stack-item-popped', () => {
      setCanUndo(undoManager.canUndo());
      setCanRedo(undoManager.canRedo());
    });

    // Subscribe to awareness changes (cursors)
    const unsubscribeAwareness = provider.onAwarenessChange(() => {
      setCursors(new Map(provider.getCursors()));
    });

    // Initial state update
    updateState();

    // Cleanup
    return () => {
      unsubscribeAwareness();
      provider.disconnect();
      provider.destroy();
      providerRef.current = null;
      undoManagerRef.current = null;
    };
  }, [enabled, workflowId, userId, userName, wsUrl]);

  // ============================================================
  // STATE UPDATE
  // ============================================================

  const updateState = useCallback(() => {
    if (!providerRef.current) return;

    setNodes(providerRef.current.getAllNodes());
    setEdges(providerRef.current.getAllEdges());
    setMetadata(providerRef.current.getAllMetadata());
  }, []);

  // ============================================================
  // NODE OPERATIONS
  // ============================================================

  const addNode = useCallback((node: WorkflowNode) => {
    if (providerRef.current) {
      providerRef.current.addNode(node);
      updateState();
    }
  }, [updateState]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    if (providerRef.current) {
      providerRef.current.updateNode(nodeId, updates);
      updateState();
    }
  }, [updateState]);

  const removeNode = useCallback((nodeId: string) => {
    if (providerRef.current) {
      providerRef.current.removeNode(nodeId);
      updateState();
    }
  }, [updateState]);

  // ============================================================
  // EDGE OPERATIONS
  // ============================================================

  const addEdge = useCallback((edge: WorkflowEdge) => {
    if (providerRef.current) {
      providerRef.current.addEdge(edge);
      updateState();
    }
  }, [updateState]);

  const updateEdge = useCallback((edgeId: string, updates: Partial<WorkflowEdge>) => {
    if (providerRef.current) {
      providerRef.current.updateEdge(edgeId, updates);
      updateState();
    }
  }, [updateState]);

  const removeEdge = useCallback((edgeId: string) => {
    if (providerRef.current) {
      providerRef.current.removeEdge(edgeId);
      updateState();
    }
  }, [updateState]);

  // ============================================================
  // METADATA OPERATIONS
  // ============================================================

  const setMetadataValue = useCallback((key: string, value: any) => {
    if (providerRef.current) {
      providerRef.current.setMetadata(key, value);
      updateState();
    }
  }, [updateState]);

  const getMetadataValue = useCallback((key: string): any => {
    return providerRef.current?.getMetadata(key);
  }, []);

  // ============================================================
  // CURSOR OPERATIONS
  // ============================================================

  const setCursor = useCallback((position: { x: number; y: number; nodeId?: string }) => {
    if (providerRef.current) {
      providerRef.current.setCursor(position);
    }
  }, []);

  // ============================================================
  // UNDO/REDO
  // ============================================================

  const undo = useCallback(() => {
    if (undoManagerRef.current && undoManagerRef.current.canUndo()) {
      undoManagerRef.current.undo();
      updateState();
      setCanUndo(undoManagerRef.current.canUndo());
      setCanRedo(undoManagerRef.current.canRedo());
    }
  }, [updateState]);

  const redo = useCallback(() => {
    if (undoManagerRef.current && undoManagerRef.current.canRedo()) {
      undoManagerRef.current.redo();
      updateState();
      setCanUndo(undoManagerRef.current.canUndo());
      setCanRedo(undoManagerRef.current.canRedo());
    }
  }, [updateState]);

  // ============================================================
  // UTILITIES
  // ============================================================

  const exportWorkflow = useCallback((): WorkflowData => {
    if (!providerRef.current) {
      return { nodes: [], edges: [], metadata: {} };
    }
    return providerRef.current.exportWorkflow();
  }, []);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Connection state
    isConnected,
    isSynced,

    // Workflow data
    nodes,
    edges,
    metadata,

    // Node operations
    addNode,
    updateNode,
    removeNode,

    // Edge operations
    addEdge,
    updateEdge,
    removeEdge,

    // Metadata operations
    setMetadata: setMetadataValue,
    getMetadata: getMetadataValue,

    // Cursor operations
    setCursor,
    cursors,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,

    // Utilities
    exportWorkflow,
    provider: providerRef.current,
  };
}

// ============================================================
// EXPORTS
// ============================================================

export default useYjsCollaboration;
