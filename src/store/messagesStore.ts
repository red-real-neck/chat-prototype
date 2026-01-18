import { create } from 'zustand';
import type { Message, OptimisticMessage } from '@/domain/message';
import { getMessages } from '@/services/messageService';

interface MessagesState {
  // Normalized storage: Record<chatId, Message[]>
  messagesByChatId: Record<string, Message[]>;
  loadingByChatId: Record<string, boolean>;

  // Actions
  loadMessages: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  addOptimisticMessage: (optimisticMessage: OptimisticMessage) => void;
  receiveSocketMessage: (message: Message) => void;
  confirmOptimisticMessage: (tempId: string, realId: string) => void;
  removeOptimisticMessage: (tempId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  // Initial state
  messagesByChatId: {},
  loadingByChatId: {},

  // Actions
  loadMessages: async (chatId: string) => {
    set((state) => ({
      loadingByChatId: { ...state.loadingByChatId, [chatId]: true },
    }));

    try {
      const messages = await getMessages(chatId);
      set((state) => ({
        messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
        loadingByChatId: { ...state.loadingByChatId, [chatId]: false },
      }));
    } catch (error) {
      set((state) => ({
        loadingByChatId: { ...state.loadingByChatId, [chatId]: false },
      }));
      throw error;
    }
  },

  addMessage: (message: Message) => {
    set((state) => {
      const chatMessages = state.messagesByChatId[message.chatId] || [];
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [message.chatId]: [...chatMessages, message],
        },
      };
    });
  },

  addOptimisticMessage: (optimisticMessage: OptimisticMessage) => {
    set((state) => {
      const chatMessages = state.messagesByChatId[optimisticMessage.chatId] || [];
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [optimisticMessage.chatId]: [...chatMessages, optimisticMessage],
        },
      };
    });
  },

  receiveSocketMessage: (message: Message) => {
    // Add the message and ensure it's sorted by timestamp
    set((state) => {
      const chatMessages = state.messagesByChatId[message.chatId] || [];
      const updatedMessages = [...chatMessages, message].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [message.chatId]: updatedMessages,
        },
      };
    });
  },

  confirmOptimisticMessage: (tempId: string, realId: string) => {
    set((state) => {
      const newMessagesByChatId = { ...state.messagesByChatId };

      // Find and update the optimistic message
      Object.keys(newMessagesByChatId).forEach((chatId) => {
        newMessagesByChatId[chatId] = newMessagesByChatId[chatId].map((msg) =>
          msg.id === tempId
            ? { ...msg, id: realId, status: 'sent' as const }
            : msg
        );
      });

      return { messagesByChatId: newMessagesByChatId };
    });
  },

  removeOptimisticMessage: (tempId: string) => {
    set((state) => {
      const newMessagesByChatId = { ...state.messagesByChatId };

      // Remove the optimistic message
      Object.keys(newMessagesByChatId).forEach((chatId) => {
        newMessagesByChatId[chatId] = newMessagesByChatId[chatId].filter(
          (msg) => msg.id !== tempId
        );
      });

      return { messagesByChatId: newMessagesByChatId };
    });
  },
}));