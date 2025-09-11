import React from 'react';
import './Call.css';

const Call = ({ recipient, onClose, onEndCall , isCalling , isInCall }) => {
  return (
    <div className="call-panel">
      <button className="close-btn" onClick={onClose}>&times;</button>
      <div className="call-header">
        <img
          src={
            recipient.profilePic ||
            'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'
          }
          alt={`${recipient.username}'s profile`}
          className="call-profile-pic"
        />
        <h2>Calling {recipient.username}</h2>
      </div>
      <div className="call-controls">
        <button  className="mute-btn">Mute</button>
        {(isCalling || isInCall) && (
                  <button onClick={onEndCall} className="end-call-button">
                    End Call
                  </button>
                )}
      </div>
    </div>
  );
};

export default Call;