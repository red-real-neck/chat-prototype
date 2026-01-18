import React from 'react';

interface ChatWindowProps {
  chatTitle?: string;
  children: React.ReactNode;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatTitle,
  children,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {chatTitle || 'Select a chat'}
        </h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
};