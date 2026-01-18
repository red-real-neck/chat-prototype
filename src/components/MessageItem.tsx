import React from 'react';
import type { Message, OptimisticMessage } from '@/domain/message';

interface MessageItemProps {
  message: Message | OptimisticMessage;
  isOwn: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn }) => {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
        }`}
      >
        <div className="text-sm break-words">{message.content}</div>
        <div className={`flex items-center justify-end mt-1 text-xs ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span className="mr-1">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="text-xs">{getStatusIcon(message.status)}</span>
          )}
        </div>
      </div>
    </div>
  );
};