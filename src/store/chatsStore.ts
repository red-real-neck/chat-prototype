import { create } from 'zustand';
import type { Chat } from '@/domain/chat';
import { getChats } from '@/services/chatService';

interface ChatsState {
  // State
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
  lastReadMessageIdByChatId: Record<string, string | null>;

  // Actions
  loadChats: () => Promise<void>;
  setActiveChat: (chatId: string) => void;
  updateLastMessage: (chatId: string, lastMessage: string, lastMessageAt: Date) => void;
  updateChatWithIncomingMessage: (chatId: string, message: string, timestamp: Date) => void;
  syncChatPreview: (chatId: string, lastMessage: string, lastMessageAt: Date) => void;
  markChatAsRead: (chatId: string, lastMessageId: string) => void;
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  // Initial state
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
  lastReadMessageIdByChatId: {},

  // Actions
  loadChats: async () => {
    set({ isLoading: true, error: null });

    try {
      const chats = await getChats();
      set({
        chats,
        isLoading: false,
        // Auto-select first chat if none selected
        activeChatId: get().activeChatId || chats[0]?.id || null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load chats',
        isLoading: false,
      });
    }
  },

  setActiveChat: (chatId: string) => {
    set((state) => {
      // Сбросить счетчик непрочитанных для открываемого чата
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      );
      
      return {
        activeChatId: chatId,
        chats: updatedChats,
      };
    });
  },

  updateLastMessage: (chatId: string, lastMessage: string, lastMessageAt: Date) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage, lastMessageAt, unreadCount: 0 }
          : chat
      ),
    }));
  },

  updateChatWithIncomingMessage: (chatId: string, message: string, timestamp: Date) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              lastMessageAt: timestamp,
              unreadCount: chat.id !== state.activeChatId ? chat.unreadCount + 1 : 0
            }
          : chat
      ),
    }));
  },

  syncChatPreview: (chatId: string, lastMessage: string, lastMessageAt: Date) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage, lastMessageAt }
          : chat
      ),
    }));
  },

  markChatAsRead: (chatId: string, lastMessageId: string) => {
    set((state) => ({
      lastReadMessageIdByChatId: {
        ...state.lastReadMessageIdByChatId,
        [chatId]: lastMessageId,
      },
    }));
  },
}));