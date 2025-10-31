/**
 * WebSocket client for real-time workflow execution updates
 */

import { config } from './config'

export type ExecutionEventType =
  | 'connected'
  | 'execution_started'
  | 'node_started'
  | 'node_completed'
  | 'execution_completed'
  | 'execution_error'

export interface ExecutionEvent {
  type: ExecutionEventType
  execution_id: string
  data: {
    timestamp: string
    [key: string]: any
  }
}

export type ExecutionEventHandler = (event: ExecutionEvent) => void

export class ExecutionWebSocketClient {
  private ws: WebSocket | null = null
  private handlers: Map<ExecutionEventType, Set<ExecutionEventHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private executionId: string

  constructor(executionId: string) {
    this.executionId = executionId
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL from API URL
        const wsUrl = config.apiUrl.replace('http://', 'ws://').replace('https://', 'wss://')
        const url = `${wsUrl}/ws/executions/${this.executionId}`

        console.log('[WebSocket] Connecting to:', url)

        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as ExecutionEvent
            console.log('[WebSocket] Received event:', data.type, data)
            this.emit(data.type, data)
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Closed:', event.code, event.reason)
          this.handleDisconnect()
        }
      } catch (error) {
        console.error('[WebSocket] Connection error:', error)
        reject(error)
      }
    })
  }

  /**
   * Handle disconnection and attempt reconnection
   */
  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * this.reconnectAttempts

      console.log(
        `[WebSocket] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
      )

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('[WebSocket] Reconnect failed:', error)
        })
      }, delay)
    } else {
      console.error('[WebSocket] Max reconnect attempts reached')
    }
  }

  /**
   * Subscribe to a specific event type
   */
  on(eventType: ExecutionEventType, handler: ExecutionEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }

    this.handlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler)
    }
  }

  /**
   * Emit an event to all registered handlers
   */
  private emit(eventType: ExecutionEventType, event: ExecutionEvent) {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event)
        } catch (error) {
          console.error(`[WebSocket] Error in event handler for ${eventType}:`, error)
        }
      })
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.handlers.get('connected' as ExecutionEventType)
    if (eventType !== 'connected' && wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(event)
        } catch (error) {
          console.error('[WebSocket] Error in wildcard handler:', error)
        }
      })
    }
  }

  /**
   * Send a message to the server (for ping/pong)
   */
  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof message === 'string' ? message : JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Cannot send message, not connected')
    }
  }

  /**
   * Send a ping to keep connection alive
   */
  ping() {
    this.send({ type: 'ping' })
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.ws) {
      console.log('[WebSocket] Disconnecting...')
      this.ws.close()
      this.ws = null
    }
    this.handlers.clear()
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

/**
 * Create a new WebSocket client for an execution
 */
export function createExecutionWebSocket(executionId: string): ExecutionWebSocketClient {
  return new ExecutionWebSocketClient(executionId)
}
