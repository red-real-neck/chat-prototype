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

const mockUseChatsStore = useChatsStore as jest.MockedFunction<typeof useChatsStore>;
const mockUseMessagesStore = useMessagesStore as jest.MockedFunction<typeof useMessagesStore>;

describe('App - Send Message', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders message input when chat is active', () => {
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
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('disables input when no active chat', () => {
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

    const textarea = screen.getByPlaceholderText('Type a message...');
    const button = screen.getByRole('button', { name: 'Send' });

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('disables input when messages are loading', () => {
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
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: {},
      loadingByChatId: { 'chat-1': true },
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

    const textarea = screen.getByPlaceholderText('Type a message...');
    const button = screen.getByRole('button', { name: 'Send' });

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('allows typing in textarea when chat is active', async () => {
    const user = userEvent.setup();
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
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: jest.fn(),
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText('Type a message...');

    await user.type(textarea, 'Hello world');

    expect(textarea).toHaveValue('Hello world');
  });

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup();
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);
    const mockUpdateLastMessage = jest.fn();

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
      updateLastMessage: mockUpdateLastMessage,
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: mockSendMessage,
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const button = screen.getByRole('button', { name: 'Send' });

    await user.type(textarea, 'Hello world');
    await user.click(button);

    expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Hello world', 'You');
    expect(mockUpdateLastMessage).toHaveBeenCalledWith('chat-1', 'Hello world', expect.any(Date));
  });

  it('sends message when Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);
    const mockUpdateLastMessage = jest.fn();

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
      updateLastMessage: mockUpdateLastMessage,
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: mockSendMessage,
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText('Type a message...');

    await user.type(textarea, 'Hello world{enter}');

    expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Hello world', 'You');
    expect(mockUpdateLastMessage).toHaveBeenCalledWith('chat-1', 'Hello world', expect.any(Date));
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    const mockSendMessage = jest.fn();
    const mockUpdateLastMessage = jest.fn();

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
      updateLastMessage: mockUpdateLastMessage,
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: mockSendMessage,
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    const button = screen.getByRole('button', { name: 'Send' });

    await user.click(button);

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(mockUpdateLastMessage).not.toHaveBeenCalled();
  });

  it('does not send whitespace-only messages', async () => {
    const user = userEvent.setup();
    const mockSendMessage = jest.fn();
    const mockUpdateLastMessage = jest.fn();

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
      updateLastMessage: mockUpdateLastMessage,
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: mockSendMessage,
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const button = screen.getByRole('button', { name: 'Send' });

    await user.type(textarea, '   ');
    await user.click(button);

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(mockUpdateLastMessage).not.toHaveBeenCalled();
  });

  it('clears textarea after sending message', async () => {
    const user = userEvent.setup();
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);
    const mockUpdateLastMessage = jest.fn();

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
      updateLastMessage: mockUpdateLastMessage,
      updateChatWithIncomingMessage: jest.fn(),
      syncChatPreview: jest.fn(),
      markChatAsRead: jest.fn(),
    });

    mockUseMessagesStore.mockReturnValue({
      messagesByChatId: { 'chat-1': [] },
      loadingByChatId: {},
      loadedByChatId: { 'chat-1': true },
      loadMessages: jest.fn(),
      sendMessage: mockSendMessage,
      receiveSocketMessage: jest.fn(),
      addMessage: jest.fn(),
      addOptimisticMessage: jest.fn(),
      confirmOptimisticMessage: jest.fn(),
      removeOptimisticMessage: jest.fn(),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText('Type a message...');

    await user.type(textarea, 'Hello world');
    await user.keyboard('{enter}');

    expect(textarea).toHaveValue('');
  });
});