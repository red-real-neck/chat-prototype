// @ts-nocheck
import React, { useEffect } from 'react';
import { List } from 'react-window';
import { MessageItem } from './MessageItem';
import type { Message, OptimisticMessage } from '@/domain/message';

interface MessageListProps {
  messages: (Message | OptimisticMessage)[];
  currentUserId: string;
  height?: number;
}

const MESSAGE_HEIGHT = 80; // Fixed height for each message item

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  height = 400,
}) => {
  const listRef = React.useRef<any>(null);
  const shouldAutoScrollRef = React.useRef(true);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (shouldAutoScrollRef.current && messages.length > 0) {
      listRef.current?.scrollToRow({ index: messages.length - 1, align: 'end' });
    }
  }, [messages.length]);


  const renderMessage = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    const isOwn = message.sender === currentUserId;

    return (
      <div style={style} className="px-4">
        <MessageItem message={message} isOwn={isOwn} />
      </div>
    );
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
    <div className="flex-1">
      <List
        listRef={listRef}
        rowCount={messages.length}
        rowHeight={MESSAGE_HEIGHT}
        rowComponent={renderMessage}
        rowProps={{}}
        defaultHeight={height}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      />
    </div>
  );
};