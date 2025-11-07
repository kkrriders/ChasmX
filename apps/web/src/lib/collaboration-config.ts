/**
 * Collaboration Configuration
 *
 * Centralized configuration for collaboration features.
 */

export const collaborationConfig = {
  // API URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',

  // WebSocket URLs
  wsUrl: process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'ws://localhost:8000',
  yjsWsUrl: process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234',

  // Feature Flags
  features: {
    collaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
    yjsCrdt: process.env.NEXT_PUBLIC_ENABLE_YJS_CRDT === 'true',
    comments: process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true',
    versionHistory: process.env.NEXT_PUBLIC_ENABLE_VERSION_HISTORY === 'true',
  },

  // API Endpoints
  endpoints: {
    // Presence
    presence: (workflowId: string) =>
      `/collaboration/workflows/${workflowId}/presence`,

    // Versions
    versions: (workflowId: string) =>
      `/collaboration/workflows/${workflowId}/versions`,
    version: (workflowId: string, versionNumber: number) =>
      `/collaboration/workflows/${workflowId}/versions/${versionNumber}`,
    compareVersions: (workflowId: string, versionA: number, versionB: number) =>
      `/collaboration/workflows/${workflowId}/versions/compare?version_a=${versionA}&version_b=${versionB}`,

    // Comments
    comments: (workflowId: string) =>
      `/collaboration/workflows/${workflowId}/comments`,
    commentReplies: (threadId: string) =>
      `/collaboration/comments/${threadId}/replies`,
    resolveComment: (threadId: string) =>
      `/collaboration/comments/${threadId}/resolve`,

    // Changes
    changes: (workflowId: string) =>
      `/collaboration/workflows/${workflowId}/changes`,
  },

  // WebSocket paths
  wsPaths: {
    collaboration: (workflowId: string) =>
      `/collaboration/workflows/${workflowId}`,
  },
};

// Helper to build full API URL
export function getApiUrl(endpoint: string): string {
  return `${collaborationConfig.apiUrl}${endpoint}`;
}

// Helper to build WebSocket URL
export function getWsUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${collaborationConfig.wsUrl}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

// Export config
export default collaborationConfig;
