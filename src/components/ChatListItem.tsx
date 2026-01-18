import React from 'react';
import type { ChatPreview } from '@/domain/chat';

interface ChatListItemProps {
  chat: ChatPreview;
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isActive,
  onClick,
}) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start mb-1">
        <img
          src={chat.avatar}
          alt={`${chat.title} avatar`}
          className="w-10 h-10 rounded-lg mr-3 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-gray-900 truncate flex-1">
              {chat.title}
            </h3>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(chat.lastMessageAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate mb-1">
            {chat.lastMessage}
          </p>
          {chat.unreadCount > 0 && (
            <div className="flex justify-end">
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};