import { create } from 'zustand';
import type { Message, OptimisticMessage } from '@/domain/message';
import { getMessages, sendMessage } from '@/services/messageService';
import { createOptimisticMessage } from '@/domain/message';

interface MessagesState {
  // Normalized storage: Record<chatId, Message[]>
  messagesByChatId: Record<string, Message[]>;
  loadingByChatId: Record<string, boolean>;
  loadedByChatId: Record<string, boolean>;

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
  loadedByChatId: {},

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
        loadedByChatId: { ...state.loadedByChatId, [chatId]: true },
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
        const now = new Date();
        
        // Find the optimistic message to preserve its timestamp
        const optimisticMsg = chatMessages.find(msg => msg.id === optimisticMessage.id);
        const optimisticTimestamp = optimisticMsg?.timestamp;
        
        // Use optimistic timestamp if real message timestamp is in the future
        // or if real message timestamp is later than optimistic timestamp
        let finalTimestamp = realMessage.timestamp;
        if (optimisticTimestamp) {
          // If real message timestamp is in the future or later than optimistic, use optimistic
          if (realMessage.timestamp.getTime() > now.getTime() || 
              realMessage.timestamp.getTime() > optimisticTimestamp.getTime()) {
            finalTimestamp = optimisticTimestamp;
          }
        }
        
        // Ensure timestamp is not in the future
        if (finalTimestamp.getTime() > now.getTime()) {
          finalTimestamp = now;
        }

        const updatedMessages = chatMessages.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...realMessage, timestamp: finalTimestamp } // Replace with real message but preserve timestamp
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
      const now = new Date();
      
      // Ensure timestamp is not in the future
      let messageTimestamp = message.timestamp;
      if (messageTimestamp.getTime() > now.getTime()) {
        messageTimestamp = now;
      }
      
      const messageWithValidTimestamp = { ...message, timestamp: messageTimestamp };
      
      // Check for duplicates by ID
      const existingMessageIndex = chatMessages.findIndex(msg => msg.id === messageWithValidTimestamp.id);
      let updatedMessages;
      
      if (existingMessageIndex >= 0) {
        // Update existing message instead of adding duplicate
        updatedMessages = [...chatMessages];
        updatedMessages[existingMessageIndex] = messageWithValidTimestamp;
      } else {
        // Add new message
        updatedMessages = [...chatMessages, messageWithValidTimestamp];
      }
      
      // Sort by timestamp
      updatedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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