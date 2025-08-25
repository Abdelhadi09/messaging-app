import React, { useState } from 'react';

const MessageList = ({ messages, user, handleSeen, messagesEndRef }) => {
  const [previewImage, setPreviewImage] = useState(null); // State for image preview

function extractFileName(url) {
  const fullName = url.split('/').pop().split('?')[0]; // Get "a32fd198234e7957af81d0a21a94a480_nzpaxe.pdf"
  const baseName = fullName.replace(/\.[^/.]+$/, '');   // Remove extension
  const decodedName = decodeURIComponent(baseName); // Decode URL-encoded characters
  return decodedName;
}

function getFileIcon(fileType) {
  if (fileType.includes('image')) return '📄';
  if (fileType.includes('zip')) return '🗜️';
  if (fileType.includes('audio')) return '🎵';
 if (fileType.includes('video')) return '🎬';
  return '📁';
}


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

  {/* Render image preview */}
  {msg.fileUrl && msg.fileType.startsWith('image') && !msg.fileUrl.endsWith('.pdf')  && (
    <img
      src={msg.fileUrl}
      alt="attachment"
      className="attachment-thumbnail"
      onClick={() => setPreviewImage(msg.fileUrl)}
    />
  )}

  {/* Render PDF preview */}
  {msg.fileUrl && msg.fileUrl.endsWith('.pdf') && (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(msg.fileType)}</div>
      <div className="file-details">
        
        <a
          href={msg.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="file-download"
        >
         <span className="file-name">{extractFileName(msg.fileUrl)}</span>
        </a>
      </div>
    </div>

  )}

  {/* Render other file types as download links */}
{msg.fileUrl &&
  !msg.fileType.startsWith('image') &&
  !msg.fileUrl.toLowerCase().endsWith('.pdf') && (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(msg.fileType)}</div>
      <div className="file-details">
        
        <a
          href={msg.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="file-download"
        >
          <span className="file-name">{extractFileName(msg.fileUrl)}</span>
        </a>
      </div>
    </div>
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
