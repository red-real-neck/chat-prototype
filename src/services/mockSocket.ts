import type { Message } from '@/domain/message';
import { createOptimisticMessage } from '@/domain/message';

type MessageCallback = (message: Message) => void;

const CHAT_IDS = ['chat-1', 'chat-2', 'chat-3', 'chat-4', 'chat-5'];
const SENDERS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];

const INCOMING_MESSAGE_TEMPLATES = [
  'Just wanted to check in',
  'Any updates on this?',
  'I\'m working on it now',
  'Should be ready soon',
  'Let me know if you need anything',
  'Got it, thanks!',
  'That\'s interesting',
  'I hadn\'t thought of that',
  'Good idea',
  'I\'ll look into it',
  'Makes sense to me',
  'Let\'s do that',
  'I\'m in',
  'Sounds like a plan',
  'Perfect timing',
  'Thanks for the heads up',
  'Appreciate it',
  'Will do',
  'Got your back',
  'Let\'s connect later',
];

class MockWebSocket {
  private callback: MessageCallback | null = null;
  private intervalId: number | null = null;
  private isConnected = false;

  subscribe(callback: MessageCallback): void {
    if (this.isConnected) {
      this.unsubscribe();
    }

    this.callback = callback;
    this.isConnected = true;

    // Start sending messages every 2-5 seconds
    this.startMessageInterval();
  }

  unsubscribe(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callback = null;
    this.isConnected = false;
  }

  private startMessageInterval(): void {
    const sendMessage = () => {
      if (!this.callback || !this.isConnected) return;

      const randomChatId = CHAT_IDS[Math.floor(Math.random() * CHAT_IDS.length)];
      const randomSender = SENDERS[Math.floor(Math.random() * SENDERS.length)];
      const randomTemplate = INCOMING_MESSAGE_TEMPLATES[Math.floor(Math.random() * INCOMING_MESSAGE_TEMPLATES.length)];

      // Create timestamp that is not in the future
      // Use current time, but ensure it's not later than now
      const now = new Date();
      const timestamp = new Date(Math.min(now.getTime(), Date.now()));

      // Create message with controlled timestamp
      const message: Message = {
        id: `msg-${randomChatId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatId: randomChatId,
        content: randomTemplate,
        sender: randomSender,
        timestamp,
        status: 'sent',
      };

      this.callback(message);
    };

    // Initial delay before first message (1-3 seconds)
    setTimeout(() => {
      sendMessage();

      // Then send messages every 2-5 seconds
      this.intervalId = setInterval(() => {
        sendMessage();
      }, 2000 + Math.random() * 3000); // 2-5 seconds
    }, 1000 + Math.random() * 2000); // 1-3 seconds initial delay
  }
}

// Singleton instance
export const mockSocket = new MockWebSocket();