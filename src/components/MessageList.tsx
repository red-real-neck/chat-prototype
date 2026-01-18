import React, { useEffect, useMemo, memo, useRef } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { MessageItem } from './MessageItem';
import { NewMessagesDivider } from './NewMessagesDivider';
import type { Message, OptimisticMessage } from '@/domain/message';

interface MessageListProps {
  messages: (Message | OptimisticMessage)[];
  currentUserId: string;
  unreadCount?: number;
  chatId?: string;
}

const MessageListComponent: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  unreadCount = 0,
  chatId,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const previousChatIdRef = useRef<string | undefined>(chatId);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  
  // Reset scroll button when chat changes
  useEffect(() => {
    if (previousChatIdRef.current !== chatId) {
      setShowScrollButton(false);
      previousChatIdRef.current = chatId;
    }
  }, [chatId]);

  // Calculate index of first new message (based on unreadCount)
  const firstNewMessageIndex = useMemo(() => {
    if (unreadCount === 0 || messages.length === 0) {
      return -1;
    }
    return Math.max(0, messages.length - unreadCount);
  }, [messages.length, unreadCount]);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      align: 'end',
      behavior: 'smooth',
    });
    setShowScrollButton(false);
  };

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
    <div className="flex-1 h-full relative">
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        data={messages}
        initialTopMostItemIndex={messages.length - 1} // Start at bottom
        followOutput="auto" // Stick to bottom when new messages arrive
        atBottomStateChange={(atBottom) => setShowScrollButton(!atBottom)}
        itemContent={(index, message) => {
          const shouldShowDivider = 
            firstNewMessageIndex >= 0 && 
            index === firstNewMessageIndex &&
            index > 0;
          
          return (
            <div className="pb-1 px-4">
              {shouldShowDivider && <NewMessagesDivider />}
              <MessageItem
                message={message}
                isOwn={message.sender === currentUserId}
              />
            </div>
          );
        }}
      />

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const MessageList = memo(MessageListComponent);