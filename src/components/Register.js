import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, Mail, Lock, Building2, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import authService from '../services/auth.service';
import '../styles/auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();
  const firstErrorRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError('');
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      firstErrorRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(name, email, password, role);
      setSuccessful(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const resMessage = (error.response?.data?.message) || error.message || 'Registration failed. Please try again.';
      setApiError(resMessage);
      firstErrorRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (successful) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center py-8">
          <div className="success-icon-wrapper mx-auto mb-6">
            <CheckCircle2 size={48} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-muted mb-6">Welcome to JobLand. You are being redirected to sign in.</p>
          <Loader2 size={24} className="animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo-large">
            <Briefcase size={32} strokeWidth={2.5} />
          </div>
          <h1>Create an account</h1>
          <p className="text-muted">Start your journey with JobLand today</p>
        </div>

        {apiError && (
          <div className="alert alert-error" role="alert" ref={firstErrorRef} tabIndex="-1">
            <AlertCircle size={18} className="alert-icon" />
            <div className="alert-content">{apiError}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleRegister} noValidate>
          <div className="role-toggle">
            <label className={`role-btn ${role === 'seeker' ? 'active' : ''}`}>
              <input type="radio" name="role" value="seeker" checked={role === 'seeker'} onChange={(e) => setRole(e.target.value)} disabled={isLoading} className="sr-only" />
              <Search size={18} />
              <span>Job Seeker</span>
            </label>
            <label className={`role-btn ${role === 'employer' ? 'active' : ''}`}>
              <input type="radio" name="role" value="employer" checked={role === 'employer'} onChange={(e) => setRole(e.target.value)} disabled={isLoading} className="sr-only" />
              <Building2 size={18} />
              <span>Employer</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                id="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                ref={errors.name ? firstErrorRef : null}
                aria-label="Full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </div>
            {errors.name && <span className="error-text" id="name-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && <span className="error-text" id="email-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Create a password (8+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </div>
            {errors.password && <span className="error-text" id="password-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-muted">
            Already have an account? <Link to="/login" className="link-primary">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
