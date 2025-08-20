import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import './Chat.css';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageForm from './MessageForm';

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false); // 👈 Sidebar toggle


  const messagesEndRef = React.useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/users`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [user.token, API_BASE_URL]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipient) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/private/${recipient}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [recipient, user.token, API_BASE_URL]);

  // Pusher setup
  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('chat-room');

    channel.bind('typing', (data) => {
      if (data.sender === recipient) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    channel.bind('new-message', (data) => {
      if (data.sender === recipient || data.recipient === recipient) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    channel.bind('message-delivered', (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.messageId ? { ...msg, delivered: true } : msg
        )
      );
    });

    channel.bind('message-seen', (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.messageId ? { ...msg, seen: true } : msg
        )
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [recipient]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/messages`,
        { content, recipient },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Typing indicator
  const handleTyping = () => {
    axios.post(
      `${API_BASE_URL}/api/messages/typing`,
      { recipient },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/search`, {
        params: { query },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  // Update message status (delivered or seen)
  const updateMessageStatus = async (messageId, status) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/messages/status`,
        { messageId, status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error(`Error updating message status to ${status}:`, err);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.delivered) {
        updateMessageStatus(lastMessage._id, 'delivered');
      }
    }
  }, [messages]);

  const handleSeen = (messageId) => {
    updateMessageStatus(messageId, 'seen');
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Hamburger for mobile */}
      <button className="hamburger-btn" onClick={() => setShowSidebar(!showSidebar)}>
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar
        users={users}
        recipient={recipient}
        setRecipient={setRecipient}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        searchUsers={searchUsers}
      />

      {/* Chat box */}
      <main className="chat-box">
        <h2>Chat with {recipient || '...'}</h2>
        <MessageList
          messages={messages}
          user={user}
          handleSeen={handleSeen}
          messagesEndRef={messagesEndRef}
        />

        {typing && <div className="typing-indicator">{recipient} is typing...</div>}

        {recipient && (
          <MessageForm
            content={content}
            setContent={setContent}
            handleTyping={handleTyping}
            sendMessage={sendMessage}
          />
        )}
      </main>
    </div>
  );
};

export default Chat;