import React from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react'
import type { ValidationResult, ValidationIssue } from '@/types/validation'

interface ValidationPanelProps {
  validationResult: ValidationResult | null
  onClose?: () => void
  onNodeClick?: (nodeId: string) => void
}

export function ValidationPanel({
  validationResult,
  onClose,
  onNodeClick,
}: ValidationPanelProps) {
  if (!validationResult) {
    return null
  }

  const { is_valid, errors, warnings, info } = validationResult
  const totalIssues = errors.length + warnings.length + info.length

  if (totalIssues === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Workflow is valid</h3>
            <p className="text-sm text-green-700 mt-1">
              No validation issues found. This workflow is ready to execute.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-green-600 hover:text-green-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Validation Results
            </h3>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                is_valid
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {is_valid ? 'Valid with warnings' : 'Invalid'}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex gap-4 mt-2 text-sm">
          {errors.length > 0 && (
            <span className="text-red-600 font-medium">
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-yellow-600 font-medium">
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
          {info.length > 0 && (
            <span className="text-blue-600 font-medium">
              {info.length} info
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {errors.length > 0 && (
          <ValidationSection
            title="Errors"
            issues={errors}
            severity="error"
            onNodeClick={onNodeClick}
          />
        )}
        {warnings.length > 0 && (
          <ValidationSection
            title="Warnings"
            issues={warnings}
            severity="warning"
            onNodeClick={onNodeClick}
          />
        )}
        {info.length > 0 && (
          <ValidationSection
            title="Information"
            issues={info}
            severity="info"
            onNodeClick={onNodeClick}
          />
        )}
      </div>
    </div>
  )
}

interface ValidationSectionProps {
  title: string
  issues: ValidationIssue[]
  severity: 'error' | 'warning' | 'info'
  onNodeClick?: (nodeId: string) => void
}

function ValidationSection({
  title,
  issues,
  severity,
  onNodeClick,
}: ValidationSectionProps) {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (severity) {
      case 'error':
        return 'bg-red-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'info':
        return 'bg-blue-50'
    }
  }

  const getBorderColor = () => {
    switch (severity) {
      case 'error':
        return 'border-red-200'
      case 'warning':
        return 'border-yellow-200'
      case 'info':
        return 'border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (severity) {
      case 'error':
        return 'text-red-900'
      case 'warning':
        return 'text-yellow-900'
      case 'info':
        return 'text-blue-900'
    }
  }

  return (
    <div className="p-4 border-b border-gray-200 last:border-b-0">
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <ValidationIssueItem
            key={`${issue.code}-${index}`}
            issue={issue}
            icon={getIcon()}
            bgColor={getBgColor()}
            borderColor={getBorderColor()}
            textColor={getTextColor()}
            onNodeClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  )
}

interface ValidationIssueItemProps {
  issue: ValidationIssue
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  textColor: string
  onNodeClick?: (nodeId: string) => void
}

function ValidationIssueItem({
  issue,
  icon,
  bgColor,
  borderColor,
  textColor,
  onNodeClick,
}: ValidationIssueItemProps) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${textColor}`}>{issue.message}</p>
            {issue.node_id && onNodeClick && (
              <button
                onClick={() => onNodeClick(issue.node_id!)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap"
              >
                Go to node
              </button>
            )}
          </div>

          {issue.suggestion && (
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Suggestion:</span> {issue.suggestion}
            </p>
          )}

          {issue.code && (
            <p className="text-xs text-gray-500 mt-1 font-mono">{issue.code}</p>
          )}

          {issue.affected_nodes && issue.affected_nodes.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">Affected nodes:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {issue.affected_nodes.map((nodeId) => (
                  <button
                    key={nodeId}
                    onClick={() => onNodeClick?.(nodeId)}
                    className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {nodeId}
                  </button>
                ))}
              </div>
            </div>
          )}

          {issue.documentation_url && (
            <a
              href={issue.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
            >
              View documentation →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ValidationPanel
