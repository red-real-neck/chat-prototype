import React from 'react';

export const NewMessagesDivider: React.FC = () => {
  return (
    <div className="flex items-center justify-center my-4 px-4">
      <div className="flex items-center w-full">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-xs text-gray-500 font-medium">
          Новые сообщения
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  );
};
