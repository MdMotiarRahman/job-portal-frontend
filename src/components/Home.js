import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  LineChart,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import '../styles/home.css';

const featuredJobs = [
  {
    title: 'Frontend Engineer',
    company: 'Product Studio',
    location: 'Remote',
    meta: 'Full time',
    salary: '$85k - $120k',
  },
  {
    title: 'Talent Acquisition Lead',
    company: 'GrowthWorks',
    location: 'Hybrid',
    meta: 'People Ops',
    salary: '$70k - $96k',
  },
  {
    title: 'Financial Analyst',
    company: 'Northline Capital',
    location: 'On-site',
    meta: 'Finance',
    salary: '$62k - $88k',
  },
];

const categories = [
  ['Engineering', '1,240 open roles'],
  ['Operations', '680 open roles'],
  ['Design', '410 open roles'],
  ['Marketing', '735 open roles'],
  ['Finance', '520 open roles'],
  ['Customer Success', '390 open roles'],
];

const Home = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-overlay">
          <div className="home-container hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">
                <ShieldCheck size={16} />
                Verified companies, cleaner applications
              </div>

              <h1>JobPortal</h1>

              <p className="hero-lead">
                A focused hiring workspace for candidates who want relevant roles
                and employers who want organized pipelines.
              </p>

              <div className="job-search-panel" aria-label="Job search">
                <div className="search-field">
                  <Search size={18} />
                  <span>Role, skill, or company</span>
                </div>
                <div className="search-field">
                  <MapPin size={18} />
                  <span>Remote, hybrid, or city</span>
                </div>
                <Link to="/jobs" className="search-submit">
                  Search
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="hero-actions">
                <Link to="/jobs" className="home-btn home-btn-primary">
                  Browse jobs
                  <ArrowRight size={16} />
                </Link>
                <Link to="/register" className="home-btn home-btn-secondary">
                  Create account
                </Link>
              </div>
            </div>

            <div className="market-snapshot" aria-label="Hiring market snapshot">
              <div className="snapshot-header">
                <div>
                  <span className="eyebrow">Today</span>
                  <h2>Active pipeline</h2>
                </div>
                <LineChart size={22} />
              </div>

              <div className="snapshot-metrics">
                <div>
                  <strong>10.4k</strong>
                  <span>Open jobs</span>
                </div>
                <div>
                  <strong>3.8k</strong>
                  <span>Employers</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>Avg response</span>
                </div>
              </div>

              <div className="snapshot-list">
                {featuredJobs.map((job) => (
                  <Link to="/jobs" className="snapshot-job" key={job.title}>
                    <div className="job-icon">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <h3>{job.title}</h3>
                      <p>{job.company} · {job.location}</p>
                    </div>
                    <span>{job.salary}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section compact-band">
        <div className="home-container trust-row">
          <div>
            <span className="eyebrow">Built for signal</span>
            <h2>Less scrolling, better decisions.</h2>
          </div>
          <div className="trust-points">
            <span><CheckCircle2 size={16} /> Verified job posts</span>
            <span><Clock3 size={16} /> Application tracking</span>
            <span><Users size={16} /> Role-based dashboards</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-container split-section">
          <div className="section-heading">
            <span className="eyebrow">Explore roles</span>
            <h2>Popular categories</h2>
            <p>
              Jump into the areas candidates search most often, with job counts
              kept visible for quick scanning.
            </p>
          </div>

          <div className="category-grid">
            {categories.map(([name, count]) => (
              <Link to="/jobs" className="category-tile" key={name}>
                <span>{name}</span>
                <small>{count}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section muted-section">
        <div className="home-container audience-grid">
          <div className="audience-panel">
            <Building2 size={24} />
            <h2>For employers</h2>
            <p>
              Post roles, review applications, and keep candidate movement clear
              from a dedicated employer dashboard.
            </p>
            <Link to="/register">
              Start hiring
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="audience-panel">
            <Users size={24} />
            <h2>For candidates</h2>
            <p>
              Find relevant jobs, manage applications, and keep your profile ready
              for the next opportunity.
            </p>
            <Link to="/jobs">
              Find roles
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
