import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [showProfile, setShowProfile] = React.useState(false);

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
              <span>{user.username}</span>
            </div>
          ))}
        </>
      )}
    </aside>
  );
};

export default Sidebar;
