// Minimal WebSocket client used by the Execution Monitor hook.
// This is intentionally lightweight — it provides a consistent shape for tests and local dev.

export type ExecutionEventType =
  | 'connected'
  | 'execution_started'
  | 'node_started'
  | 'node_completed'
  | 'execution_completed'
  | 'execution_error'

export interface ExecutionEvent {
  type: ExecutionEventType
  data: Record<string, any>
}

type Handler = (event: ExecutionEvent) => void

export interface ExecutionWebSocketClient {
  connect: () => Promise<void>
  disconnect: () => void
  ping: () => void
  on: (type: ExecutionEventType, handler: Handler) => () => void
}

/**
 * Create a client for an execution WebSocket stream.
 * The implementation uses the browser WebSocket and exposes a small API used by the hook.
 */
export function createExecutionWebSocket(executionId: string): ExecutionWebSocketClient {
  let socket: WebSocket | null = null
  const handlers: Map<ExecutionEventType, Set<Handler>> = new Map()

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const wsOrigin = defaultOrigin.replace(/^http/, 'ws')
  // Default path — applications can change this if they host WS elsewhere
  const url = `${wsOrigin}/ws/executions/${encodeURIComponent(executionId)}`

  function dispatch(event: ExecutionEvent) {
    const set = handlers.get(event.type)
    if (set) {
      for (const h of Array.from(set)) h(event)
    }
  }

  return {
    connect() {
      return new Promise<void>((resolve, reject) => {
        try {
          socket = new WebSocket(url)

          socket.addEventListener('open', () => {
            // Fire a local 'connected' event
            dispatch({ type: 'connected', data: { timestamp: new Date().toISOString() } })
            resolve()
          })

          socket.addEventListener('message', (ev) => {
            try {
              const payload = JSON.parse(ev.data)
              // Expecting { type: string, data: {...} }
              if (payload && payload.type) {
                dispatch({ type: payload.type as ExecutionEventType, data: payload.data ?? {} })
              }
            } catch (err) {
              // If message is not JSON, ignore
            }
          })

          socket.addEventListener('close', () => {
            dispatch({ type: 'execution_completed', data: { timestamp: new Date().toISOString() } })
          })

          socket.addEventListener('error', (err) => {
            dispatch({ type: 'execution_error', data: { error: String(err) } })
            reject(err)
          })
        } catch (err) {
          reject(err)
        }
      })
    },

    disconnect() {
      if (socket) {
        try { socket.close() } catch (e) {}
        socket = null
      }
    },

    ping() {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try { socket.send(JSON.stringify({ type: 'ping', data: { timestamp: new Date().toISOString() } })) } catch (e) {}
      }
    },

    on(type: ExecutionEventType, handler: Handler) {
      if (!handlers.has(type)) handlers.set(type, new Set())
      handlers.get(type)!.add(handler)

      return () => {
        handlers.get(type)?.delete(handler)
      }
    },
  }
}

// Backwards-compatible small client export (optional)
export const wsClient = {
  // simple factory that returns a client for an id
  for: (executionId: string) => createExecutionWebSocket(executionId),
}
