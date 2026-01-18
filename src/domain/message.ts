export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  chatId: string;
  content: string;
  sender: string;
  timestamp: Date;
  status: MessageStatus;
}

export interface OptimisticMessage extends Omit<Message, 'id' | 'status'> {
  id: string;
  status: 'sending';
}

export function createOptimisticMessage(
  chatId: string,
  content: string,
  sender: string
): OptimisticMessage {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    chatId,
    content,
    sender,
    timestamp: new Date(),
    status: 'sending',
  };
}