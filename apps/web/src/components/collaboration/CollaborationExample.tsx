/**
 * CollaborationExample Component
 *
 * Example implementation showing how to use all collaboration components together.
 * Use this as a reference for integrating collaboration into your workflow editor.
 */

'use client';

import React, { useRef } from 'react';
import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { PresenceAvatars } from './PresenceAvatars';
import { CollaborativeCursors } from './CollaborativeCursors';
import { VersionHistory } from './VersionHistory';
import type { WorkflowVersion } from './VersionHistory';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { History, Users } from 'lucide-react';

// ============================================================
// EXAMPLE WORKFLOW EDITOR
// ============================================================

interface WorkflowEditorProps {
  workflowId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
}

function WorkflowEditorContent() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleRestore = (version: WorkflowVersion) => {
    console.log('Restore version:', version.version_number);
    // Implement restore logic
  };

  const handleCompare = (versionA: number, versionB: number) => {
    console.log('Compare versions:', versionA, 'vs', versionB);
    // Implement compare logic
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Workflow Editor</h1>

          {/* Presence Avatars */}
          <PresenceAvatars maxAvatars={5} size="md" showStatus />
        </div>

        <div className="flex items-center gap-2">
          {/* Version History Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
              <VersionHistory
                workflowId="workflow_123"
                onRestore={handleRestore}
                onCompare={handleCompare}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full bg-gray-50 dark:bg-gray-900"
          onMouseMove={(e) => {
            // Send cursor position updates
            // This would be handled by the collaboration context
          }}
        >
          <div className="p-8">
            <p className="text-muted-foreground text-center">
              Workflow Canvas
              <br />
              <span className="text-xs">Move your mouse to see collaborative cursors</span>
            </p>
          </div>
        </div>

        {/* Collaborative Cursors Overlay */}
        <CollaborativeCursors containerRef={canvasRef} />
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT WITH PROVIDER
// ============================================================

export function CollaborationExample({
  workflowId,
  userId,
  userName,
  userEmail,
  userAvatar,
}: WorkflowEditorProps) {
  return (
    <CollaborationProvider
      workflowId={workflowId}
      userId={userId}
      userName={userName}
      userEmail={userEmail}
      userAvatar={userAvatar}
      enabled={true}
      onConnected={(data) => {
        console.log('Connected to collaboration:', data.sessionId);
        console.log('Active users:', data.activeUsers);
      }}
      onWorkflowUpdate={(change) => {
        console.log('Workflow updated:', change);
        // Apply change to local workflow state
      }}
      onCommentAdded={(comment) => {
        console.log('Comment added:', comment);
        // Show notification or update comments UI
      }}
      onError={(error) => {
        console.error('Collaboration error:', error);
      }}
    >
      <WorkflowEditorContent />
    </CollaborationProvider>
  );
}

// ============================================================
// USAGE EXAMPLE
// ============================================================

/*

import { CollaborationExample } from '@/components/collaboration/CollaborationExample';

function MyPage() {
  return (
    <CollaborationExample
      workflowId="workflow_123"
      userId="user_abc"
      userName="John Doe"
      userEmail="john@example.com"
      userAvatar="https://example.com/avatar.jpg"
    />
  );
}

*/

export default CollaborationExample;
