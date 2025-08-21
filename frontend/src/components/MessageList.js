import React, { useState } from 'react';

const MessageList = ({ messages, user, handleSeen, messagesEndRef }) => {
  const [previewImage, setPreviewImage] = useState(null); // State for image preview

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
          <div className="message-content">
            {msg.content}
            {msg.fileUrl && msg.fileType.startsWith('image') && (
              <img
                src={msg.fileUrl}
                alt="attachment"
                className="attachment-thumbnail"
                onClick={() => setPreviewImage(msg.fileUrl)}
              />
            )}
            {msg.fileUrl && !msg.fileType.startsWith('image') && (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="attachment-link">
                Download File
              </a>
            )}
          </div>
          <div className="timestamp">
            {new Date(msg.timestamp).toLocaleTimeString()}
            {msg.sender === user.username && msg.seen && <span className="status">✔✔</span>}
            {msg.sender === user.username && msg.delivered && !msg.seen && <span className="status">✔</span>}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} /> {/* Scroll reference */}

      {/* Modal for image preview */}
      {previewImage && (
        <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="preview-image" />
        </div>
      )}
    </div>
  );
};

export default MessageList;
