/**
 * VersionHistory Component
 *
 * Displays workflow version history with restore capability.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  GitBranch,
  User,
  Tag,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// ============================================================
// TYPES
// ============================================================

export interface WorkflowVersion {
  version_number: number;
  version_type: 'manual' | 'auto' | 'checkpoint' | 'restore';
  created_by: string;
  created_by_name: string;
  created_at: string;
  change_summary?: string;
  tags?: string[];
  description?: string;
  is_checkpoint: boolean;
  parent_version?: number;
}

interface VersionHistoryProps {
  workflowId: string;
  onRestore?: (version: WorkflowVersion) => void;
  onCompare?: (versionA: number, versionB: number) => void;
  className?: string;
}

// ============================================================
// HELPERS
// ============================================================

const getVersionTypeColor = (type: string): string => {
  switch (type) {
    case 'manual':
      return 'bg-blue-500';
    case 'auto':
      return 'bg-gray-500';
    case 'checkpoint':
      return 'bg-green-500';
    case 'restore':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const getVersionTypeLabel = (type: string): string => {
  switch (type) {
    case 'manual':
      return 'Manual Save';
    case 'auto':
      return 'Auto-save';
    case 'checkpoint':
      return 'Checkpoint';
    case 'restore':
      return 'Restored';
    default:
      return type;
  }
};

// ============================================================
// VERSION ITEM COMPONENT
// ============================================================

interface VersionItemProps {
  version: WorkflowVersion;
  isLatest: boolean;
  onRestore?: (version: WorkflowVersion) => void;
  onCompare?: (versionA: number, versionB: number) => void;
  latestVersionNumber?: number;
}

function VersionItem({ version, isLatest, onRestore, onCompare, latestVersionNumber }: VersionItemProps) {
  return (
    <div className={cn(
      'p-4 border rounded-lg hover:bg-accent/50 transition-colors',
      isLatest && 'border-primary bg-accent/30'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Version Number & Type */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">v{version.version_number}</span>
            </div>

            <Badge
              variant="secondary"
              className={cn('text-xs', getVersionTypeColor(version.version_type))}
            >
              {getVersionTypeLabel(version.version_type)}
            </Badge>

            {isLatest && (
              <Badge variant="default" className="text-xs">
                Current
              </Badge>
            )}

            {version.is_checkpoint && (
              <Tag className="h-3.5 w-3.5 text-yellow-500" />
            )}
          </div>

          {/* Description/Summary */}
          {(version.description || version.change_summary) && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {version.description || version.change_summary}
            </p>
          )}

          {/* Tags */}
          {version.tags && version.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {version.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{version.created_by_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {!isLatest && onRestore && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestore(version)}
              className="h-8"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Restore
            </Button>
          )}
          {onCompare && latestVersionNumber && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCompare(version.version_number, latestVersionNumber)}
              className="h-8"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Compare
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function VersionHistory({
  workflowId,
  onRestore,
  onCompare,
  className,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/collaboration/workflows/${workflowId}/versions?limit=50`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }

        const data = await response.json();
        setVersions(data.versions || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load versions');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [workflowId]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading versions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <p className="text-sm text-destructive">{error}</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No versions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Versions will appear here as you save changes
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Version History
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {versions.map((version, index) => (
            <VersionItem
              key={version.version_number}
              version={version}
              isLatest={index === 0}
              onRestore={onRestore}
              onCompare={onCompare}
              latestVersionNumber={versions[0]?.version_number}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default VersionHistory;
