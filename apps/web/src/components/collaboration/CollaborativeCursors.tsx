/**
 * CollaborativeCursors Component
 *
 * Renders live cursors for all active collaborators.
 * Shows smooth cursor movement with user names.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useCollaborationContext } from '@/contexts/CollaborationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ActiveUser } from '@/hooks/useCollaboration';

// ============================================================
// TYPES
// ============================================================

interface CollaborativeCursorsProps {
  containerRef?: React.RefObject<HTMLElement>;
  offset?: { x: number; y: number };
}

// ============================================================
// CURSOR COLORS
// ============================================================

const CURSOR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky
  '#F8B4D9', // Pink
  '#A8E6CF', // Green
];

const getUserColor = (userId: string): string => {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

// ============================================================
// SINGLE CURSOR COMPONENT
// ============================================================

interface UserCursorProps {
  user: ActiveUser;
  containerOffset: { x: number; y: number };
}

function UserCursor({ user, containerOffset }: UserCursorProps) {
  if (!user.cursor_position) return null;

  const color = getUserColor(user.user_id);
  const x = user.cursor_position.x - containerOffset.x;
  const y = user.cursor_position.y - containerOffset.y;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className="absolute top-0 left-0 pointer-events-none z-50"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M5.65376 12.3673L5.65376 5.41245L13.4152 13.1739L9.31583 13.1739L5.65376 12.3673Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* User Name Label */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-5 left-5 whitespace-nowrap"
      >
        <div
          className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          {user.user_name}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function CollaborativeCursors({
  containerRef,
  offset = { x: 0, y: 0 },
}: CollaborativeCursorsProps) {
  const { activeUsers, sessionId } = useCollaborationContext();
  const [containerOffset, setContainerOffset] = useState(offset);

  // Update container offset when containerRef changes
  useEffect(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerOffset({
        x: rect.left + offset.x,
        y: rect.top + offset.y,
      });

      // Update on scroll/resize
      const updateOffset = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setContainerOffset({
            x: rect.left + offset.x,
            y: rect.top + offset.y,
          });
        }
      };

      window.addEventListener('scroll', updateOffset);
      window.addEventListener('resize', updateOffset);

      return () => {
        window.removeEventListener('scroll', updateOffset);
        window.removeEventListener('resize', updateOffset);
      };
    }
  }, [containerRef, offset]);

  // Filter out current user's cursor
  const otherUsers = activeUsers.filter(user => user.session_id !== sessionId);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {otherUsers.map(user => (
          <UserCursor
            key={user.session_id}
            user={user}
            containerOffset={containerOffset}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default CollaborativeCursors;
