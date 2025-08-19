import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css'; // Import CSS for styling

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');

  // Use environment variable for backend URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/messages`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMessages();
  }, [user, API_BASE_URL]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/messages`,
        { content, recipient },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages([...messages, response.data]);
      setContent('');
      setRecipient('');
    } catch (error) {
      alert('Failed to send message!');
      console.error(error);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chat</h2>
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender} to {msg.recipient}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          placeholder="Recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
          className="input-recipient"
        />
        <input
          type="text"
          placeholder="Message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="input-message"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default Chat;