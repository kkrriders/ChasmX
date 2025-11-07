/**
 * CollaborationContext
 *
 * Provides collaboration state and methods to the component tree.
 * Wraps the useCollaboration hook for easy access throughout the app.
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useCollaboration,
  UseCollaborationOptions,
  ActiveUser,
  CursorPosition,
  WorkflowChange,
  Comment,
  PresenceStatus,
  ChangeType,
} from '@/hooks/useCollaboration';

// ============================================================
// CONTEXT TYPE
// ============================================================

interface CollaborationContextType {
  // State
  isConnected: boolean;
  sessionId: string | null;
  activeUsers: ActiveUser[];
  connectionError: Error | null;

  // Methods
  sendCursorMove: (position: CursorPosition) => void;
  sendStatusChange: (status: PresenceStatus) => void;
  sendWorkflowChange: (changeType: ChangeType, changeData: any) => void;
  reconnect: () => void;
  disconnect: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

// ============================================================
// PROVIDER
// ============================================================

export interface CollaborationProviderProps extends Omit<UseCollaborationOptions, 'enabled'> {
  children: ReactNode;
  enabled?: boolean;
}

export function CollaborationProvider({
  children,
  workflowId,
  userId,
  userName,
  userEmail,
  userAvatar,
  enabled = true,
  wsUrl,
  onConnected,
  onDisconnected,
  onUsersChange,
  onCursorUpdate,
  onWorkflowUpdate,
  onCommentAdded,
  onError,
}: CollaborationProviderProps) {
  const collaboration = useCollaboration({
    workflowId,
    userId,
    userName,
    userEmail,
    userAvatar,
    enabled,
    wsUrl,
    onConnected,
    onDisconnected,
    onUsersChange,
    onCursorUpdate,
    onWorkflowUpdate,
    onCommentAdded,
    onError,
  });

  return (
    <CollaborationContext.Provider value={collaboration}>
      {children}
    </CollaborationContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useCollaborationContext(): CollaborationContextType {
  const context = useContext(CollaborationContext);

  if (!context) {
    throw new Error(
      'useCollaborationContext must be used within a CollaborationProvider'
    );
  }

  return context;
}

// ============================================================
// EXPORTS
// ============================================================

export { CollaborationContext };
export type { CollaborationContextType };
