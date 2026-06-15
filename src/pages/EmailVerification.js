import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail, Briefcase } from 'lucide-react';
import '../styles/auth.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) { setStatus('success'); setMessage(data.message || 'Email verified successfully!'); }
        else { setStatus('error'); setMessage(data.message || 'Verification failed.'); }
      } catch { setStatus('error'); setMessage('Network error. Please try again.'); }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card auth-card-center">
          <div className="auth-logo"><Mail size={28} /></div>
          {status === 'verifying' && (
            <>
              <Loader2 size={32} className="auth-spin" />
              <h1>Verifying Email...</h1>
              <p className="auth-subtitle">Please wait while we verify your email address.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 size={40} className="auth-icon-success" />
              <h1>Email Verified!</h1>
              <p className="auth-subtitle">{message}</p>
              <Link to="/login" className="auth-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>Go to Login</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={40} className="auth-icon-error" />
              <h1>Verification Failed</h1>
              <p className="auth-subtitle">{message}</p>
              <Link to="/login" className="auth-link">← Return to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
