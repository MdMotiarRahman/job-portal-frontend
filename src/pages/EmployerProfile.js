import React, { useState, useEffect, useRef } from 'react';

import EmployerLayout from '../components/EmployerLayout';
import employerService from '../services/employer.service';
import { getFileUrl } from '../utils/fileUrl';
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Users,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Camera,
  X,
} from 'lucide-react';
import '../styles/employerProfile.css';

const COMPANY_SIZES = ['1-50', '51-200', '201-500', '501-1000', '1000+'];

const EmployerProfile = () => {
  const [profile, setProfile] = useState({
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    companySize: '1-50',
    industry: '',
    location: '',
    phone: '',
    logo: null,
    isVerified: false,
    verificationStatus: 'pending',
    totalJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employerService.getProfile();
        const p = res.profile || res;
        if (p) {
          setProfile(prev => ({
            ...prev,
            companyName: p.companyName || '',
            companyWebsite: p.companyWebsite || '',
            companyDescription: p.companyDescription || '',
            companySize: p.companySize || '1-50',
            industry: p.industry || '',
            location: p.location || '',
            phone: p.phone || '',
            logo: p.logo || null,
            isVerified: p.isVerified || false,
            verificationStatus: p.verificationStatus || 'pending',
            totalJobs: p.totalJobs || 0,
            totalApplications: p.totalApplications || 0,
          }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Only image files are allowed.' });
      return;
    }
    setSelectedLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!profile.companyName.trim()) {
      setAlert({ type: 'error', message: 'Company name is required.' });
      return;
    }

    setSaving(true);
    setAlert({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('companyName', profile.companyName);
      formData.append('companyWebsite', profile.companyWebsite);
      formData.append('companyDescription', profile.companyDescription);
      formData.append('companySize', profile.companySize);
      formData.append('industry', profile.industry);
      formData.append('location', profile.location);
      formData.append('phone', profile.phone);
      if (selectedLogo) {
        formData.append('companyLogo', selectedLogo);
      }

      const res = await employerService.updateProfile(formData);

      const updated = res.profile || res;
      if (updated) {
        setProfile(prev => ({
          ...prev,
          companyName: updated.companyName || prev.companyName,
          companyWebsite: updated.companyWebsite || prev.companyWebsite,
          companyDescription: updated.companyDescription || prev.companyDescription,
          companySize: updated.companySize || prev.companySize,
          industry: updated.industry || prev.industry,
          location: updated.location || prev.location,
          phone: updated.phone || prev.phone,
          logo: updated.logo || prev.logo,
        }));
      }

      setSelectedLogo(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = '';

      window.dispatchEvent(new Event('employer-profile-updated'));

      setAlert({ type: 'success', message: 'Profile updated successfully.' });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const completionFields = ['companyName', 'industry', 'location', 'phone', 'companyDescription', 'companyWebsite'];
  const filledCount = completionFields.filter(f => profile[f] && profile[f].trim()).length;
  const completionPct = Math.round((filledCount / completionFields.length) * 100);

  const missingFields = completionFields.filter(f => !profile[f] || !profile[f].trim());

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getVerificationBadge = () => {
    switch (profile.verificationStatus) {
      case 'approved':
        return <span className="emp-profile-badge verified"><CheckCircle size={13} /> Verified</span>;
      case 'rejected':
        return <span className="emp-profile-badge rejected"><AlertCircle size={13} /> Rejected</span>;
      default:
        return <span className="emp-profile-badge pending"><AlertCircle size={13} /> Pending Review</span>;
    }
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div className="emp-page">
          <div className="admin-loading"><div className="admin-spinner" /></div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="emp-page emp-profile-page">
        {/* Hero */}
        <div className="emp-profile-hero">
          <div className="emp-profile-hero-content">
            <div
              className="emp-profile-avatar emp-profile-logo-upload"
              onClick={() => logoInputRef.current?.click()}
              title="Click to upload logo"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="emp-profile-logo-img" />
              ) : profile.logo?.url ? (
                <img
                  src={getFileUrl(profile.logo.url)}
                  alt="Company logo"
                  className="emp-profile-logo-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              {(logoPreview || profile.logo?.url) ? null : (
                <span className="emp-profile-initials">{getInitials(profile.companyName)}</span>
              )}
              {profile.logo?.url && !logoPreview && (
                <span className="emp-profile-initials" style={{ display: 'none' }}>{getInitials(profile.companyName)}</span>
              )}
              <div className="emp-profile-logo-overlay">
                <Camera size={16} />
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="emp-profile-logo-input"
              />
            </div>
            {(selectedLogo || logoPreview) && (
              <button
                className="emp-profile-logo-remove"
                onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                type="button"
                title="Remove selected logo"
              >
                <X size={12} />
              </button>
            )}
            <div className="emp-profile-hero-info">
              <h2>{profile.companyName || 'Your Company'}</h2>
              <p>{profile.industry || 'Industry not set'}</p>
              {getVerificationBadge()}
            </div>
          </div>
          <div className="emp-profile-hero-stats">
            <div className="emp-profile-hero-stat">
              <div className="emp-profile-hero-stat-value">{profile.totalJobs}</div>
              <div className="emp-profile-hero-stat-label">Jobs Posted</div>
            </div>
            <div className="emp-profile-hero-stat">
              <div className="emp-profile-hero-stat-value">{profile.totalApplications}</div>
              <div className="emp-profile-hero-stat-label">Applications</div>
            </div>
          </div>
        </div>

        {/* Completion Card */}
        <div className="emp-profile-completion-card">
          <div className="emp-profile-completion-head">
            <span>Profile Completion</span>
            <strong>{completionPct}%</strong>
          </div>
          <div className="emp-profile-completion-bar">
            <div
              className="emp-profile-completion-fill"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {missingFields.length > 0 && (
            <p className="emp-profile-completion-hint">
              Missing: {missingFields.map(f => f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())).join(', ')}
            </p>
          )}
        </div>

        {alert.message && (
          <div className={`emp-profile-alert ${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {alert.message}
          </div>
        )}

        {/* Company Information Form */}
        <div className="emp-profile-form-section">
          <div className="emp-profile-form-title">
            <Building2 size={14} />
            Company Information
          </div>

          <div className="emp-profile-form-grid">
            <div className="emp-profile-form-group full-width">
              <label className="emp-profile-label">Company Name *</label>
              <div className="emp-profile-input-wrap">
                <Building2 size={15} className="emp-profile-input-icon" />
                <input
                  type="text"
                  name="companyName"
                  value={profile.companyName}
                  onChange={handleChange}
                  className="emp-profile-input"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
            </div>

            <div className="emp-profile-form-group">
              <label className="emp-profile-label">Industry</label>
              <div className="emp-profile-input-wrap">
                <Briefcase size={15} className="emp-profile-input-icon" />
                <input
                  type="text"
                  name="industry"
                  value={profile.industry}
                  onChange={handleChange}
                  className="emp-profile-input"
                  placeholder="e.g. Technology, Healthcare"
                />
              </div>
            </div>

            <div className="emp-profile-form-group">
              <label className="emp-profile-label">Company Size</label>
              <div className="emp-profile-input-wrap">
                <Users size={15} className="emp-profile-input-icon" />
                <select
                  name="companySize"
                  value={profile.companySize}
                  onChange={handleChange}
                  className="emp-profile-input emp-profile-select"
                >
                  {COMPANY_SIZES.map(size => (
                    <option key={size} value={size}>{size} employees</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="emp-profile-form-group">
              <label className="emp-profile-label">Location</label>
              <div className="emp-profile-input-wrap">
                <MapPin size={15} className="emp-profile-input-icon" />
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  className="emp-profile-input"
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>

            <div className="emp-profile-form-group">
              <label className="emp-profile-label">Phone</label>
              <div className="emp-profile-input-wrap">
                <Phone size={15} className="emp-profile-input-icon" />
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="emp-profile-input"
                  placeholder="e.g. +1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="emp-profile-form-group full-width">
              <label className="emp-profile-label">Company Website</label>
              <div className="emp-profile-input-wrap">
                <Globe size={15} className="emp-profile-input-icon" />
                <input
                  type="url"
                  name="companyWebsite"
                  value={profile.companyWebsite}
                  onChange={handleChange}
                  className="emp-profile-input"
                  placeholder="https://example.com"
                />
                {profile.companyWebsite && (
                  <a
                    href={profile.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="emp-profile-website-link"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            <div className="emp-profile-form-group full-width">
              <label className="emp-profile-label">Company Description</label>
              <textarea
                name="companyDescription"
                value={profile.companyDescription}
                onChange={handleChange}
                className="emp-profile-textarea"
                placeholder="Tell seekers about your company, culture, mission..."
                rows={5}
              />
            </div>
          </div>

          {/* Save Button — inside form section */}
          <div className="emp-profile-form-actions">
            <button
              className="emp-profile-save-btn"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={15} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerProfile;
