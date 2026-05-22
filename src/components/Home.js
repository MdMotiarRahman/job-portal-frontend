import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-subtitle">
            #1 Smart Hiring Platform
          </p>

          <h1 className="hero-title">
            Find Your <span>Dream</span> Job Today
          </h1>

          <p className="hero-description">
            Connect with top companies and discover opportunities
            that match your skills, passion, and career goals.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="hero-btn primary">
              Get Started
            </Link>

            <Link to="/jobs" className="hero-btn secondary">
              Explore Jobs
            </Link>

          </div>

        </div>

        {/* RIGHT SIDE JOB CARDS */}
        <div className="hero-right">

          <div className="jobs-preview">

            <div className="job-card-preview">
              <h3>Software Engineer</h3>
              <p>Google • Remote</p>
              <span className="job-tag">Full Time</span>
            </div>

            <div className="job-card-preview">
              <h3>Marketing Manager</h3>
              <p>Spotify • Hybrid</p>
              <span className="job-tag">Marketing</span>
            </div>

            <div className="job-card-preview">
              <h3>Financial Analyst</h3>
              <p>JP Morgan • Onsite</p>
              <span className="job-tag">Finance</span>
            </div>

          </div>

        </div>

      </section>

      {/* COMPANIES */}
      <section className="companies-section">

        <p className="section-small-title">
          Trusted by innovative companies
        </p>

        <div className="companies-grid">

          <div className="company-box">Google</div>
          <div className="company-box">Microsoft</div>
          <div className="company-box">Amazon</div>
          <div className="company-box">Spotify</div>
          <div className="company-box">Netflix</div>

        </div>

      </section>

      {/* STATS */}
      <section className="stats-section">

        <div className="stats-grid">

          <div className="stat-card">
            <h2>10K+</h2>
            <p>Active Jobs</p>
          </div>

          <div className="stat-card">
            <h2>5K+</h2>
            <p>Companies</p>
          </div>

          <div className="stat-card">
            <h2>20K+</h2>
            <p>Candidates</p>
          </div>

          <div className="stat-card">
            <h2>95%</h2>
            <p>Success Rate</p>
          </div>

        </div>

      </section>

      {/* CATEGORIES */}
      <section className="categories-section">

        <h2 className="categories-title">
          Popular Categories
        </h2>

        <div className="categories-grid">

          <div className="category-card">
            <h3>Technology</h3>
            <p>1200+ Jobs</p>
          </div>

          <div className="category-card">
            <h3>Marketing</h3>
            <p>850+ Jobs</p>
          </div>

          <div className="category-card">
            <h3>Finance</h3>
            <p>620+ Jobs</p>
          </div>

          <div className="category-card">
            <h3>Healthcare</h3>
            <p>930+ Jobs</p>
          </div>

          <div className="category-card">
            <h3>Design</h3>
            <p>430+ Jobs</p>
          </div>

          <div className="category-card">
            <h3>Sales</h3>
            <p>700+ Jobs</p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="cta-section">

        <h2>
          Start Building Your Career Today
        </h2>

        <p>
          Join thousands of professionals and companies using JobPortal.
        </p>

        <Link to="/register" className="cta-btn">
          Join Now
        </Link>

      </section>

    </div>
  );
};

export default Home;