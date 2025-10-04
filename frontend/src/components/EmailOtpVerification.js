import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

 function OtpVerification({ email ,username }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { username, otp });
      setMessage(res.data.message).then(() => {
        setTimeout(() => {
          window.location.href = "/login"; // Redirect to login page
        }, 2000);
      });
      
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Server error, try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Email Verification</h2>
      <p>Enter the OTP sent to your email: <b>{email}</b></p>

      <form onSubmit={handleVerify} style={styles.form}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={styles.input}
          maxLength={6}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {message && <p style={{ color: "blue" }}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    textAlign: "center",
    letterSpacing: "3px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default OtpVerification;
