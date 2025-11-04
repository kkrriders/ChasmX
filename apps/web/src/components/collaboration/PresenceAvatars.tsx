/**
 * PresenceAvatars Component
 *
 * Displays active users as avatars with status indicators.
 * Shows who's currently viewing/editing the workflow.
 */

'use client';

import React from 'react';
import { useCollaborationContext } from '@/contexts/CollaborationContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ActiveUser, PresenceStatus } from '@/hooks/useCollaboration';

// ============================================================
// TYPES
// ============================================================

interface PresenceAvatarsProps {
  maxAvatars?: number;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================
// HELPERS
// ============================================================

const getStatusColor = (status: PresenceStatus): string => {
  switch (status) {
    case 'editing':
      return 'bg-green-500';
    case 'viewing':
      return 'bg-blue-500';
    case 'idle':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: PresenceStatus): string => {
  switch (status) {
    case 'editing':
      return 'Editing';
    case 'viewing':
      return 'Viewing';
    case 'idle':
      return 'Idle';
    case 'offline':
      return 'Offline';
    default:
      return 'Unknown';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        avatar: 'h-6 w-6',
        status: 'h-2 w-2',
        overlap: '-ml-2',
      };
    case 'md':
      return {
        avatar: 'h-8 w-8',
        status: 'h-2.5 w-2.5',
        overlap: '-ml-3',
      };
    case 'lg':
      return {
        avatar: 'h-10 w-10',
        status: 'h-3 w-3',
        overlap: '-ml-4',
      };
  }
};

// ============================================================
// SINGLE AVATAR COMPONENT
// ============================================================

interface UserAvatarProps {
  user: ActiveUser;
  showStatus: boolean;
  size: 'sm' | 'md' | 'lg';
  isOverflow?: boolean;
  overflowCount?: number;
}

function UserAvatar({ user, showStatus, size, isOverflow, overflowCount }: UserAvatarProps) {
  const sizeClasses = getSizeClasses(size);

  if (isOverflow) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-gray-200 border-2 border-white dark:border-gray-800',
                sizeClasses.avatar
              )}
            >
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                +{overflowCount}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{overflowCount} more {overflowCount === 1 ? 'user' : 'users'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Avatar className={cn('border-2 border-white dark:border-gray-800', sizeClasses.avatar)}>
              <AvatarImage src={user.user_avatar} alt={user.user_name} />
              <AvatarFallback className="text-xs font-medium">
                {getInitials(user.user_name)}
              </AvatarFallback>
            </Avatar>
            {showStatus && (
              <span
                className={cn(
                  'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
                  sizeClasses.status,
                  getStatusColor(user.status)
                )}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{user.user_name}</p>
            <p className="text-xs text-muted-foreground">{user.user_email}</p>
            {showStatus && (
              <p className="text-xs">
                <span className={cn('inline-block w-2 h-2 rounded-full mr-1', getStatusColor(user.status))} />
                {getStatusText(user.status)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PresenceAvatars({
  maxAvatars = 5,
  showStatus = true,
  size = 'md',
  className,
}: PresenceAvatarsProps) {
  const { activeUsers, isConnected } = useCollaborationContext();

  if (!isConnected || activeUsers.length === 0) {
    return null;
  }

  const visibleUsers = activeUsers.slice(0, maxAvatars);
  const overflowCount = activeUsers.length - maxAvatars;
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={cn('flex items-center', className)}>
      {visibleUsers.map((user, index) => (
        <div
          key={user.session_id}
          className={cn(index > 0 && sizeClasses.overlap)}
          style={{ zIndex: visibleUsers.length - index }}
        >
          <UserAvatar user={user} showStatus={showStatus} size={size} />
        </div>
      ))}

      {overflowCount > 0 && (
        <div className={cn(sizeClasses.overlap)} style={{ zIndex: 0 }}>
          <UserAvatar
            user={activeUsers[0]} // Dummy user for type safety
            showStatus={false}
            size={size}
            isOverflow
            overflowCount={overflowCount}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default PresenceAvatars;
