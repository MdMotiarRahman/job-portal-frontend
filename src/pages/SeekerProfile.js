import React, { useEffect, useState } from 'react';
import '../styles/seekerProfile.css';
const emptyProfile = {
  fullName: '',
  phone: '',
  location: '',
  skills: '',
  education: '',
  experience: '',
  linkedin: '',
  github: '',
  bio: '',
  profileImage: '',
};

const SeekerProfile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;

        const response = await fetch('http://localhost:5000/api/seeker/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setProfile({
          fullName: data.name || '',
          phone: data.phone || '',
          location: data.location || '',
          skills: data.skills || '',
          education: data.education || '',
          experience: data.experience || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          bio: data.bio || '',
          profileImage: data.profileImage || '',
        });
      } catch (error) {
        console.log(error);
        setMessage({ text: 'Failed to load profile', type: 'error' });
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const formData = new FormData();

      formData.append('fullName', profile.fullName || '');
      formData.append('phone', profile.phone || '');
      formData.append('location', profile.location || '');
      formData.append('skills', profile.skills || '');
      formData.append('education', profile.education || '');
      formData.append('experience', profile.experience || '');
      formData.append('linkedin', profile.linkedin || '');
      formData.append('github', profile.github || '');
      formData.append('bio', profile.bio || '');

      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      const response = await fetch('http://localhost:5000/api/seeker/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfile({
        fullName: data.name || '',
        phone: data.phone || '',
        location: data.location || '',
        skills: data.skills || '',
        education: data.education || '',
        experience: data.experience || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        bio: data.bio || '',
        profileImage: data.profileImage || '',
      });

      setSelectedImage(null);
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      console.log(error);
      setMessage({
        text: error.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const previewImage = selectedImage
    ? URL.createObjectURL(selectedImage)
    : profile.profileImage || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero">
          <div className="profile-avatar-block">
            <div className="profile-avatar">
              <img src={previewImage} alt="profile" />
            </div>

            <label className="upload-btn">
              Change Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
            </label>
          </div>

          <div className="profile-hero-text">
            <h1>{profile.fullName ? `${profile.fullName}'s Profile` : 'Job Seeker Profile'}</h1>
            <p>
              {profile.fullName
                ? `Welcome back, ${profile.fullName}. Keep your profile updated to stand out.`
                : 'Build a professional profile to attract employers.'}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`alert-box ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-card">
          <div className="section-title">
            <h2>Personal Information</h2>
            <p>Update the information employers will see.</p>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={profile.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Phone number"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Your location"
                value={profile.location}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Skills</label>
              <input
                type="text"
                name="skills"
                placeholder="React, Node, MongoDB"
                value={profile.skills}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Education</label>
              <input
                type="text"
                name="education"
                placeholder="Education"
                value={profile.education}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                placeholder="Experience"
                value={profile.experience}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>LinkedIn URL</label>
              <input
                type="text"
                name="linkedin"
                placeholder="https://linkedin.com/in/..."
                value={profile.linkedin}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>GitHub URL</label>
              <input
                type="text"
                name="github"
                placeholder="https://github.com/..."
                value={profile.github}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field full-width">
            <label>About You</label>
            <textarea
              name="bio"
              placeholder="Write a short summary about yourself..."
              value={profile.bio}
              onChange={handleChange}
              rows="7"
            />
          </div>

          <div className="actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeekerProfile;