import type { Chat } from '@/domain/chat';
import { generateAvatar } from '@/utils/avatarGenerator';

export async function getChats(): Promise<Chat[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockChats: Chat[] = [
    {
      id: 'chat-1',
      title: 'General Discussion',
      avatar: generateAvatar('General Discussion'),
      lastMessage: 'Hey everyone! How is the project going?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unreadCount: 2,
    },
    {
      id: 'chat-2',
      title: 'Team Alpha',
      avatar: generateAvatar('Team Alpha'),
      lastMessage: 'Meeting at 3 PM today',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      unreadCount: 0,
    },
    {
      id: 'chat-3',
      title: 'Bug Reports',
      avatar: generateAvatar('Bug Reports'),
      lastMessage: 'Found a critical issue in the auth flow',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      unreadCount: 5,
    },
    {
      id: 'chat-4',
      title: 'Design Team',
      avatar: generateAvatar('Design Team'),
      lastMessage: 'New mockups are ready for review',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 1,
    },
    {
      id: 'chat-5',
      title: 'Random Chat',
      avatar: generateAvatar('Random Chat'),
      lastMessage: 'Anyone up for lunch?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
    },
  ];

  return mockChats;
}