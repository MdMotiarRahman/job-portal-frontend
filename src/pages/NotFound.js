import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import '../styles/publicPages.css';

const NotFound = () => (
  <div className="pp-page pp-error-page">
    <div className="pp-container">
      <div className="pp-error-content">
        <h1 className="pp-error-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="pp-error-actions">
          <Link to="/" className="pp-btn-primary"><Home size={16} /> Go Home</Link>
          <button onClick={() => window.history.back()} className="pp-btn-outline"><ArrowLeft size={16} /> Go Back</button>
        </div>
      </div>
    </div>
  </div>
);

export default NotFound;
