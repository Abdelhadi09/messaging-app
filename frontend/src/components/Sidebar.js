import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import './Sidebar.css';
import Profile from './Profile';

const Sidebar = ({
  user,
  users,
  recipient,
  setRecipient,
  showSidebar,
  setShowSidebar,
  searchQuery,
  setSearchQuery,
  searchResults,
  searchUsers,
  setUser,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]); // State for online users
  const [lastMessages, setLastMessages] = useState({});


  const getOnlineUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/online-users`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      setOnlineUsers(data.onlineUsers);
    } catch (err) {
      console.error('Error fetching online users:', err);
    } 
  };
  useEffect(() => {
    if (user) {
      getOnlineUsers();
    }
  }, [user]);
  const turnOnline = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/online-users/login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log('User set to online');
    } catch (err) {
      console.error('Error setting user online:', err);
    }
  };

  const turnOffline = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/online-users/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (err) {
      console.error('Error setting user offline:', err);
    }
  };
  useEffect(() => {
    if (user) {
      turnOnline();
    }
    window.addEventListener('beforeunload', turnOffline);
    return () => {
      turnOffline();
      window.removeEventListener('beforeunload', turnOffline);
    };
  }, [user]);

  useEffect(() => {
    const fetchLastMessages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/messages/last`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        console.log('Last messages data:', data);
        setLastMessages(data);
      } catch (err) {
        console.error('Error fetching last messages:', err);
      }
    };

    if (user) {
      fetchLastMessages();
    }
  }, [user]);

  return (
    <aside className={`user-list ${showSidebar ? 'visible' : ''}`}>
      {showProfile ? (
        <div className="profile-container">
          <button className="exit-btn" onClick={() => setShowProfile(false)}>
            &larr;
          </button>
          <Profile user={user} setUser={setUser} />
        </div>
      ) : (
        <>
         
<div>
          <div className="search-bar">
              <p>Chats</p>
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="input-search"
            />

          </div>
        
          <div className="search-results">
            {searchResults.map((user, index) => (
              <div
                key={index}
                className="search-result"
                onClick={() => {
                  setRecipient(user.username);
                  setSearchQuery('');
                  setShowSidebar(false);
                }}
              >
                {user.username}
              </div>
            ))}
          </div>

          {users.map((user, index) => (
            <div
              key={index}
              className={`user ${
                user.username === recipient ? 'active' : ''
              }`}
              onClick={() => {
                setRecipient(user.username);
                setShowSidebar(false);
              }}
            >
              <img
                src={
                  user.profilePic ||
                  'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'
                }
                alt="Profile"
                className="profile-pic-small"
              />
              <div className="user-info">
              <span>{user.username}</span>
             <p className="last-message">
  {lastMessages[user.username]?.content
    ? lastMessages[user.username].content
    : lastMessages[user.username]?.fileType
      ? `sent you a ${lastMessages[user.username].fileType}`
      : ''}
</p></div>
              {onlineUsers.includes(user.username) && (
                <span
                  className="online-indicator"
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#4cd964',
                    borderRadius: '50%',
                    marginLeft: '60%',
                  }}
                ></span>
              )}
            </div>
          ))}
          </div>
           <div
            className="sidebar-header"
            onClick={() => setShowProfile(true)}
          >
            <img
              src={
                user?.profilePic ||
                'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'
              }
              alt="Profile"
              className="profile-pic-small"
            />

            <h3>{user.username}</h3>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
