import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import '../styles/publicPages.css';

const Maintenance = () => (
  <div className="pp-page pp-error-page">
    <div className="pp-container">
      <div className="pp-error-content">
        <Wrench size={48} className="pp-maintenance-icon" />
        <h1>Under Maintenance</h1>
        <p>We're currently performing scheduled maintenance. We'll be back shortly.</p>
        <p className="pp-muted">Thank you for your patience.</p>
        <Link to="/" className="pp-btn-primary" style={{ marginTop: 16 }}>Back to Home <ArrowRight size={16} /></Link>
      </div>
    </div>
  </div>
);

export default Maintenance;
