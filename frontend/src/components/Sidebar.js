import React from 'react';

const Sidebar = ({
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
      <h3>Conversations</h3>
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

      {users.map((username, index) => (
        <div
          key={index}
          className={`user ${username === recipient ? 'active' : ''}`}
          onClick={() => {
            setRecipient(username);
            setShowSidebar(false);
          }}
        >
          {username}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
