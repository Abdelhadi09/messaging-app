import React, { useEffect } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import axios from 'axios';

 function VoiceRecorder({ user, recipient }) {
  // Get the controls and state from hook
  const controls = useVoiceVisualizer();

  const {
    startRecording,
    stopRecording,
    isRecordingInProgress,
    recordedBlob,
    error,
    audioSrc,
    isAvailableRecordedAudio,
    // other controls like pause/resume if you need them
  } = controls;

  // Optional: react to recorded blob when stop is called
  useEffect(() => {
    if (recordedBlob) {
      // Example: upload or process blob
      console.log("Recorded Blob:", recordedBlob);
      const sendAudio = async () => {
        const formData = new FormData();
        formData.append('audio', recordedBlob, 'voice-message.webm');
        formData.append('recipient', recipient);
        try {
          await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/messages/upload-audio`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          // Optionally, trigger UI update or notify user
        } catch (err) {
          console.error('Failed to send audio message:', err);
        }
      };
      sendAudio();
      // You can also do: URL.createObjectURL(recordedBlob)
    }
  }, [recordedBlob]);

  // Optional: show error in console
  useEffect(() => {
    if (error) {
      console.error("Recording error:", error);
    }
  }, [error]);

  return (
    <>
      {/* Visualization + default UI from the component */}
      <VoiceVisualizer
        controls={controls}
        width={300}
        height={128}
        backgroundColor="transparent"
        mainBarColor="#4f46e5"
        secondaryBarColor="#5e5e5e"
        speed={3}
        barWidth={5}
        gap={1}
        rounded={5}
        isControlPanelShown={true}   // default UI: buttons etc
        isDownloadAudioButtonShown={true}
        onlyRecording={false}        // you can switch off playback
      />
   </>
  );
}
export default VoiceRecorder;
