import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatList } from '../ChatList';
import { ChatListItem } from '../ChatListItem';
import type { ChatPreview } from '@/domain/chat';
import { generateAvatar } from '@/utils/avatarGenerator';

// Mock data for testing
const mockChats: ChatPreview[] = [
  {
    id: 'chat-1',
    title: 'Alice Johnson',
    avatar: generateAvatar('Alice Johnson'),
    lastMessage: 'Hey, how are you?',
    lastMessageAt: new Date('2024-01-19T10:30:00'),
    unreadCount: 2,
  },
  {
    id: 'chat-2',
    title: 'Bob Smith',
    avatar: generateAvatar('Bob Smith'),
    lastMessage: 'Thanks for the help!',
    lastMessageAt: new Date('2024-01-19T09:15:00'),
    unreadCount: 0,
  },
];

describe('ChatList', () => {
  it('renders chat list with multiple chat items', () => {
    const mockOnChatClick = jest.fn();

    render(
      <ChatList>
        {mockChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={false}
            onClick={() => mockOnChatClick(chat.id)}
          />
        ))}
      </ChatList>
    );

    // Check that chat titles are displayed
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();

    // Check that last messages are displayed
    expect(screen.getByText('Hey, how are you?')).toBeInTheDocument();
    expect(screen.getByText('Thanks for the help!')).toBeInTheDocument();

    // Check that unread count is displayed for chat with unread messages
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check that header is present
    expect(screen.getByText('Chats')).toBeInTheDocument();
  });

  it('displays active chat with different styling', () => {
    const mockOnChatClick = jest.fn();

    render(
      <ChatList>
        {mockChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === 'chat-1'}
            onClick={() => mockOnChatClick(chat.id)}
          />
        ))}
      </ChatList>
    );

    // The active chat should have different styling, but we test that both are rendered
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('handles chat click events', async () => {
    const user = userEvent.setup();
    const mockOnChatClick = jest.fn();

    render(
      <ChatList>
        {mockChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={false}
            onClick={() => mockOnChatClick(chat.id)}
          />
        ))}
      </ChatList>
    );

    // Click on first chat
    await user.click(screen.getByText('Alice Johnson'));

    expect(mockOnChatClick).toHaveBeenCalledWith('chat-1');
    expect(mockOnChatClick).toHaveBeenCalledTimes(1);
  });

  it('displays time in correct format', () => {
    const mockOnChatClick = jest.fn();

    render(
      <ChatList>
        <ChatListItem
          chat={mockChats[0]}
          isActive={false}
          onClick={() => mockOnChatClick('chat-1')}
        />
      </ChatList>
    );

    // Should display time in HH:MM format
    expect(screen.getByText('10:30 AM')).toBeInTheDocument();
  });

  it('renders empty chat list', () => {
    render(
      <ChatList>
        {null}
      </ChatList>
    );

    // Should still render the header
    expect(screen.getByText('Chats')).toBeInTheDocument();

    // Should not have any chat items
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});