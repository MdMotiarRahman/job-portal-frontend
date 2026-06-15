import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import '../styles/publicPages.css';

const FAQS = [
  { q: 'How do I create an account?', a: "Click Register and choose whether you are a Job Seeker or Employer. Fill in your details and you're ready to go." },
  { q: 'Is JobPortal free to use?', a: 'Yes! Job seekers can browse and apply for jobs completely free. Employers can post jobs with our free tier, with premium plans available for advanced features.' },
  { q: 'How does AI job matching work?', a: 'Our algorithm analyzes your skills, experience level, location preferences, and education to suggest jobs that best fit your profile.' },
  { q: 'Can I apply to multiple jobs?', a: 'Absolutely. There is no limit to how many jobs you can apply to. Track all your applications from your dashboard.' },
  { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link we send you.' },
  { q: 'How do employers review applications?', a: 'Employers have a dedicated dashboard with an ATS pipeline to track candidates through every hiring stage.' },
  { q: 'Can I upload my resume?', a: 'Yes. You can upload your resume in your profile settings. It will be available when you apply for jobs.' },
  { q: 'How do I contact support?', a: 'Visit our Contact page or email support@jobportal.com. We typically respond within 24 hours.' },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="pp-page">
      <div className="pp-container">
        <div className="pp-page-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find quick answers to common questions about JobPortal.</p>
        </div>

        <div className="pp-faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`pp-faq-item ${openIndex === i ? 'open' : ''}`}>
              <button className="pp-faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <HelpCircle size={16} />
                <span>{faq.q}</span>
                <ChevronDown size={16} className="pp-faq-chevron" />
              </button>
              {openIndex === i && (
                <div className="pp-faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
