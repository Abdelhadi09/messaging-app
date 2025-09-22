import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

function VoiceRecorder({ user, recipient, onFinished, onCancel }) {
  const waveformRef = useRef(null);
  const wsRef = useRef(null);
  const [recordPlugin, setRecordPlugin] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create wavesurfer instance
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      cursorWidth: 0,
      height: 100,
      barWidth: 2,
      responsive: true
    });
    wsRef.current = ws;

    let record;
    try {
      record = ws.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
          scrollingWaveform: false,
          continuousWaveform: true,
          // continuousWaveformDuration: 30, // optional
        })
      );
    } catch (err) {
      console.error('Error registering Record plugin:', err);
      setError('Record plugin could not be registered');
      return;
    }

    if (!record) {
      setError('Record plugin registration returned nothing');
      return;
    }

    setRecordPlugin(record);

    record.on('record-end', (recBlob) => {
      setBlob(recBlob);
      const audioUrl = URL.createObjectURL(recBlob);
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
    });

    record.on('device-error', (err) => {
      console.error('Mic device error:', err);
      setError('Mic device error: ' + err.toString());
    });

    // Optional: you can use record-progress to update a timer
    record.on('record-progress', (time) => {
      // time is in milliseconds
      const sec = Math.floor(time / 1000);
      setDuration(sec);
    });

    // Cleanup
    return () => {
      try {
        if (record && record.isRecording && record.isRecording()) {
          record.stopRecording();
        }
      } catch(e) {
        console.warn('Error stopping recording on cleanup', e);
      }
      ws.destroy();
    };
  }, []);

  const start = () => {
    if (!recordPlugin) {
      setError('Cannot start, record plugin not ready');
      return;
    }
    recordPlugin.startRecording().catch(err => {
      console.error('startRecording failed:', err);
      setError('startRecording failed: ' + err.toString());
    });
    setIsRecording(true);
  };

  const stop = () => {
    if (!recordPlugin) {
      setError('Cannot stop, record plugin not ready');
      return;
    }
    recordPlugin.stopRecording();
    setIsRecording(false);
  };

  const send = async () => {
    if (!blob) return;
    const formData = new FormData();
    formData.append('audio', blob, 'voice-message.webm');
    formData.append('recipient', recipient);
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/messages/upload-audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formData
      });
      if (!resp.ok) throw new Error('Upload failed status ' + resp.status);
      if (onFinished) onFinished();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload error: ' + err.toString());
    }
  };

  const cancel = () => {
    if (isRecording && recordPlugin) {
      recordPlugin.stopRecording();
    }
    setBlob(null);
    setIsRecording(false);
    setDuration(0);
    if (onCancel) onCancel();
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <div ref={waveformRef} style={{ width: '100%', border: '1px solid #ccc', marginBottom: '10px' }} />
      <div>
        {!isRecording && <button onClick={start}>Record</button>}
        {isRecording && <button onClick={stop}>Stop</button>}
        {blob && !isRecording && <button onClick={send}>Send</button>}
        <button onClick={cancel} style={{ marginLeft: '8px' }}>Cancel</button>
        {duration > 0 && <span style={{ marginLeft: '10px' }}>Duration: {Math.floor(duration)}s</span>}
      </div>
    </div>
  );
}

export default VoiceRecorder;
