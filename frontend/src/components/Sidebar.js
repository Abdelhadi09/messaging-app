import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({
  navigate,
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
  onlineUsers,
}) => {
  return (
    <aside className={`user-list ${showSidebar ? 'visible' : ''}`}>
      <div className="sidebar-header"  onClick={() => navigate("/profile")}>
       < img 
       src={user?.profilePic || 'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'} alt="Profile" className="profile-pic-small" />

        <h3>{user.username}</h3>
        </div>
      
      <div className="search-bar">
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
<p>Chats</p>
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
          className={`user ${user.username === recipient ? 'active' : ''}`}
          onClick={() => {
            setRecipient(user.username);
            setShowSidebar(false);
          }}
        >
          <img
            src={user.profilePic || 'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'}
            alt="Profile"
            className="profile-pic-small"
          />
          <span>{user.username}</span>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
