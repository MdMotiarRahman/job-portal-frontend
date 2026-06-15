import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Briefcase } from 'lucide-react';
import '../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setSent(true);
      else setError(data.message || 'Failed to send reset link');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/login" className="auth-back-link"><ArrowLeft size={16} /> Back to Login</Link>
        <div className="auth-card">
          <div className="auth-logo"><Briefcase size={28} /></div>
          <h1>Forgot Password</h1>
          <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

          {error && <div className="auth-error">{error}</div>}

          {sent ? (
            <div className="auth-success">
              <CheckCircle2 size={20} />
              <p>Reset link sent! Check your inbox and follow the instructions.</p>
              <Link to="/login" className="auth-link">← Return to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Email Address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><Loader2 size={16} className="auth-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
