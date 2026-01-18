import { AppLayout, ChatList, ChatWindow, MessageInput } from '@/components';

function App() {
  // Placeholder data for layout demonstration
  const mockChats = [
    {
      id: '1',
      title: 'Alice Johnson',
      lastMessage: 'Hey, how are you?',
      lastMessageAt: new Date(),
      unreadCount: 2,
    },
    {
      id: '2',
      title: 'Bob Smith',
      lastMessage: 'Thanks for the help!',
      lastMessageAt: new Date(Date.now() - 3600000), // 1 hour ago
      unreadCount: 0,
    },
  ];

  const activeChatId = '1';
  const activeChat = mockChats.find(chat => chat.id === activeChatId);

  return (
    <AppLayout>
      <ChatList>
        {mockChats.map((chat) => (
          <div key={chat.id} className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">{chat.title}</h3>
            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
          </div>
        ))}
      </ChatList>

      <ChatWindow chatTitle={activeChat?.title}>
        {/* Messages area placeholder */}
        <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">💬</div>
            <p>Messages will appear here</p>
            <p className="text-sm">Select a chat to start messaging</p>
          </div>
        </div>

        {/* Message input */}
        <MessageInput
          onSendMessage={(message) => console.log('Send message:', message)}
        />
      </ChatWindow>
    </AppLayout>
  )
}

export default App
