/**
 * useCollaboration Hook
 *
 * Real-time collaboration for workflow editing.
 * Manages WebSocket connection, presence, cursors, and changes.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWsUrl, collaborationConfig } from '@/lib/collaboration-config';

// ============================================================
// TYPES
// ============================================================

export interface CursorPosition {
  x: number;
  y: number;
  node_id?: string;
  field?: string;
}

export type PresenceStatus = 'viewing' | 'editing' | 'idle' | 'offline';

export interface ActiveUser {
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  status: PresenceStatus;
  cursor_position?: CursorPosition;
  session_id: string;
  connected_at: string;
  last_active: string;
}

export type ChangeType =
  | 'node_added'
  | 'node_removed'
  | 'node_updated'
  | 'node_moved'
  | 'edge_added'
  | 'edge_removed'
  | 'properties_updated'
  | 'metadata_updated';

export interface WorkflowChange {
  change_type: ChangeType;
  change_data: any;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface Comment {
  thread_id: string;
  node_id?: string;
  author_name: string;
  content: string;
  timestamp: string;
}

// ============================================================
// WEBSOCKET MESSAGE TYPES
// ============================================================

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface ConnectedMessage extends WebSocketMessage {
  type: 'connected';
  workflow_id: string;
  session_id: string;
  active_users: ActiveUser[];
  timestamp: string;
}

interface UserJoinedMessage extends WebSocketMessage {
  type: 'user_joined';
  user_id: string;
  user_name: string;
  session_id: string;
  timestamp: string;
}

interface UserLeftMessage extends WebSocketMessage {
  type: 'user_left';
  session_id: string;
  timestamp: string;
}

interface CursorUpdateMessage extends WebSocketMessage {
  type: 'cursor_update';
  user_id: string;
  session_id: string;
  cursor_position: CursorPosition;
  timestamp: string;
}

interface WorkflowUpdatedMessage extends WebSocketMessage {
  type: 'workflow_updated';
  change_type: ChangeType;
  change_data: any;
  user_id: string;
  user_name: string;
  timestamp: string;
}

interface CommentAddedMessage extends WebSocketMessage {
  type: 'comment_added';
  thread_id: string;
  node_id?: string;
  author_name: string;
  content: string;
  timestamp: string;
}

// ============================================================
// HOOK OPTIONS
// ============================================================

export interface UseCollaborationOptions {
  workflowId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  enabled?: boolean;
  wsUrl?: string; // Override WebSocket URL (default: ws://localhost:8000)

  // Callbacks
  onConnected?: (data: { sessionId: string; activeUsers: ActiveUser[] }) => void;
  onDisconnected?: () => void;
  onUsersChange?: (users: ActiveUser[]) => void;
  onCursorUpdate?: (data: CursorUpdateMessage) => void;
  onWorkflowUpdate?: (change: WorkflowChange) => void;
  onCommentAdded?: (comment: Comment) => void;
  onError?: (error: Error) => void;
}

// ============================================================
// HOOK
// ============================================================

export function useCollaboration({
  workflowId,
  userId,
  userName,
  userEmail,
  userAvatar,
  enabled = true,
  wsUrl = collaborationConfig.wsUrl,
  onConnected,
  onDisconnected,
  onUsersChange,
  onCursorUpdate,
  onWorkflowUpdate,
  onCommentAdded,
  onError,
}: UseCollaborationOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  // ============================================================
  // MESSAGE HANDLERS
  // ============================================================

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'connected': {
          const msg = message as ConnectedMessage;
          setSessionId(msg.session_id);
          setActiveUsers(msg.active_users);
          onConnected?.({
            sessionId: msg.session_id,
            activeUsers: msg.active_users,
          });
          onUsersChange?.(msg.active_users);
          break;
        }

        case 'user_joined': {
          const msg = message as UserJoinedMessage;
          setActiveUsers(prev => {
            // Don't add duplicate
            if (prev.some(u => u.session_id === msg.session_id)) {
              return prev;
            }
            const newUsers = [
              ...prev,
              {
                user_id: msg.user_id,
                user_name: msg.user_name,
                user_email: '',
                status: 'viewing' as PresenceStatus,
                session_id: msg.session_id,
                connected_at: msg.timestamp,
                last_active: msg.timestamp,
              },
            ];
            onUsersChange?.(newUsers);
            return newUsers;
          });
          break;
        }

        case 'user_left': {
          const msg = message as UserLeftMessage;
          setActiveUsers(prev => {
            const newUsers = prev.filter(u => u.session_id !== msg.session_id);
            onUsersChange?.(newUsers);
            return newUsers;
          });
          break;
        }

        case 'cursor_update': {
          const msg = message as CursorUpdateMessage;
          setActiveUsers(prev =>
            prev.map(user =>
              user.session_id === msg.session_id
                ? { ...user, cursor_position: msg.cursor_position, last_active: msg.timestamp }
                : user
            )
          );
          onCursorUpdate?.(msg);
          break;
        }

        case 'workflow_updated': {
          const msg = message as WorkflowUpdatedMessage;
          onWorkflowUpdate?.({
            change_type: msg.change_type,
            change_data: msg.change_data,
            user_id: msg.user_id,
            user_name: msg.user_name,
            timestamp: msg.timestamp,
          });
          break;
        }

        case 'comment_added': {
          const msg = message as CommentAddedMessage;
          onCommentAdded?.({
            thread_id: msg.thread_id,
            node_id: msg.node_id,
            author_name: msg.author_name,
            content: msg.content,
            timestamp: msg.timestamp,
          });
          break;
        }

        case 'pong':
          // Heartbeat response
          break;

        case 'error':
          console.error('WebSocket error message:', message);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      onError?.(error as Error);
    }
  }, [onConnected, onUsersChange, onCursorUpdate, onWorkflowUpdate, onCommentAdded, onError]);

  // ============================================================
  // CONNECTION MANAGEMENT
  // ============================================================

  const connect = useCallback(() => {
    if (!enabled || wsRef.current) return;

    try {
      const params: Record<string, string> = {
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
      };
      if (userAvatar) {
        params.user_avatar = userAvatar;
      }

      const wsUrl = getWsUrl(
        collaborationConfig.wsPaths.collaboration(workflowId),
        params
      );

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Collaboration WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Every 30 seconds
      };

      ws.onclose = () => {
        console.log('Collaboration WebSocket disconnected');
        setIsConnected(false);
        setSessionId(null);
        onDisconnected?.();

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt reconnect after 3 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            wsRef.current = null;
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        const err = new Error('WebSocket connection failed');
        setConnectionError(err);
        onError?.(err);
      };

      ws.onmessage = handleMessage;

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      const err = error as Error;
      setConnectionError(err);
      onError?.(err);
    }
  }, [enabled, workflowId, userId, userName, userEmail, userAvatar, handleMessage, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setSessionId(null);
    setActiveUsers([]);
  }, []);

  // ============================================================
  // SEND METHODS
  // ============================================================

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  const sendCursorMove = useCallback((position: CursorPosition) => {
    sendMessage({
      type: 'cursor_move',
      cursor_position: position,
    });
  }, [sendMessage]);

  const sendStatusChange = useCallback((status: PresenceStatus) => {
    sendMessage({
      type: 'status_change',
      status,
      user_email: userEmail,
    });
  }, [sendMessage, userEmail]);

  const sendWorkflowChange = useCallback((changeType: ChangeType, changeData: any) => {
    sendMessage({
      type: 'workflow_change',
      change_type: changeType,
      change_data: changeData,
    });
  }, [sendMessage]);

  // ============================================================
  // LIFECYCLE
  // ============================================================

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // State
    isConnected,
    sessionId,
    activeUsers,
    connectionError,

    // Methods
    sendCursorMove,
    sendStatusChange,
    sendWorkflowChange,
    reconnect: connect,
    disconnect,
  };
}
