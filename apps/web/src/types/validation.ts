export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  severity: ValidationSeverity
  code: string
  message: string
  node_id?: string
  details?: Record<string, unknown>
  suggestion?: string
  affected_nodes?: string[]
  documentation_url?: string
}

export interface ValidationResult {
  is_valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  info: ValidationIssue[]
}

export interface ValidationConfig {
  limits: {
    max_nodes: number
    max_edges: number
    max_depth: number
    max_loop_iterations: number
    max_variables: number
    max_config_size: number
  }
  supported_node_types: string[]
  validation_rules: string[]
}

export interface ValidationResponse {
  is_valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  info: ValidationIssue[]
  timestamp?: string
  validator_version?: string
}
