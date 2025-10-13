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
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
  AI: {
    GENERATE_WORKFLOW: '/ai/workflows/generate',
  },
} as const
