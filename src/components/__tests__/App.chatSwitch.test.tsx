import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

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

describe('App - Chat Switching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads chats on mount', () => {
    const mockLoadChats = jest.fn();

    mockUseChatsStore.mockReturnValue({
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: mockLoadChats,
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

    render(<App />);

    expect(mockLoadChats).toHaveBeenCalledTimes(1);
  });

  it('displays loading state for chats', () => {
    mockUseChatsStore.mockReturnValue({
      chats: [],
      activeChatId: null,
      isLoading: true,
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

    render(<App />);

    expect(screen.getByText('Chats')).toBeInTheDocument();
    // Should show loading skeletons in chat list
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error state when chats fail to load', () => {
    mockUseChatsStore.mockReturnValue({
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: 'Network error',
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

    render(<App />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Failed to load chats')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('displays empty state when no chats available', () => {
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

    render(<App />);

    // Look for the chat list empty state specifically
    const chatList = screen.getByText('Chats').closest('.w-80');
    expect(chatList).toHaveTextContent('💬');
    expect(chatList).toHaveTextContent('No chats available');
  });

  it('renders chats and allows switching between them', async () => {
    const user = userEvent.setup();
    const mockSetActiveChat = jest.fn();

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
      activeChatId: null,
      isLoading: false,
      error: null,
      lastReadMessageIdByChatId: {},
      loadChats: jest.fn(),
      setActiveChat: mockSetActiveChat,
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

    render(<App />);

    // Check that both chats are displayed
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();

    // Initially no chat is active
    expect(mockSetActiveChat).not.toHaveBeenCalled();

    // Click on first chat
    await user.click(screen.getByText('Alice Johnson'));

    expect(mockSetActiveChat).toHaveBeenCalledWith('chat-1');
    expect(mockSetActiveChat).toHaveBeenCalledTimes(1);
  });

  it('loads messages when active chat changes', () => {
    const mockLoadMessages = jest.fn();

    mockUseChatsStore.mockReturnValue({
      chats: [{
        id: 'chat-1',
        title: 'Alice Johnson',
        lastMessage: 'Hey, how are you?',
        lastMessageAt: new Date('2024-01-19T10:30:00'),
        unreadCount: 2,
      }],
      activeChatId: 'chat-1',
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
      loadMessages: mockLoadMessages,
      sendMessage: jest.fn(),
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    expect(mockLoadMessages).toHaveBeenCalledWith('chat-1');
  });

  it('subscribes and unsubscribes to socket on mount/unmount', () => {
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