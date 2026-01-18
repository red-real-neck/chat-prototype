import React from 'react';

interface MessageSkeletonProps {
  count?: number;
}

const MessageSkeletonComponent: React.FC<MessageSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: count }).map((_, index) => {
        // Alternate between left and right alignment to simulate conversation
        const isOwn = index % 3 === 2; // Every 3rd message is "own" (right-aligned)
        const width = isOwn
          ? ['w-48', 'w-32', 'w-64'][index % 3] // Shorter for own messages
          : ['w-64', 'w-32', 'w-48'][index % 3]; // Longer for other messages

        return (
          <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-pulse`}>
            <div className={`flex flex-col ${width} min-w-[120px] px-4 py-2 rounded-lg bg-gray-200`}>
              {/* Message content skeleton */}
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              {/* Time/status skeleton */}
              <div className="flex justify-end">
                <div className="h-3 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const MessageSkeleton = MessageSkeletonComponent;