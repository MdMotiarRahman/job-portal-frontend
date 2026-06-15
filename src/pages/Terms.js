import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/publicPages.css';

const Terms = () => (
  <div className="pp-page">
    <div className="pp-container pp-static-content">
      <h1>Terms & Conditions</h1>
      <p className="pp-muted">Last updated: June 15, 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using JobPortal ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform.</p>
      </section>

      <section>
        <h2>2. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration and to keep your information up to date.</p>
      </section>

      <section>
        <h2>3. Platform Usage</h2>
        <p>JobPortal provides a platform for job seekers and employers to connect. We do not guarantee employment or the accuracy of job listings. Users must comply with all applicable laws when using the Platform.</p>
      </section>

      <section>
        <h2>4. Privacy</h2>
        <p>Your use of the Platform is also governed by our <Link to="/privacy">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information.</p>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>All content on the Platform, including text, graphics, logos, and software, is the property of JobPortal or its licensors and is protected by intellectual property laws.</p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>JobPortal shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. We provide the Platform "as is" without warranties of any kind.</p>
      </section>

      <section>
        <h2>7. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms.</p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>For questions about these Terms, please <Link to="/contact">contact us</Link>.</p>
      </section>
    </div>
  </div>
);

export default Terms;
