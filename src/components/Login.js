import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, AlertCircle, ArrowRight, Loader2, Clock, XCircle } from 'lucide-react';
import authService from '../services/auth.service';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [verificationWarning, setVerificationWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const firstErrorRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    setVerificationWarning('');
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      firstErrorRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      const role = authService.getCurrentUserRole();
      
      // Check for employer verification status
      if (role === 'employer') {
        const verificationStatus = response?.verificationStatus;
        
        if (verificationStatus === 'pending') {
          setVerificationWarning(
            'Your employer account is pending verification. Our team will review your profile and contact you soon. You can update your company details once approved.'
          );
          // Don't navigate yet, keep them on login page with warning
          return;
        } else if (verificationStatus === 'rejected') {
          const rejectionReason = response?.rejectionReason || 'Please contact support for more information.';
          setApiError(`Your employer account was rejected. Reason: ${rejectionReason}`);
          return;
        }
        // If 'approved', proceed with navigation
      }

      // Navigate based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'employer') navigate('/employer');
      else navigate('/seeker');
    } catch (error) {
      const resMessage = (error.response?.data?.message) || error.message || 'Invalid credentials. Please try again.';
      setApiError(resMessage);
      firstErrorRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo-large">
            <Briefcase size={32} strokeWidth={2.5} />
          </div>
          <h1>Welcome back</h1>
          <p className="text-muted">Enter your credentials to access your account</p>
        </div>

        {apiError && (
          <div className="alert alert-error" role="alert" ref={firstErrorRef} tabIndex="-1">
            <AlertCircle size={18} className="alert-icon" />
            <div className="alert-content">{apiError}</div>
          </div>
        )}

        {verificationWarning && (
          <div className="alert alert-warning" role="alert" ref={firstErrorRef} tabIndex="-1">
            <Clock size={18} className="alert-icon" />
            <div className="alert-content">{verificationWarning}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
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
                ref={errors.email ? firstErrorRef : null}
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && <span className="error-text" id="email-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="link-muted text-sm">Forgot password?</Link>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                id="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
            </div>
            {errors.password && <span className="error-text" id="password-error">{errors.password}</span>}
          </div>

          <button
            aria-busy={isLoading}
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-muted">
            Don't have an account? <Link to="/register" className="link-primary">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
