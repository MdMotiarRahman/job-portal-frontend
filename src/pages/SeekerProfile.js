import React, { useEffect, useState, useRef } from 'react';
import '../styles/employerDashboard.css';
import '../styles/seekerProfile.css';
import { getFileUrl } from '../utils/fileUrl';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';

const EXPERIENCE_LEVELS = [
  { value: 'Entry', label: 'Entry Level', desc: '0-1 years' },
  { value: 'Mid', label: 'Mid Level', desc: '2-5 years' },
  { value: 'Senior', label: 'Senior Level', desc: '5+ years' },
];

const EDUCATION_LEVELS = [
  { value: 'High School', label: 'High School' },
  { value: 'Diploma', label: 'Diploma / Associate' },
  { value: "Bachelor's", label: "Bachelor's Degree" },
  { value: "Master's", label: "Master's Degree" },
  { value: 'PhD', label: 'PhD / Doctorate' },
];

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
  resume: '',
};

const SeekerProfile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [skillInput, setSkillInput] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const skillInputRef = useRef(null);

  const [expLevel, setExpLevel] = useState('');
  const [expYears, setExpYears] = useState('');

  const [eduLevel, setEduLevel] = useState('');
  const [eduField, setEduField] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await fetch('http://localhost:5000/api/seeker/profile', {
          headers: { Authorization: `Bearer ${token}` },
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
          resume: data.resume || '',
        });

        if (data.skills) {
          const tags = data.skills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
          setSkillTags(tags);
        }

        if (data.experience) {
          const exp = data.experience.toLowerCase();
          if (exp.includes('senior') || exp.includes('lead')) {
            setExpLevel('Senior');
          } else if (exp.includes('mid') || exp.includes('intermediate')) {
            setExpLevel('Mid');
          } else {
            setExpLevel('Entry');
          }
          const yearsMatch = data.experience.match(/(\d+)/);
          if (yearsMatch) setExpYears(yearsMatch[1]);
        }

        if (data.education) {
          const edu = data.education.toLowerCase();
          if (edu.includes('phd') || edu.includes('doctorate')) {
            setEduLevel('PhD');
          } else if (edu.includes('master') || edu.includes('mba')) {
            setEduLevel("Master's");
          } else if (edu.includes('bachelor') || edu.includes('b.s') || edu.includes('b.a') || edu.includes('btech')) {
            setEduLevel("Bachelor's");
          } else if (edu.includes('diploma') || edu.includes('associate')) {
            setEduLevel('Diploma');
          } else if (edu.includes('high school') || edu.includes('secondary')) {
            setEduLevel('High School');
          }
          const dashIdx = data.education.indexOf('—');
          if (dashIdx > -1) {
            setEduField(data.education.substring(dashIdx + 1).trim());
          } else {
            const parts = data.education.split(/[-–]/);
            if (parts.length > 1) setEduField(parts[1].trim());
          }
        }
      } catch (error) {
        console.log(error);
        setMessage({ text: 'Failed to load profile', type: 'error' });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSkill = (value) => {
    const trimmed = value.trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      const newTags = [...skillTags, trimmed];
      setSkillTags(newTags);
      setProfile((prev) => ({ ...prev, skills: newTags.join(', ') }));
    }
    setSkillInput('');
  };

  const removeSkill = (tag) => {
    const newTags = skillTags.filter((t) => t !== tag);
    setSkillTags(newTags);
    setProfile((prev) => ({ ...prev, skills: newTags.join(', ') }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === 'Backspace' && !skillInput && skillTags.length > 0) {
      removeSkill(skillTags[skillTags.length - 1]);
    }
  };

  const handleExpLevelChange = (level) => {
    setExpLevel(level);
    const years = expYears || '0';
    setProfile((prev) => ({
      ...prev,
      experience: `${level} Level (${years} years)`,
    }));
  };

  const handleExpYearsChange = (years) => {
    setExpYears(years);
    if (expLevel) {
      setProfile((prev) => ({
        ...prev,
        experience: `${expLevel} Level (${years} years)`,
      }));
    }
  };

  const handleEduLevelChange = (level) => {
    setEduLevel(level);
    const field = eduField || '';
    setProfile((prev) => ({
      ...prev,
      education: field ? `${level} — ${field}` : level,
    }));
  };

  const handleEduFieldChange = (field) => {
    setEduField(field);
    if (eduLevel) {
      setProfile((prev) => ({
        ...prev,
        education: field ? `${eduLevel} — ${field}` : eduLevel,
      }));
    }
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

      if (selectedImage) formData.append('profileImage', selectedImage);
      if (selectedResume) formData.append('resume', selectedResume);

      const response = await fetch('http://localhost:5000/api/seeker/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

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
        resume: data.resume || '',
      });

      setSelectedImage(null);
      setSelectedResume(null);
      setImageCacheKey(Date.now());
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      console.log(error);
      setMessage({ text: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [imageCacheKey, setImageCacheKey] = useState(Date.now());

  const previewImage = selectedImage
    ? URL.createObjectURL(selectedImage)
    : profile.profileImage
      ? `${getFileUrl(profile.profileImage)}?t=${imageCacheKey}`
      : null;

  const getCompletionInfo = () => {
    const fields = [
      { key: 'fullName', label: 'Full Name', critical: false, done: !!profile.fullName },
      { key: 'location', label: 'Location', critical: true, done: !!profile.location },
      { key: 'skills', label: 'Skills', critical: true, done: !!profile.skills },
      { key: 'experience', label: 'Experience', critical: true, done: !!profile.experience },
      { key: 'education', label: 'Education', critical: true, done: !!profile.education },
      { key: 'resume', label: 'Resume', critical: false, done: !!profile.resume },
    ];
    const completed = fields.filter((f) => f.done).length;
    const criticalMissing = fields.filter((f) => f.critical && !f.done);
    return { fields, completed, total: fields.length, criticalMissing };
  };

  const completion = getCompletionInfo();

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero">
          <div className="profile-avatar-block">
            <div className="profile-avatar">
              {previewImage ? (
                <img src={previewImage} alt="profile" />
              ) : (
                <div className="profile-avatar-initials">
                  {profile.fullName ? profile.fullName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
                </div>
              )}
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
          <div className={`alert-box ${message.type}`}>{message.text}</div>
        )}

        {/* COMPLETION CARD */}
        <div className="profile-completion-card">
          <div className="profile-completion-header">
            <Sparkles size={16} />
            <span>Profile Strength</span>
            <strong>{completion.completed}/{completion.total}</strong>
          </div>
          <div className="profile-completion-bar">
            <div
              className="profile-completion-fill"
              style={{ width: `${(completion.completed / completion.total) * 100}%` }}
            />
          </div>
          {completion.criticalMissing.length > 0 && (
            <p className="profile-completion-hint">
              Complete these for better job matches:{' '}
              {completion.criticalMissing.map((f) => f.label).join(', ')}
            </p>
          )}
        </div>

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
              <label>
                <MapPin size={13} />
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Dhaka, Bangladesh"
                value={profile.location}
                onChange={handleChange}
              />
              <span className="field-hint">City, Country — used to match nearby jobs</span>
            </div>

            {/* SKILLS TAG INPUT */}
            <div className="field">
              <label>
                <Briefcase size={13} />
                Skills
              </label>
              <div className="skill-tag-input" onClick={() => skillInputRef.current?.focus()}>
                {skillTags.map((tag) => (
                  <span className="skill-tag" key={tag}>
                    {tag}
                    <button type="button" className="skill-tag-remove" onClick={() => removeSkill(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  ref={skillInputRef}
                  type="text"
                  placeholder={skillTags.length === 0 ? 'Type a skill and press Enter' : ''}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => { if (skillInput.trim()) addSkill(skillInput); }}
                  className="skill-tag-field"
                />
              </div>
              <span className="field-hint">Press Enter or comma to add — top skills improve matches by 40%</span>
            </div>

            {/* EXPERIENCE SELECTOR */}
            <div className="field">
              <label>
                <Briefcase size={13} />
                Experience Level
              </label>
              <div className="exp-selector">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <button
                    type="button"
                    key={lvl.value}
                    className={`exp-option ${expLevel === lvl.value ? 'active' : ''}`}
                    onClick={() => handleExpLevelChange(lvl.value)}
                  >
                    <span className="exp-option-label">{lvl.label}</span>
                    <span className="exp-option-desc">{lvl.desc}</span>
                  </button>
                ))}
              </div>
              <div className="field" style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '11px' }}>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="e.g. 3"
                  value={expYears}
                  onChange={(e) => handleExpYearsChange(e.target.value)}
                />
              </div>
              <span className="field-hint">Matched against job experience requirements (25% weight)</span>
            </div>

            {/* EDUCATION SELECTOR */}
            <div className="field">
              <label>
                <GraduationCap size={13} />
                Education Level
              </label>
              <select
                className="edu-select"
                value={eduLevel}
                onChange={(e) => handleEduLevelChange(e.target.value)}
              >
                <option value="">Select level...</option>
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </select>
              <div className="field" style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '11px' }}>Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={eduField}
                  onChange={(e) => handleEduFieldChange(e.target.value)}
                />
              </div>
              <span className="field-hint">Bachelor's or higher boosts education score (15% weight)</span>
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

          <div className="field full-width">
            <label>Resume</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedResume(e.target.files[0])}
            />
            {profile.resume && !selectedResume && (
              <a
                href={getFileUrl(profile.resume)}
                target="_blank"
                rel="noreferrer"
                className="resume-link"
              >
                View current resume
              </a>
            )}
            {selectedResume && (
              <p className="file-note">Selected resume: {selectedResume.name}</p>
            )}
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
