import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css'; // Import CSS for styling

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get('http://localhost:5000/api/messages', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(response.data);
    };
    fetchMessages();
  }, [user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        { content, recipient },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages([...messages, response.data]);
      setContent('');
      setRecipient('');
    } catch (error) {
      alert('Failed to send message!');
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
