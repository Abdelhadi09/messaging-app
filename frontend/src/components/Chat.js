import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import uploadIcon from '../images/image (2).png';
import Profile from './Profile';
import RecipientProfile from './RecipientProfile';

const Chat = ({ user , setUser }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth <= 768); // Default to true for mobile
  const [file, setFile] = useState(null);
  const [recipientDetails, setRecipientDetails] = useState({ username: '', profilePic: '' });
  const [showRecipientProfile, setShowRecipientProfile] = useState(false);

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
        console.log('Fetched messages:', res.data);
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

  // Handle sending messages and file uploads
  const handleSend = async (e) => {
    e.preventDefault();
    try {
      if (content.trim()) {
        // Send the message to /api/messages
        const messageRes = await axios.post(
          `${API_BASE_URL}/api/messages`,
          { content, recipient },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setMessages((prev) => [...prev, messageRes.data]);
        setContent(''); // Reset message input
      }

      if (file) {
        // Send the file to /upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('recipient', recipient);

        const fileRes = await axios.post(`${API_BASE_URL}/api/messages/upload`, formData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        setMessages((prevMessages) => [...prevMessages, fileRes.data.data]);
        setFile(null); // Reset file input
      }
    } catch (err) {
      console.error('Failed to send message or upload file:', err);
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

  // Fetch recipient details when the recipient changes
  useEffect(() => {
    const fetchRecipientDetails = async () => {
      if (!recipient) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/users/${recipient}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRecipientDetails({
          username: res.data.username,
          profilePic: res.data.profilePic || 'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg',
          bio: res.data.bio || 'No bio available',
        });
      } catch (err) {
        console.error('Error fetching recipient details:', err);
      }
    };

    fetchRecipientDetails();
  }, [recipient, user.token, API_BASE_URL]);

  // Adjust sidebar visibility on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowSidebar(false); // Hide sidebar for desktop
      } else {
        setShowSidebar(true); // Show sidebar for mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="chat-container">
          <Sidebar
            navigate={navigate}
            user={user}
            users={users}
            recipient={recipient}
            setRecipient={setRecipient}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searchUsers={searchUsers}
            setUser={setUser}
          />

          <main className="chat-box">
            <div className="profile-section">
              <button onClick={() => setShowSidebar(!showSidebar)} className="toggle-sidebar-btn">&larr;</button>  
             <div className="profile-section" onClick={() => setShowRecipientProfile(true)}>
              <img
                src={
                  recipientDetails.profilePic ||
                  'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'
                }
                alt="Profile"
                className="profile-pic-small"
              />
              <h2>{recipientDetails.username || '...'}</h2>
              </div>
            </div>
            <MessageList
              messages={messages}
              user={user}
              handleSeen={handleSeen}
              messagesEndRef={messagesEndRef}
            />

            {typing && <div className="typing-indicator">{recipientDetails.username} is typing...</div>}
    

           
            <form onSubmit={handleSend} className='message-form'>
              <input
              className='input-message'
                type="text"
                value={content}
                onChange={(e) =>{ 
                  setContent(e.target.value) ;
                   handleTyping()}}
                placeholder="Type a message..."
              />
              <label htmlFor="file-upload" className="file-upload-label">
            <img src={uploadIcon} alt="Upload" className="upload-icon" />
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="input-file"
            style={{ display: 'none' }}
          />
              <button type="submit" className='send-button'>Send</button>
            </form>
          </main>
      {showRecipientProfile && (
          <RecipientProfile
            recipient={recipientDetails}
            onClose={() => setShowRecipientProfile(false)}
          />
        )}
    </div>
  );
};

export default Chat;