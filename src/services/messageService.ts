import type { Message, MessageStatus } from '@/domain/message';

const MESSAGES_COUNT = 5000;
const SENDERS = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];

const MESSAGE_TEMPLATES = [
  'Hello everyone!',
  'How are you doing?',
  'Thanks for the update',
  'I think we should discuss this further',
  'Great work on that feature',
  'I have a question about the implementation',
  'Let me check that and get back to you',
  'Sounds good to me',
  'Can you provide more details?',
  'I agree with your approach',
  'That makes sense',
  'Let me look into this',
  'Good catch!',
  'I was thinking the same thing',
  'Perfect timing',
  'Thanks for bringing this up',
  'I\'ll take care of it',
  'Let me review the code',
  'Excellent suggestion',
  'I\'m on it',
  'Well done!',
  'Let\'s schedule a meeting',
  'I have some thoughts on this',
  'Great progress!',
  'I\'ll update the documentation',
  'That\'s a good point',
  'Let me test this',
  'Perfect!',
  'I\'ll check with the team',
  'Thanks for your help',
];

function generateRandomMessage(chatId: string, index: number): Message {
  const sender = SENDERS[Math.floor(Math.random() * SENDERS.length)];
  const template = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];

  // Generate timestamp: older messages first, newer messages later
  // Spread messages over the last 30 days
  const daysAgo = Math.floor((MESSAGES_COUNT - index - 1) / (MESSAGES_COUNT / 30));
  
  const timestamp = new Date();
  const now = new Date();
  
  // Set date first
  timestamp.setDate(now.getDate() - daysAgo);

  // For today (daysAgo === 0), ensure we don't generate future time
  if (daysAgo === 0) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Generate random hour up to current hour
    const hoursVariation = Math.floor(Math.random() * (currentHour + 1));
    
    // If we picked the current hour, limit minutes to current minute
    const maxMinutes = (hoursVariation === currentHour) ? currentMinute + 1 : 60;
    const minutesVariation = Math.floor(Math.random() * maxMinutes);
    
    timestamp.setHours(hoursVariation, minutesVariation, 0, 0);
  } else {
    // For past days, any time is fine
    const hoursVariation = Math.floor(Math.random() * 24);
    const minutesVariation = Math.floor(Math.random() * 60);
    timestamp.setHours(hoursVariation, minutesVariation, 0, 0);
  }

  // Random status with 'sent' being most common
  const statusWeights = ['sent', 'sent', 'sent', 'delivered', 'read'] as const;
  const status: MessageStatus = statusWeights[Math.floor(Math.random() * statusWeights.length)];

  return {
    id: `msg-${chatId}-${index}`,
    chatId,
    content: template,
    sender,
    timestamp,
    status,
  };
}

export async function getMessages(chatId: string): Promise<Message[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const messages: Message[] = [];

  for (let i = 0; i < MESSAGES_COUNT; i++) {
    messages.push(generateRandomMessage(chatId, i));
  }

  // Sort by timestamp (oldest first)
  messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return messages;
}

export async function sendMessage(
  chatId: string,
  content: string,
  sender: string
): Promise<Message> {
  // Simulate API delay for sending (1-2 seconds)
  const delay = 1000 + Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Generate a new message with real ID
  const realId = `msg-${chatId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Ensure timestamp is not in the future
  // Use the time when the function was called (before delay), not after
  const timestamp = new Date(Date.now() - delay);

  const message: Message = {
    id: realId,
    chatId,
    content,
    sender,
    timestamp,
    status: 'sent',
  };

  return message;
}