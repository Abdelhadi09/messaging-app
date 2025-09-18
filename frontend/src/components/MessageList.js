import React, { useState } from 'react';
import './MessageList.css';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MessageList = ({ messages, user, handleSeen, messagesEndRef }) => {
  const [previewImage, setPreviewImage] = useState(null); // State for image preview
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  const [showReactions, setShowReactions] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});

// Fetch reactions for all messages (optional, can be optimized)
React.useEffect(() => {
  async function fetchReactions() {
    const reactionsMap = {};
    for (const msg of messages) {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reactions/${msg._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        reactionsMap[msg._id] = res.data;
      } catch {}
    }
    setMessageReactions(reactionsMap);
  }
  if (messages.length) fetchReactions();
}, [messages, user.token]);

const handleReaction = async (messageId, reaction) => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/reactions`,
      {
        messageId,
        reaction,
        role: user.username === messages.find(m => m._id === messageId)?.sender ? 'sender' : 'recipient'
      },
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );
    // Optionally update local state
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...(prev[messageId] || {}),
        [user.username === messages.find(m => m._id === messageId)?.sender ? 'senderReaction' : 'recipientReaction']: reaction
      }
    }));
  } catch (err) {
    console.error('Error sending reaction', err);
  }
};

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
const handleDelete = (messageId) => deleteMessage(messageId);
 const deleteMessage = async (messageId) => {
  console.log("Deleting message with ID:", messageId);
  try {
    await axios.delete(
      `${API_BASE_URL}/api/messages/${messageId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );
  } catch (err) {
    console.error("Error deleting message");
  }
};
  return (
    <div className="messages">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === user.username ? 'sent' : 'received'}`}
          onMouseEnter={() => {
            if (msg.sender !== user.username) handleSeen(msg._id);
          }}
          onClick={() => { setShowReactions(!showReactions); }}
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
          {showReactions && (
            <div className="reactions">
              {reactions.map((reaction, idx) => (
                <span
                  key={idx}
                  className="reaction"
                  onClick={() => {
                    handleReaction(msg._id, reaction);
                    setShowReactions(false);
                  }}
                >
                  {reaction}
                </span>
              ))}
               <button className="delete-button" onClick={() => handleDelete(msg._id)}>🗑️</button>
            </div>
            
          )}
          {/* Show current reactions below each message */}
{messageReactions[msg._id] && (
  <div className="current-reactions">
    {messageReactions[msg._id].senderReaction && <span>Sender: {messageReactions[msg._id].senderReaction}</span>}
    {messageReactions[msg._id].recipientReaction && <span>Recipient: {messageReactions[msg._id].recipientReaction}</span>}
  </div>
)}
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
