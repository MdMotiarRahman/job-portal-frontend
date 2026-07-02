import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import '../styles/publicPages.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div className="pp-page">
      <div className="pp-container">
        <div className="pp-page-header">
          <h1>Contact Us</h1>
          <p>Have a question or need support? We'd love to hear from you.</p>
        </div>

        <div className="pp-contact-grid">
          <div className="pp-card">
            <h3>Send a Message</h3>
            {sent ? (
              <div className="pp-contact-success">
                <CheckCircle2 size={32} />
                <p>Thank you! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pp-contact-form">
                <div className="pp-form-row">
                  <label className="pp-form-field">
                    <span>Name</span>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </label>
                  <label className="pp-form-field">
                    <span>Email</span>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </label>
                </div>
                <label className="pp-form-field">
                  <span>Subject</span>
                  <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                </label>
                <label className="pp-form-field">
                  <span>Message</span>
                  <textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
                </label>
                <button type="submit" className="pp-btn-primary" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="pp-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          <div className="pp-contact-info">
            <div className="pp-card">
              <h3>Get in Touch</h3>
              <div className="pp-info-rows">
                <div className="pp-info-row"><Mail size={16} /><span>support@jobland.com</span></div>
                <div className="pp-info-row"><Phone size={16} /><span>+1 (555) 123-4567</span></div>
                <div className="pp-info-row"><MapPin size={16} /><span>123 Innovation St, Tech City</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
