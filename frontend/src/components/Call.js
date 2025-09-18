import React from 'react';
import './Call.css';
import hungup from '../images/fermer.png';
import videoOff from '../images/video.png';
import mute from '../images/audio-desactive.png';

const Call = ({
   recipient,
    onClose, 
    onEndCall ,
     isCalling ,
      isInCall ,
      localStreamRef,
      remoteStreamRef,
    toggleVideo}) => {
  return (
    <div className="call-container">
  <div className="call-header">
    <img
              src={
                recipient.profilePic ||
                'https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg'
              }
              alt="Profile"
              className="profile-pic-small"
            />
    <h2>{recipient.username}</h2>
  </div>

  <div className="video-wrapper">
    <video ref={remoteStreamRef} autoPlay className="remote-video" />
    <video ref={localStreamRef} autoPlay muted className="local-video" />
  </div>

  <div className="call-controls">
    <button onClick={toggleVideo}>
      <img src={videoOff} alt="Toggle Video" />
    </button>
    <button>
      <img src={mute} alt="Mute/Unmute" />
    </button>
    {(isCalling || isInCall) && (
      <button onClick={onEndCall}>
        <img src={hungup} alt="End Call" />
      </button>
    )}
  </div>
</div>

  );
};

export default Call;