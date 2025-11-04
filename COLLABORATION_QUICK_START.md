# 🚀 Collaboration Quick Start

**5-Minute Integration Guide**

---

## Step 1: Install Dependencies (if needed)

```bash
cd apps/web
npm install framer-motion date-fns  # For animations and date formatting
```

---

## Step 2: Add Collaboration to Your Workflow Editor

```tsx
// app/workflows/[id]/page.tsx

import { CollaborationProvider } from '@/contexts/CollaborationContext';
import { PresenceAvatars, CollaborativeCursors } from '@/components/collaboration';

export default function WorkflowPage({ params }: { params: { id: string } }) {
  const currentUser = {
    id: 'user_123',  // Get from your auth
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://...',
  };

  return (
    <CollaborationProvider
      workflowId={params.id}
      userId={currentUser.id}
      userName={currentUser.name}
      userEmail={currentUser.email}
      userAvatar={currentUser.avatar}
      onWorkflowUpdate={(change) => {
        // Apply remote changes to your workflow
        console.log('Remote change:', change);
      }}
    >
      <WorkflowEditor />
    </CollaborationProvider>
  );
}

function WorkflowEditor() {
  const canvasRef = useRef(null);

  return (
    <div>
      {/* Toolbar with presence */}
      <div className="toolbar">
        <PresenceAvatars size="md" showStatus />
      </div>

      {/* Canvas with cursors */}
      <div ref={canvasRef} className="canvas">
        {/* Your workflow editor */}
        <CollaborativeCursors containerRef={canvasRef} />
      </div>
    </div>
  );
}
```

---

## Step 3: Send Cursor Updates

```tsx
import { useCollaborationContext } from '@/contexts/CollaborationContext';

function Canvas() {
  const { sendCursorMove } = useCollaborationContext();

  return (
    <div
      onMouseMove={(e) => {
        sendCursorMove({
          x: e.clientX,
          y: e.clientY,
        });
      }}
    >
      {/* Canvas */}
    </div>
  );
}
```

---

## Step 4: Send Workflow Changes

```tsx
const { sendWorkflowChange } = useCollaborationContext();

// When node is added
function handleNodeAdd(node) {
  sendWorkflowChange('node_added', {
    node_id: node.id,
    type: node.type,
    position: node.position,
  });
}

// When node is updated
function handleNodeUpdate(node) {
  sendWorkflowChange('node_updated', {
    node_id: node.id,
    config: node.config,
  });
}
```

---

## Step 5: Add Version History (Optional)

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { VersionHistory } from '@/components/collaboration';
import { History } from 'lucide-react';

function Toolbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] p-0">
        <VersionHistory
          workflowId={workflowId}
          onRestore={(version) => {
            // Restore this version
            console.log('Restore:', version);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
```

---

## Complete Example

```tsx
'use client';

import { useRef } from 'react';
import { CollaborationProvider, useCollaborationContext } from '@/contexts/CollaborationContext';
import { PresenceAvatars, CollaborativeCursors } from '@/components/collaboration';

function WorkflowEditorContent() {
  const canvasRef = useRef(null);
  const { sendCursorMove, sendWorkflowChange } = useCollaborationContext();

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1>My Workflow</h1>
        <PresenceAvatars maxAvatars={5} size="md" showStatus />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={(e) => {
            sendCursorMove({ x: e.clientX, y: e.clientY });
          }}
        >
          {/* Your workflow nodes/edges */}
        </div>

        <CollaborativeCursors containerRef={canvasRef} />
      </div>
    </div>
  );
}

export default function WorkflowPage({ params }) {
  return (
    <CollaborationProvider
      workflowId={params.id}
      userId="user_123"
      userName="John Doe"
      userEmail="john@example.com"
      onWorkflowUpdate={(change) => {
        console.log('Change from another user:', change);
        // Apply to your workflow state
      }}
    >
      <WorkflowEditorContent />
    </CollaborationProvider>
  );
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# WebSocket URL (defaults to localhost:8000)
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Or for production
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

---

## That's It!

You now have:
- ✅ Live presence tracking
- ✅ Collaborative cursors
- ✅ Real-time updates
- ✅ Auto-reconnection
- ✅ Version history (optional)

---

## Need Help?

1. **Full docs:** `docs/REAL_TIME_COLLABORATION_IMPLEMENTATION.md`
2. **Example:** `apps/web/src/components/collaboration/CollaborationExample.tsx`
3. **Types:** `apps/web/src/hooks/useCollaboration.ts`

---

**Time to integrate:** < 5 minutes
**Result:** Google Docs-style collaboration!
