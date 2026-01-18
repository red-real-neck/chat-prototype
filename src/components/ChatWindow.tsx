import React from 'react';

interface ChatWindowProps {
  chatTitle?: string;
  children: React.ReactNode;
  input?: React.ReactNode;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatTitle,
  children,
  input,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {chatTitle || 'Select a chat'}
        </h2>
      </div>

      {/* Messages area - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Message input */}
      {input}
    </div>
  );
};