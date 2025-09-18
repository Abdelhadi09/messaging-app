import React from 'react';
import './Call.css';

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
    <h2>{recipient.username}</h2>
  </div>

  <div className="video-wrapper">
    <video ref={remoteStreamRef} autoPlay className="remote-video" />
    <video ref={localStreamRef} autoPlay muted className="local-video" />
  </div>

  <div className="call-controls">
    <button onClick={toggleVideo}>🎥</button>
    <button>🔇</button>
    {(isCalling || isInCall) && (
      <button onClick={onEndCall}>❌</button>
    )}
  </div>
</div>

  );
};

export default Call;