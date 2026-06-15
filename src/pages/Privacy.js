import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/publicPages.css';

const Privacy = () => (
  <div className="pp-page">
    <div className="pp-container pp-static-content">
      <h1>Privacy Policy</h1>
      <p className="pp-muted">Last updated: June 15, 2026</p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly, including your name, email, phone number, resume, work history, and profile data. We also collect usage data such as pages visited and actions taken on the Platform.</p>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>We use your information to provide and improve our services, match you with relevant jobs or candidates, communicate with you, and ensure the security of the Platform.</p>
      </section>

      <section>
        <h2>3. Information Sharing</h2>
        <p>We do not sell your personal information. We may share your information with employers when you apply for a job, or as required by law. We may also share anonymized, aggregated data for analytics purposes.</p>
      </section>

      <section>
        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. You can manage most of your data through your account settings, or by contacting us directly.</p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage patterns. You can control cookies through your browser settings.</p>
      </section>

      <section>
        <h2>7. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page.</p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>For privacy-related inquiries, please <Link to="/contact">contact us</Link>.</p>
      </section>
    </div>
  </div>
);

export default Privacy;
