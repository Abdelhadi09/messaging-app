import React from 'react';

const MessageList = ({ messages, user, handleSeen, messagesEndRef }) => {
  return (
    <div className="messages">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === user.username ? 'sent' : 'received'}`}
          onMouseEnter={() => {
            if (msg.sender !== user.username) handleSeen(msg._id);
          }}
        >
          <div className="message-content">{msg.content}</div>
          <div className="timestamp">
            {new Date(msg.timestamp).toLocaleTimeString()}
            {msg.sender === user.username && msg.seen && <span className="status">✔✔</span>}
            {msg.sender === user.username && msg.delivered && !msg.seen && <span className="status">✔</span>}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} /> {/* Scroll reference */}
    </div>
  );
};

export default MessageList;
