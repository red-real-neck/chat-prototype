import { useEffect, useRef } from 'react';
import { AppLayout, ChatList, ChatListItem, ChatWindow, MessageInput, MessageList, MessageSkeleton } from '@/components';
import { useChatsStore } from '@/store/chatsStore';
import { useMessagesStore } from '@/store/messagesStore';
import { mockSocket } from '@/services/mockSocket';
import type { Message } from '@/domain/message';

const CURRENT_USER_ID = 'You';

function App() {
  const {
    chats,
    activeChatId,
    isLoading,
    error,
    loadChats,
    setActiveChat,
    updateLastMessage,
    updateChatWithIncomingMessage,
    syncChatPreview
  } = useChatsStore();
  
  // Store unreadCount before it gets reset when opening chat
  const unreadCountBeforeOpenRef = useRef<Record<string, number>>({});

  const {
    messagesByChatId,
    loadingByChatId,
    loadedByChatId,
    loadMessages,
    sendMessage: sendMessageAction,
    receiveSocketMessage
  } = useMessagesStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      // Load if not loaded yet and not currently loading
      // Or if messages array is empty (to be safe)
      const hasMessages = messagesByChatId[activeChatId] && messagesByChatId[activeChatId].length > 0;
      const isLoaded = loadedByChatId?.[activeChatId];
      const isLoading = loadingByChatId[activeChatId];
      
      if (!isLoading && (!isLoaded || !hasMessages)) {
        loadMessages(activeChatId);
      }
    }
  }, [activeChatId, messagesByChatId, loadingByChatId, loadedByChatId, loadMessages]);

  // Sync preview when messages are loaded or updated
  // Sync preview for all chats based on their actual last message
  useEffect(() => {
    Object.keys(messagesByChatId).forEach((chatId) => {
      const messages = messagesByChatId[chatId];
      if (messages && messages.length > 0) {
        // Get the last message (messages are sorted by timestamp)
        const lastMessage = messages[messages.length - 1];
        // Only sync if this message actually exists in the array
        if (lastMessage && lastMessage.id) {
          syncChatPreview(chatId, lastMessage.content, lastMessage.timestamp);
        }
      }
    });
  }, [messagesByChatId, syncChatPreview]);

  // Subscribe to mock socket for real-time messages
  useEffect(() => {
    const handleIncomingMessage = (message: Message) => {
      if (message.chatId === activeChatId) {
        // Message is for active chat - add to messages store
        // Preview will be synced automatically via useEffect that watches messagesByChatId
        receiveSocketMessage(message);
      } else {
        // Message is for inactive chat - add to messages store first
        receiveSocketMessage(message);
        // Then update chat preview (will be synced from actual messages via useEffect)
        // But also update unread count immediately
        updateChatWithIncomingMessage(message.chatId, message.content, message.timestamp);
      }
    };

    mockSocket.subscribe(handleIncomingMessage);

    return () => {
      mockSocket.unsubscribe();
    };
  }, [activeChatId, receiveSocketMessage, updateChatWithIncomingMessage]);

  const activeChat = chats.find(chat => chat.id === activeChatId);
  const messages = activeChatId ? messagesByChatId[activeChatId] || [] : [];
  const isLoadingMessages = activeChatId ? loadingByChatId[activeChatId] : false;
  
  // Get unreadCount before it was reset (for showing divider)
  // Use stored value if available, otherwise use current (which might be 0 after reset)
  const unreadCountForDisplay = activeChatId 
    ? (unreadCountBeforeOpenRef.current[activeChatId] ?? activeChat?.unreadCount ?? 0)
    : 0;

  const handleChatClick = (chatId: string) => {
    // Store unreadCount before opening chat
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      unreadCountBeforeOpenRef.current[chatId] = chat.unreadCount;
    }
    setActiveChat(chatId);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChatId) return;

    try {
      await sendMessageAction(activeChatId, content, CURRENT_USER_ID);
      // Preview will be synced automatically via useEffect that watches messagesByChatId
      // Update last message for immediate UI feedback (but preview will be synced from actual message)
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
            onClick={() => handleChatClick(chat.id)}
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
          <MessageSkeleton />
        ) : (
          <MessageList 
            messages={messages} 
            currentUserId={CURRENT_USER_ID}
            unreadCount={unreadCountForDisplay}
            chatId={activeChatId || undefined}
          />
        )}
      </ChatWindow>
    </AppLayout>
  )
}

export default App;
