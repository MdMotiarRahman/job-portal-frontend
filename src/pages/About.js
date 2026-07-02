import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Heart, Globe, Briefcase, ArrowRight } from 'lucide-react';
import '../styles/publicPages.css';

const About = () => (
  <div className="pp-page">
    <div className="pp-container">
      <div className="pp-page-header">
        <h1>About JobLand</h1>
        <p>Connecting talent with opportunity through intelligent matching and modern hiring tools.</p>
      </div>

      <div className="pp-about-hero">
        <div className="pp-about-text">
          <h2>Our Mission</h2>
          <p>We believe finding the right job or the right candidate shouldn't be hard. JobLand uses AI-powered recommendations to match the best talent with the best opportunities, making hiring faster, smarter, and more human.</p>
        </div>
      </div>

      <div className="pp-features-grid">
        {[
          { icon: Target, title: 'AI Matching', desc: 'Smart algorithms match candidates to roles based on skills, experience, and preferences.' },
          { icon: Users, title: 'For Everyone', desc: "Whether you're seeking a job or hiring talent, our platform serves both sides of the market." },
          { icon: Globe, title: 'Global Reach', desc: 'Connect with employers and candidates from around the world, across every industry.' },
          { icon: Heart, title: 'Human-Centered', desc: "Built with empathy and designed to make the hiring process feel personal, not transactional." },
        ].map((f, i) => (
          <div className="pp-about-card" key={i}>
            <div className="pp-about-icon"><f.icon size={22} /></div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="pp-cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of professionals and companies already using JobLand.</p>
        <div className="pp-cta-actions">
          <Link to="/register" className="pp-btn-primary">Get Started <ArrowRight size={16} /></Link>
          <Link to="/jobs" className="pp-btn-outline"><Briefcase size={16} /> Browse Jobs</Link>
        </div>
      </div>
    </div>
  </div>
);

export default About;
