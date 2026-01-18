import { render } from '@testing-library/react';
import App from '../../App';
import type { Message } from '@/domain/message';

// Mock the stores
jest.mock('@/store/chatsStore', () => ({
  useChatsStore: jest.fn(),
}));

jest.mock('@/store/messagesStore', () => ({
  useMessagesStore: jest.fn(),
}));

// Mock the socket service
jest.mock('@/services/mockSocket', () => ({
  mockSocket: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

import { useChatsStore } from '@/store/chatsStore';
import { useMessagesStore } from '@/store/messagesStore';
import { mockSocket } from '@/services/mockSocket';

const mockUseChatsStore = useChatsStore as jest.MockedFunction<typeof useChatsStore>;
const mockUseMessagesStore = useMessagesStore as jest.MockedFunction<typeof useMessagesStore>;

describe('App - Receive Socket Messages', () => {
  let mockSubscribeCallback: (message: Message) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    // Capture the subscribe callback so we can simulate socket messages
    (mockSocket.subscribe as jest.Mock).mockImplementation((callback) => {
      mockSubscribeCallback = callback;
    });
  });

  it('receives and displays socket message for active chat', async () => {
    const mockReceiveSocketMessage = jest.fn();
    const mockUpdateChatWithIncomingMessage = jest.fn();

    const mockChat = {
      id: 'chat-1',
      title: 'Alice Johnson',
      lastMessage: 'Hey, how are you?',
      lastMessageAt: new Date('2024-01-19T10:30:00'),
      unreadCount: 2,
    };

    mockUseChatsStore.mockReturnValue({
      chats: [mockChat],
      activeChatId: 'chat-1',
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: jest.fn(),
      setActiveChat: jest.fn(),
      updateLastMessage: jest.fn(),
      updateChatWithIncomingMessage: mockUpdateChatWithIncomingMessage,
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: mockReceiveSocketMessage,
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    // Simulate receiving a socket message for the active chat
    const incomingMessage: Message = {
      id: 'msg-1',
      chatId: 'chat-1',
      sender: 'Alice',
      content: 'Hello from socket!',
      timestamp: new Date('2024-01-19T11:00:00'),
      status: 'sent',
    };

    // Trigger the socket callback
    mockSubscribeCallback(incomingMessage);

    // For active chat, should call receiveSocketMessage (adds to messages)
    // but NOT updateChatWithIncomingMessage (since preview syncs from messages)
    expect(mockReceiveSocketMessage).toHaveBeenCalledWith(incomingMessage);
    expect(mockUpdateChatWithIncomingMessage).not.toHaveBeenCalled();
  });

  it('receives socket message for inactive chat and updates preview', async () => {
    const mockReceiveSocketMessage = jest.fn();
    const mockUpdateChatWithIncomingMessage = jest.fn();

    const mockChats = [
      {
        id: 'chat-1',
        title: 'Alice Johnson',
        lastMessage: 'Hey, how are you?',
        lastMessageAt: new Date('2024-01-19T10:30:00'),
        unreadCount: 2,
      },
      {
        id: 'chat-2',
        title: 'Bob Smith',
        lastMessage: 'Thanks for the help!',
        lastMessageAt: new Date('2024-01-19T09:15:00'),
        unreadCount: 0,
      },
    ];

    mockUseChatsStore.mockReturnValue({
      chats: mockChats,
      activeChatId: 'chat-1', // chat-2 is inactive
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: jest.fn(),
      setActiveChat: jest.fn(),
      updateLastMessage: jest.fn(),
      updateChatWithIncomingMessage: mockUpdateChatWithIncomingMessage,
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: {
        'chat-1': [],
        'chat-2': [],
      },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true, 'chat-2': true },
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: mockReceiveSocketMessage,
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    // Simulate receiving a socket message for the inactive chat
    const incomingMessage: Message = {
      id: 'msg-2',
      chatId: 'chat-2',
      sender: 'Bob',
      content: 'Message for inactive chat',
      timestamp: new Date('2024-01-19T11:00:00'),
      status: 'sent',
    };

    // Trigger the socket callback
    mockSubscribeCallback(incomingMessage);

    // For inactive chat, should call both receiveSocketMessage and updateChatWithIncomingMessage
    expect(mockReceiveSocketMessage).toHaveBeenCalledWith(incomingMessage);
    expect(mockUpdateChatWithIncomingMessage).toHaveBeenCalledWith(
      'chat-2',
      'Message for inactive chat',
      new Date('2024-01-19T11:00:00')
    );
  });

  it('handles socket messages when no chat is active', async () => {
    const mockReceiveSocketMessage = jest.fn();
    const mockUpdateChatWithIncomingMessage = jest.fn();

    const mockChats = [
      {
        id: 'chat-1',
        title: 'Alice Johnson',
        lastMessage: 'Hey, how are you?',
        lastMessageAt: new Date('2024-01-19T10:30:00'),
        unreadCount: 2,
      },
    ];

    mockUseChatsStore.mockReturnValue({
      chats: mockChats,
      activeChatId: null, // No active chat
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: jest.fn(),
      setActiveChat: jest.fn(),
      updateLastMessage: jest.fn(),
      updateChatWithIncomingMessage: mockUpdateChatWithIncomingMessage,
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: {},
      loadingByChatId: {},
      loadedByChatId: {},
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: mockReceiveSocketMessage,
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    // Simulate receiving a socket message
    const incomingMessage: Message = {
      id: 'msg-1',
      chatId: 'chat-1',
      sender: 'Alice',
      content: 'Hello when no chat active!',
      timestamp: new Date('2024-01-19T11:00:00'),
      status: 'sent',
    };

    // Trigger the socket callback
    mockSubscribeCallback(incomingMessage);

    // Since no chat is active, should call both (message gets added, preview gets updated)
    expect(mockReceiveSocketMessage).toHaveBeenCalledWith(incomingMessage);
    expect(mockUpdateChatWithIncomingMessage).toHaveBeenCalledWith(
      'chat-1',
      'Hello when no chat active!',
      new Date('2024-01-19T11:00:00')
    );
  });

  it('handles rapid socket messages correctly', async () => {
    const mockReceiveSocketMessage = jest.fn();
    const mockUpdateChatWithIncomingMessage = jest.fn();

    const mockChat = {
      id: 'chat-1',
      title: 'Alice Johnson',
      lastMessage: 'Hey, how are you?',
      lastMessageAt: new Date('2024-01-19T10:30:00'),
      unreadCount: 2,
    };

    mockUseChatsStore.mockReturnValue({
      chats: [mockChat],
      activeChatId: 'chat-1',
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: jest.fn(),
      setActiveChat: jest.fn(),
      updateLastMessage: jest.fn(),
      updateChatWithIncomingMessage: mockUpdateChatWithIncomingMessage,
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: mockReceiveSocketMessage,
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    // Simulate receiving multiple rapid socket messages
    const messages: Message[] = [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        sender: 'Alice',
        content: 'First message',
        timestamp: new Date('2024-01-19T11:00:00'),
        status: 'sent',
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        sender: 'Alice',
        content: 'Second message',
        timestamp: new Date('2024-01-19T11:00:01'),
        status: 'sent',
      },
      {
        id: 'msg-3',
        chatId: 'chat-1',
        sender: 'Alice',
        content: 'Third message',
        timestamp: new Date('2024-01-19T11:00:02'),
        status: 'sent',
      },
    ];

    // Trigger all socket callbacks
    messages.forEach(message => mockSubscribeCallback(message));

    // Should handle all messages
    expect(mockReceiveSocketMessage).toHaveBeenCalledTimes(3);
    expect(mockReceiveSocketMessage).toHaveBeenCalledWith(messages[0]);
    expect(mockReceiveSocketMessage).toHaveBeenCalledWith(messages[1]);
    expect(mockReceiveSocketMessage).toHaveBeenCalledWith(messages[2]);

    // Should not call updateChatWithIncomingMessage for active chat
    expect(mockUpdateChatWithIncomingMessage).not.toHaveBeenCalled();
  });

  it('subscribes to socket on mount and unsubscribes on unmount', () => {
    const mockSubscribe = jest.fn();
    const mockUnsubscribe = jest.fn();

    (mockSocket.subscribe as jest.Mock).mockImplementation(mockSubscribe);
    (mockSocket.unsubscribe as jest.Mock).mockImplementation(mockUnsubscribe);

    mockUseChatsStore.mockReturnValue({
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: jest.fn(),
      setActiveChat: jest.fn(),
      updateLastMessage: jest.fn(),
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: {},
      loadingByChatId: {},
      loadedByChatId: {},
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    const { unmount } = render(<App />);

    expect(mockSubscribe).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

});