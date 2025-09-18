import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const STUN_SERVER = 'stun:stun.l.google.com:19302';

const useVoiceCall = ({ user, recipient }) => {
  const socket = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState(null);

  const generateRoomId = (u1, u2) => [u1, u2].sort().join('-');

  // Join room when recipient is selected
  useEffect(() => {
    if (recipient && user && socket.current) {
      const roomId = generateRoomId(user.username, recipient);
      console.log('[Socket] Joining room:', roomId);
      socket.current.emit('join-room', roomId);
    }
  }, [recipient, user]);

  const initializePeerConnection = () => {
    if (peerConnectionRef.current) {
      console.log('[PeerConnection] Already initialized');
      return;
    }

    console.log('[PeerConnection] Initializing...');
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: STUN_SERVER }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const roomId = generateRoomId(user.username, recipient || callerInfo);
        console.log('[ICE] Sending candidate to room:', roomId);
        socket.current.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      } else {
        console.log('[ICE] All candidates sent');
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('[PeerConnection] Remote stream received');
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'disconnected') {
        setIsInCall(false);
 console.log('[PeerConnection] State:', peerConnection.connectionState);
      }
     
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('[ICE] State:', peerConnection.iceConnectionState);
    };

    peerConnectionRef.current = peerConnection;
  };

  useEffect(() => {
    console.log('[Socket] Connecting...');
    socket.current = io(process.env.REACT_APP_API_BASE_URL);

    socket.current.on('connect', () => {
      console.log('[Socket] Connected:', socket.current.id);
    });

    socket.current.on('offer', async ({ offer, from }) => {
      console.log('[Socket] Incoming offer from:', from);
      setIncomingCall(true);
      setCallerInfo(from);
      window.incomingOffer = offer;
    });

    socket.current.on('answer', async ({ answer }) => {
      console.log('[Socket] Answer received');
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log('[PeerConnection] Answer set as remote description');
    });

    socket.current.on('ice-candidate', async ({ candidate }) => {
      console.log('[Socket] Received ICE candidate');
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
        console.log('[ICE] Candidate added');
      }
    });

    socket.current.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsInCall(false);
    });

    return () => {
      socket.current.disconnect();
      console.log('[Socket] Disconnected on cleanup');
    };
  }, []);

  const startCall = async () => {
    console.log('[Call] Starting call...');
    try {
      initializePeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true  , video: true});
      console.log('[Media] Got local audio stream');

     setTimeout(() => {
      localStreamRef.current.srcObject = stream;
    }, 500);
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
        console.log('[Media] Track added to PeerConnection');
      });

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('[PeerConnection] Offer created and set as local description');

      const roomId = generateRoomId(user.username, recipient);
      socket.current.emit('offer', {
        roomId,
        offer,
        from: user.username,
      });
      console.log('[Socket] Sent offer to room:', roomId);

      setIsCalling(true);
    } catch (err) {
      console.error('[Error] Failed to start call:', err);
    }
  };

  const acceptCall = async () => {
    console.log('[Call] Accepting incoming call...');
    setIncomingCall(false);
    setIsInCall(true);

    initializePeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true  , video: true });
    console.log('[Media] Got local audio stream for incoming call');
    localStreamRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
      console.log('[Media] Track added to PeerConnection');
    });

    const offer = window.incomingOffer;
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    console.log('[PeerConnection] Offer set as remote description');

    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    console.log('[PeerConnection] Answer created and set as local description');

    const roomId = generateRoomId(user.username, recipient || callerInfo);
    socket.current.emit('answer', {
      roomId,
      answer,
    });
    console.log('[Socket] Sent answer to room:', roomId);
  };

  const denyCall = () => {
    console.log('[Call] Denied incoming call');
    setIncomingCall(false);
    window.incomingOffer = null;
    setCallerInfo(null);
  };

  const endCall = () => {
    console.log('[Call] Ending call...');
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log('[PeerConnection] Closed');
    }

    if (localStreamRef.current?.srcObject) {
      localStreamRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
        console.log('[Media] Stopped local track');
      });
      localStreamRef.current.srcObject = null;
    }

    setIsCalling(false);
    setIsInCall(false);
    console.log('[Call] Reset call state');
  };
const toggleVideo = () => {
  const videoTrack = localStreamRef.current?.srcObject?.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
  }
};

  return {
    toggleVideo,
    startCall,
    endCall,
    acceptCall,
    denyCall,
    isCalling,
    isInCall,
    incomingCall,
    callerInfo,
    localStreamRef,
    remoteStreamRef,
  };
};

export default useVoiceCall;
