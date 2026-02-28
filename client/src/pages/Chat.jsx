import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getPusherInstance, releasePusherInstance, subscribeToChannel, unsubscribeFromChannel } from '../services/pusher';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  const userId = user?.id || user?._id;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatAPI.getConversations();
      setConversations(data);
      return data;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    try {
      const data = await chatAPI.getMessages(conversationId);
      setMessages(data);
      // Mark as read
      await chatAPI.markAsRead(conversationId);
      // Update unread count in conversations list
      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  // Initialize conversations and handle URL params
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const conversationsList = await loadConversations();
      
      // Check if we need to open a specific conversation (from notification click)
      const conversationId = searchParams.get('conversation');
      if (conversationId && conversationsList) {
        const existingConv = conversationsList.find(c => c._id === conversationId);
        if (existingConv) {
          setSelectedConversation(existingConv);
          await loadMessages(conversationId);
        }
      }
      // Or start a conversation with a specific user
      else {
        const startWithUserId = searchParams.get('user');
        if (startWithUserId) {
          try {
            const conversation = await chatAPI.startConversation(startWithUserId);
            setSelectedConversation(conversation);
            await loadMessages(conversation._id);
          } catch (error) {
            console.error('Failed to start conversation:', error);
          }
        }
      }
      
      setLoading(false);
    };
    init();
  }, [loadConversations, loadMessages, searchParams]);

  // Setup Pusher for real-time messages
  useEffect(() => {
    if (!selectedConversation || !userId) return;

    // Get shared Pusher instance
    getPusherInstance();
    
    const channelName = `chat-${selectedConversation._id}`;
    console.log('Subscribing to chat channel:', channelName);
    const channel = subscribeToChannel(channelName);
    
    channel.bind('new-message', (data) => {
      console.log('Received new message via Pusher:', data);
      console.log('Message sender ID:', data.message?.sender?._id);
      console.log('Current user ID:', userId);
      
      // Check if message is from another user
      const senderId = data.message?.sender?._id || data.message?.sender;
      if (senderId !== userId && senderId?.toString() !== userId?.toString()) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('Unsubscribing from chat channel:', channelName);
      channel.unbind_all();
      unsubscribeFromChannel(channelName);
      releasePusherInstance();
    };
  }, [selectedConversation, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle selecting a conversation
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation._id);
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const message = await chatAPI.sendMessage(selectedConversation._id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(c =>
          c._id === selectedConversation._id
            ? { ...c, lastMessage: message, lastMessageAt: new Date() }
            : c
        );
        // Move to top
        const selected = updated.find(c => c._id === selectedConversation._id);
        const others = updated.filter(c => c._id !== selectedConversation._id);
        return selected ? [selected, ...others] : others;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString();
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(c =>
    c && (c.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    !searchQuery.trim())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="finder-theme min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 h-[calc(100vh-64px)] flex">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r border-[#E2E8F0] flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-semibold text-[#1E293B] mb-3">Messages</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 focus:border-[#1152d4]"
              />
              <svg className="w-5 h-5 text-[#64748B] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-[#64748B] text-sm">No conversations yet</p>
                <p className="text-[#64748B]/70 text-xs mt-1">Start chatting from an application</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-[#E2E8F0]/50 cursor-pointer hover:bg-[#F8FAFC] transition ${
                    selectedConversation?._id === conversation._id ? 'bg-[#EBF1FF] border-l-4 border-l-[#1152d4]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {conversation.otherUser?.avatar ? (
                      <img src={conversation.otherUser.avatar} alt="" className="w-12 h-12 rounded-full shrink-0 object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#1152d4] to-[#0d42a8] flex items-center justify-center text-white font-semibold text-lg shrink-0">
                        {conversation.otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#1E293B] truncate">
                          {conversation.otherUser?.displayName || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-[#64748B]">
                          {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B] truncate mt-0.5">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    
                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <span className="bg-[#1152d4] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-4">
                {selectedConversation.otherUser?.avatar ? (
                  <img src={selectedConversation.otherUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1152d4] to-[#0d42a8] flex items-center justify-center text-white font-semibold">
                    {selectedConversation.otherUser?.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1E293B]">
                    {selectedConversation.otherUser?.displayName || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    {selectedConversation.otherUser?.email}
                  </p>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-full transition"
                  title="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-[#64748B]">No messages yet</p>
                    <p className="text-[#64748B]/70 text-sm mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.sender._id === userId;
                    const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          {showAvatar && !isOwn && (
                            message.sender.avatar ? (
                              <img src={message.sender.avatar} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#1152d4] to-[#0d42a8] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                {message.sender.displayName?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )
                          )}
                          {!showAvatar && !isOwn && <div className="w-8" />}
                          
                          {/* Message Bubble */}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-[#1152d4] text-white rounded-br-md'
                                : 'bg-white text-[#1E293B] rounded-bl-md shadow-sm border border-[#E2E8F0]'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-[#64748B]'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-[#E2E8F0] bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-[#E2E8F0] rounded-full focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 focus:border-[#1152d4]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-3 bg-[#1152d4] text-white rounded-full hover:bg-[#0d42a8] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {sendingMessage ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#EBF1FF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-2">Your Messages</h3>
                <p className="text-[#64748B] max-w-sm">
                  Select a conversation from the sidebar to start chatting, or message someone from their application.
                </p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

