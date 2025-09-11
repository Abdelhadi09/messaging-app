import React from 'react';
import './RecipientProfile.css';

const RecipientProfile = ({ recipient, onClose }) => {
  return (
    <div className="recipient-profile">
      <button className="close-btn" onClick={onClose}>&times;</button>
      <div className="profile-header">
        <img
          src={
            recipient.profilePic ||
            'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'
          }
          alt={`${recipient.username}'s profile`}
          className="rec-profile-pic"
        />
        <h2>{recipient.username}</h2>
      </div>
      <div className="profile-bio">
        <h3>Bio</h3>
        <p>{recipient.bio || 'No bio available'}</p>
      </div>
    </div>
  );
};

export default RecipientProfile;
