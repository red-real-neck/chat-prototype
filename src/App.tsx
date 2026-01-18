import { useEffect } from 'react';
import { AppLayout, ChatList, ChatListItem, ChatWindow, MessageInput, MessageList } from '@/components';
import { useChatsStore } from '@/store/chatsStore';
import { useMessagesStore } from '@/store/messagesStore';

const CURRENT_USER_ID = 'You';

function App() {
  const {
    chats,
    activeChatId,
    isLoading,
    error,
    loadChats,
    setActiveChat,
    updateLastMessage
  } = useChatsStore();

  const {
    messagesByChatId,
    loadingByChatId,
    loadMessages,
    sendMessage: sendMessageAction
  } = useMessagesStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId && !messagesByChatId[activeChatId]) {
      loadMessages(activeChatId);
    }
  }, [activeChatId, messagesByChatId, loadMessages]);

  const activeChat = chats.find(chat => chat.id === activeChatId);
  const messages = activeChatId ? messagesByChatId[activeChatId] || [] : [];
  const isLoadingMessages = activeChatId ? loadingByChatId[activeChatId] : false;

  const handleSendMessage = async (content: string) => {
    if (!activeChatId) return;

    try {
      await sendMessageAction(activeChatId, content, CURRENT_USER_ID);
      // Update chat preview with the sent message
      updateLastMessage(activeChatId, content, new Date());
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show a toast notification here
    }
  };

  return (
    <AppLayout>
      <ChatList>
        {isLoading && (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4 border-b border-gray-100 animate-pulse">
                <div className="flex justify-between items-start mb-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              </div>
            ))}
          </>
        )}

        {error && !isLoading && (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-sm text-red-600 mb-2">Failed to load chats</p>
            <button
              onClick={loadChats}
              className="text-blue-500 text-sm hover:text-blue-600"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && chats.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">💬</div>
            <p className="text-sm text-gray-500">No chats available</p>
          </div>
        )}

        {!isLoading && !error && chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === activeChatId}
            onClick={() => setActiveChat(chat.id)}
          />
        ))}
      </ChatList>

      <ChatWindow
        chatTitle={activeChat?.title}
        input={
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!activeChatId || isLoadingMessages}
          />
        }
      >
        {isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading messages...</p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={CURRENT_USER_ID} />
        )}
      </ChatWindow>
    </AppLayout>
  )
}

export default App;
