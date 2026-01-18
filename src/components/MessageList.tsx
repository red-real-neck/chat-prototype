import React, { useEffect, useMemo } from 'react';
import { MessageItem } from './MessageItem';
import type { Message, OptimisticMessage } from '@/domain/message';

interface MessageListProps {
  messages: (Message | OptimisticMessage)[];
  currentUserId: string;
}

const MESSAGE_HEIGHT = 70;


export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(400);

  // Update container height when component mounts or resizes
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / MESSAGE_HEIGHT);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / MESSAGE_HEIGHT) + 2, // +2 for buffer
      messages.length
    );
    return { startIndex: Math.max(0, startIndex - 1), endIndex }; // -1 for buffer
  }, [scrollTop, containerHeight, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setScrollTop(containerRef.current.scrollTop);
    }
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleMessages = messages.slice(visibleRange.startIndex, visibleRange.endIndex);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">💬</div>
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
      <div
        ref={containerRef}
        className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        onScroll={handleScroll}
      >
        {/* Spacer for content above visible area */}
        <div style={{ height: visibleRange.startIndex * MESSAGE_HEIGHT }} />

        {/* Visible messages */}
        {visibleMessages.map((message, index) => {
          const actualIndex = visibleRange.startIndex + index;
          return (
            <div
              key={message.id || `temp-${actualIndex}`}
              className="px-4 py-1"
            >
              <MessageItem
                message={message}
                isOwn={message.sender === currentUserId}
              />
            </div>
          );
        })}

        {/* Spacer for content below visible area */}
        <div style={{ height: (messages.length - visibleRange.endIndex) * MESSAGE_HEIGHT }} />
      </div>
    </div>
  );
};