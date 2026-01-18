import { create } from 'zustand';
import type { Message, OptimisticMessage } from '@/domain/message';
import { getMessages, sendMessage } from '@/services/messageService';
import { createOptimisticMessage } from '@/domain/message';

interface MessagesState {
  // Normalized storage: Record<chatId, Message[]>
  messagesByChatId: Record<string, Message[]>;
  loadingByChatId: Record<string, boolean>;

  // Actions
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, sender: string) => Promise<void>;
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

  sendMessage: async (chatId: string, content: string, sender: string) => {
    // Create optimistic message
    const optimisticMessage = createOptimisticMessage(chatId, content, sender);

    // Add optimistic message immediately
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [...(state.messagesByChatId[chatId] || []), optimisticMessage],
      },
    }));

    try {
      // Send message via service
      const realMessage = await sendMessage(chatId, content, sender);

      // Confirm optimistic message with real data
      set((state) => {
        const chatMessages = state.messagesByChatId[chatId] || [];
        const updatedMessages = chatMessages.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...realMessage } // Replace with real message
            : msg
        );

        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: updatedMessages,
          },
        };
      });
    } catch (error) {
      // Remove optimistic message on error
      set((state) => {
        const chatMessages = state.messagesByChatId[chatId] || [];
        const filteredMessages = chatMessages.filter((msg) => msg.id !== optimisticMessage.id);

        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: filteredMessages,
          },
        };
      });
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