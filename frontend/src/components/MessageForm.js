import React from 'react';

const MessageForm = ({ content, setContent, handleTyping, sendMessage }) => {
  return (
    <form onSubmit={sendMessage} className="message-form">
      <input
        type="text"
        placeholder="Type your message..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleTyping();
        }}
        required
        className="input-message"
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  );
};

export default MessageForm;
