import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import './Chat.css';

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [typing, setTyping] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch all users for conversation list
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

  // Fetch private messages with selected recipient
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

  // Subscribe to Pusher channel for real-time messaging
  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe('chat-room');

    // Listen for typing events
    channel.bind('typing', (data) => {
      if (data.sender === recipient) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000); // Remove typing indicator after 2 seconds
      }
    });

    // Listen for new messages
    channel.bind('new-message', (data) => {
      if (data.sender === recipient || data.recipient === recipient) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [recipient]);

  // Send a private message
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
      alert('Failed to send message.');
      console.error(err);
    }
  };

  const handleTyping = () => {
    axios.post(
      `${API_BASE_URL}/api/messages/typing`,
      { recipient },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
  };

  return (
    <div className="chat-container">
      <aside className="user-list">
        <h3>Conversations</h3>
        {users.map((username, index) => (
          <div
            key={index}
            className={`user ${username === recipient ? 'active' : ''}`}
            onClick={() => setRecipient(username)}
          >
            {username}
          </div>
        ))}
      </aside>

      <main className="chat-box">
        <h2>Chat with {recipient || '...'}</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === user.username ? 'sent' : 'received'}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>

        {typing && <div className="typing-indicator">{recipient} is typing...</div>}

        {recipient && (
          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              placeholder="Type your message..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleTyping();
              }}
              required
              className="input-message"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Chat;