import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user, setUser }) => {
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [bio, setBio] = useState(user.bio || '');
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setUser((prevUser) => ({
          ...prevUser,
          ...res.data,
        }));

        setProfilePic(res.data.profilePic);
        setBio((prevBio) => prevBio || res.data.bio);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [API_BASE_URL, user?.token, navigate, setUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('profilePic', profilePic);
      formData.append('bio', bio);

      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser((prevUser) => ({
        ...prevUser,
        ...res.data,
      }));

      alert('Profile updated successfully!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <div className="profile-pic">
        <img
          src={profilePic || "https://res.cloudinary.com/dxjfdwjbw/image/upload/v1757265803/default-avatar-profile-icon-of-social-media-user-vector_xmxsmv.jpg"}
          alt="Profile"
        />
      </div>

      <p className='bio'>{bio}</p>

      <button type="button" onClick={() => setIsModalOpen(true)}>
        Change Info
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            <form onSubmit={handleUpdate} className="profile-form">
              <div className='file-input-container'>
              <label>Profile Picture:  </label>
              <input
              className='file-input'
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              </div>
              <input 
              className='bio-input'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
              />
              <div className="form-actions">
                <button type="submit">Update Profile</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;