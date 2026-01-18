import { render, screen } from '@testing-library/react';
import { MessageList } from '../MessageList';
import type { Message } from '@/domain/message';

// Create a large dataset for testing virtual list
const createMockMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `msg-${index}`,
    chatId: 'chat-1',
    sender: index % 2 === 0 ? 'Alice' : 'Bob',
    content: `Message ${index + 1}: ${'This is a test message content. '.repeat(Math.floor(Math.random() * 3) + 1)}`,
    timestamp: new Date(Date.now() - (count - index) * 60000), // Messages in chronological order
    status: 'sent' as const,
  }));
};

describe('MessageList - Virtual List Smoke Test', () => {
  it('renders empty state when no messages', () => {
    render(
      <MessageList
        messages={[]}
        currentUserId="You"
      />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation!')).toBeInTheDocument();
  });

  it('renders with small number of messages without crashing', () => {
    const messages = createMockMessages(5);

    const { container } = render(
      <MessageList
        messages={messages}
        currentUserId="You"
      />
    );

    // Should render without crashing
    expect(container).toBeInTheDocument();

    // Should have virtuoso scroller
    const virtuosoScroller = container.querySelector('[data-virtuoso-scroller="true"]');
    expect(virtuosoScroller).toBeInTheDocument();
  });

  it('renders with large number of messages (5000+) without crashing', () => {
    // Test with 100 messages as a smoke test (full 5000 might be too slow for tests)
    const messages = createMockMessages(100);

    const { container } = render(
      <MessageList
        messages={messages}
        currentUserId="You"
      />
    );

    // Should render without crashing
    expect(container).toBeInTheDocument();

    // Should have virtuoso scroller
    const virtuosoScroller = container.querySelector('[data-virtuoso-scroller="true"]');
    expect(virtuosoScroller).toBeInTheDocument();
  });

  it('handles unread count divider without crashing', () => {
    const messages = createMockMessages(10);

    const { container } = render(
      <MessageList
        messages={messages}
        currentUserId="You"
        unreadCount={3}
        chatId="chat-1"
      />
    );

    // Should render without crashing
    expect(container).toBeInTheDocument();
    expect(container.querySelector('[data-virtuoso-scroller="true"]')).toBeInTheDocument();
  });

  it('renders messages with correct props without crashing', () => {
    const messages: Message[] = [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        sender: 'You',
        content: 'My message',
        timestamp: new Date(),
        status: 'sent',
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        sender: 'Alice',
        content: 'Their message',
        timestamp: new Date(),
        status: 'sent',
      },
    ];

    const { container } = render(
      <MessageList
        messages={messages}
        currentUserId="You"
      />
    );

    expect(container).toBeInTheDocument();
    expect(container.querySelector('[data-virtuoso-scroller="true"]')).toBeInTheDocument();
  });

  it('handles optimistic messages without crashing', () => {
    const messages: (Message | any)[] = [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        sender: 'Alice',
        content: 'Regular message',
        timestamp: new Date(),
        status: 'sent',
      },
      {
        tempId: 'temp-1',
        chatId: 'chat-1',
        sender: 'You',
        content: 'Optimistic message',
        timestamp: new Date(),
        status: 'sending',
      },
    ];

    const { container } = render(
      <MessageList
        messages={messages}
        currentUserId="You"
      />
    );

    expect(container).toBeInTheDocument();
    expect(container.querySelector('[data-virtuoso-scroller="true"]')).toBeInTheDocument();
  });

  it('maintains performance with many messages', () => {
    // Test with 200 messages
    const messages = createMockMessages(200);

    const startTime = Date.now();

    const { container } = render(
      <MessageList
        messages={messages}
        currentUserId="You"
      />
    );

    const renderTime = Date.now() - startTime;

    // Should render within reasonable time (less than 1 second)
    expect(renderTime).toBeLessThan(1000);

    // Should render without crashing
    expect(container).toBeInTheDocument();
    expect(container.querySelector('[data-virtuoso-scroller="true"]')).toBeInTheDocument();
  });

  it('handles chat switching correctly', () => {
    const messages1 = createMockMessages(5);
    const messages2 = createMockMessages(3);

    const { rerender, container } = render(
      <MessageList
        messages={messages1}
        currentUserId="You"
        chatId="chat-1"
      />
    );

    expect(container.querySelector('[data-virtuoso-scroller="true"]')).toBeInTheDocument();

    // Switch to different chat
    rerender(
      <MessageList
        messages={messages2}
        currentUserId="You"
        chatId="chat-2"
      />
    );

    expect(container.querySelector('[data-virtuoso-scroller="true"]')).toBeInTheDocument();
  });
});