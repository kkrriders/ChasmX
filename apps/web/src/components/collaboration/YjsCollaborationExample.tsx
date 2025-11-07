/**
 * YjsCollaborationExample Component
 *
 * Example showing Y.js CRDT-based collaborative editing.
 * Demonstrates conflict-free workflow editing with undo/redo.
 */

'use client';

import React, { useState } from 'react';
import { useYjsCollaboration } from '@/hooks/useYjsCollaboration';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Undo,
  Redo,
  GitBranch,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { WorkflowNode, WorkflowEdge } from '@/lib/yjs/YjsWorkflowProvider';

// ============================================================
// EXAMPLE COMPONENT
// ============================================================

interface YjsCollaborationExampleProps {
  workflowId: string;
  userId: string;
  userName: string;
}

export function YjsCollaborationExample({
  workflowId,
  userId,
  userName,
}: YjsCollaborationExampleProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Use Y.js collaboration hook
  const {
    isConnected,
    isSynced,
    nodes,
    edges,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    setCursor,
    cursors,
    undo,
    redo,
    canUndo,
    canRedo,
    exportWorkflow,
  } = useYjsCollaboration({
    workflowId,
    userId,
    userName,
    wsUrl: 'ws://localhost:1234', // Y.js WebSocket server
    enabled: true,
    onSync: (synced) => {
      console.log('Y.js synced:', synced);
    },
    onRemoteChange: (changes) => {
      console.log('Remote changes:', changes);
    },
  });

  // ============================================================
  // NODE OPERATIONS
  // ============================================================

  const handleAddNode = () => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: 'action',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: `Node ${nodes.length + 1}`,
        config: {},
      },
    };

    addNode(newNode);
  };

  const handleUpdateNode = (nodeId: string) => {
    updateNode(nodeId, {
      data: {
        label: `Updated ${Date.now()}`,
      },
    });
  };

  const handleRemoveNode = (nodeId: string) => {
    removeNode(nodeId);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // ============================================================
  // EDGE OPERATIONS
  // ============================================================

  const handleAddEdge = () => {
    if (nodes.length < 2) {
      alert('Need at least 2 nodes to create an edge');
      return;
    }

    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: nodes[0].id,
      target: nodes[nodes.length - 1].id,
    };

    addEdge(newEdge);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Y.js Collaborative Editor</h1>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                Disconnected
              </Badge>
            )}

            {isSynced && (
              <Badge variant="outline" className="gap-1">
                <GitBranch className="h-3 w-3" />
                Synced
              </Badge>
            )}
          </div>

          {/* Cursor Count */}
          {cursors.size > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {cursors.size} {cursors.size === 1 ? 'user' : 'users'}
            </Badge>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>

          <Button size="sm" onClick={handleAddNode}>
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>

          <Button size="sm" variant="outline" onClick={handleAddEdge}>
            <GitBranch className="h-4 w-4 mr-1" />
            Add Edge
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('Workflow:', exportWorkflow());
              alert('Check console for exported workflow');
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 relative overflow-auto p-8"
          onMouseMove={(e) => {
            setCursor({
              x: e.clientX,
              y: e.clientY,
              nodeId: selectedNodeId || undefined,
            });
          }}
        >
          {/* Nodes */}
          <div className="space-y-4">
            {nodes.map((node) => (
              <Card
                key={node.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedNodeId === node.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{node.data?.label || node.id}</div>
                    <div className="text-xs text-muted-foreground">
                      Type: {node.type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateNode(node.id);
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveNode(node.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg mb-2">No nodes yet</p>
                <p className="text-sm">Click "Add Node" to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l p-4 overflow-auto">
          <h3 className="font-semibold mb-3">Workflow Info</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nodes:</span>
              <span className="font-medium">{nodes.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Edges:</span>
              <span className="font-medium">{edges.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Can Undo:</span>
              <span className="font-medium">{canUndo ? 'Yes' : 'No'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Can Redo:</span>
              <span className="font-medium">{canRedo ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <hr className="my-4" />

          <h3 className="font-semibold mb-3">Active Cursors</h3>
          {cursors.size > 0 ? (
            <div className="space-y-2">
              {Array.from(cursors.entries()).map(([clientId, data]) => (
                <div key={clientId} className="text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.user.color }}
                    />
                    <span className="font-medium">{data.user.name}</span>
                  </div>
                  {data.cursor && (
                    <div className="text-xs text-muted-foreground ml-5">
                      ({Math.round(data.cursor.x)}, {Math.round(data.cursor.y)})
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active cursors</p>
          )}

          <hr className="my-4" />

          <h3 className="font-semibold mb-3">Edges</h3>
          {edges.length > 0 ? (
            <div className="space-y-2">
              {edges.map((edge) => (
                <div key={edge.id} className="text-sm flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {edge.source} → {edge.target}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEdge(edge.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No edges</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default YjsCollaborationExample;
