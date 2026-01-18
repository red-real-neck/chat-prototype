export interface Chat {
  id: string;
  title: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface ChatPreview {
  id: string;
  title: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}