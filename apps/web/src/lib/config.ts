// Application configuration
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'ChasmX',
} as const

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    CHECK_USER: '/auth/check-user',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // Workflow endpoints
  WORKFLOWS: {
    LIST: '/workflows/',
    CREATE: '/workflows/',
    GET: (id: string) => `/workflows/${id}`,
    UPDATE: (id: string) => `/workflows/${id}`,
    DELETE: (id: string) => `/workflows/${id}`,
    EXECUTE: (id: string) => `/workflows/${id}/execute`,
    EXECUTIONS: (id: string) => `/workflows/${id}/executions`,
    EXECUTION: (executionId: string) => `/workflows/executions/${executionId}`,
    EXECUTION_STREAM: (executionId: string) => `/ws/executions/${executionId}`,
  },
  // User endpoints
  USER: {
    PROFILE: '/users/me',
    UPDATE: '/users/me',
    NOTIFICATIONS: '/users/me/preferences/notifications',
  },
  AI: {
    GENERATE_WORKFLOW: '/ai/workflows/generate',
    CHAT: '/ai/chat',
    MODELS: '/ai/models',
    AGENTS: '/ai/agents/',
    TASKS: '/ai/tasks/',
  },
  // Template endpoints
  TEMPLATES: {
    LIST: '/templates/',
    CREATE: '/templates/',
    GET: (id: string) => `/templates/${id}`,
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
    FROM_WORKFLOW: '/templates/from-workflow',
    DEPLOY: (id: string) => `/templates/${id}/deploy`,
    CLONE: (id: string) => `/templates/${id}/clone`,
    PUBLISH: (id: string) => `/templates/${id}/publish`,
    CATEGORIES: '/templates/categories',
    FEATURED: '/templates/featured',
    SEARCH: '/templates/search',
  },
  // Schedule endpoints
  SCHEDULES: {
    LIST: '/schedules/',
    CREATE: '/schedules/',
    GET: (id: string) => `/schedules/${id}`,
    UPDATE: (id: string) => `/schedules/${id}`,
    DELETE: (id: string) => `/schedules/${id}`,
    PAUSE: (id: string) => `/schedules/${id}/pause`,
    RESUME: (id: string) => `/schedules/${id}/resume`,
    LOGS: (id: string) => `/schedules/${id}/logs`,
  },
  // Webhook endpoints
  WEBHOOKS: {
    LIST: '/webhooks/',
    CREATE: '/webhooks/',
    GET: (id: string) => `/webhooks/${id}`,
    UPDATE: (id: string) => `/webhooks/${id}`,
    DELETE: (id: string) => `/webhooks/${id}`,
    TRIGGER: (webhookId: string) => `/webhooks/trigger/${webhookId}`,
    LOGS: (id: string) => `/webhooks/${id}/logs`,
  },
  // API Key endpoints
  API_KEYS: {
    LIST: '/api-keys/',
    CREATE: '/api-keys/',
    GET: (id: string) => `/api-keys/${id}`,
    UPDATE: (id: string) => `/api-keys/${id}`,
    DELETE: (id: string) => `/api-keys/${id}`,
    ROTATE: (id: string) => `/api-keys/${id}/rotate`,
  },
  // Usage endpoints
  USAGE: {
    SUMMARY: '/usage/summary',
    DAILY: '/usage/daily',
    BUDGETS: '/usage/budgets',
    CREATE_BUDGET: '/usage/budgets',
    UPDATE_BUDGET: (id: string) => `/usage/budgets/${id}`,
    DELETE_BUDGET: (id: string) => `/usage/budgets/${id}`,
    COST_COMPARISON: '/usage/cost-comparison',
  },
  // Collaboration endpoints
  COLLABORATION: {
    WEBSOCKET: (workflowId: string) => `/collaboration/workflows/${workflowId}`,
    PRESENCE: (workflowId: string) => `/collaboration/workflows/${workflowId}/presence`,
    VERSIONS: (workflowId: string) => `/collaboration/workflows/${workflowId}/versions`,
    COMMENTS: (workflowId: string) => `/collaboration/workflows/${workflowId}/comments`,
    CHANGES: (workflowId: string) => `/collaboration/workflows/${workflowId}/changes`,
  },
  // Analytics endpoints
  ANALYTICS: {
    REALTIME_METRICS: '/analytics/metrics/realtime',
    ACTIVE_WORKFLOWS: '/analytics/workflows/active',
    NODE_PERFORMANCE: '/analytics/nodes/performance',
    QUALITY_METRICS: '/analytics/quality',
    HEALTH: '/analytics/health',
  },
} as const
