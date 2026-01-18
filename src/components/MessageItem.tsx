import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import type { Message, OptimisticMessage } from '@/domain/message';

interface MessageItemProps {
  message: Message | OptimisticMessage;
  isOwn: boolean;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({ message, isOwn }) => {
  // Determine if message should be animated (new messages only)
  const shouldAnimate = useMemo(() => {
    // Always animate optimistic messages (being sent by user)
    if (message.status === 'sending') {
      return true;
    }

    // For simplicity, don't animate other messages to avoid performance issues
    // In a real app, you might track message IDs that haven't been seen yet
    return false;
  }, [message.status]);
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

  const messageContent = (
    <div
      className={`max-w-[70%] min-w-[120px] px-4 py-2 rounded-lg flex flex-col ${
        isOwn
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-gray-200 text-gray-900 rounded-bl-sm'
      }`}
    >
      <div className="text-sm break-words flex-1">{message.content}</div>
      <div className={`flex items-center justify-end mt-1 text-xs flex-shrink-0 self-end ${
        isOwn ? 'text-blue-100' : 'text-gray-500'
      }`}>
        <span className="mr-1 whitespace-nowrap">{formatTime(message.timestamp)}</span>
        {isOwn && (
          <span className="text-xs flex-shrink-0">{getStatusIcon(message.status)}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {shouldAnimate ? (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
          layout={false} // Disable layout animations to avoid conflicts with virtualization
        >
          {messageContent}
        </motion.div>
      ) : (
        <div key={message.id}>
          {messageContent}
        </div>
      )}
    </div>
  );
};

export const MessageItem = memo(MessageItemComponent);