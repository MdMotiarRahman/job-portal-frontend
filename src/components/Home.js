import React, { useEffect, useMemo, useState } from 'react';
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
import { getPublicJobSnapshot } from '../services/jobService';
import '../styles/home.css';

const categories = [
  ['Engineering', '1,240 open roles'],
  ['Operations', '680 open roles'],
  ['Design', '410 open roles'],
  ['Marketing', '735 open roles'],
  ['Finance', '520 open roles'],
  ['Customer Success', '390 open roles'],
];

const formatCompactNumber = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000) {
    return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}k`;
  }

  return number.toLocaleString();
};

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) {
    return 'Salary open';
  }

  const currency = salary.currency || 'USD';
  const min = salary.min ? Number(salary.min).toLocaleString() : 'Open';
  const max = salary.max ? Number(salary.max).toLocaleString() : 'Open';

  return `${currency} ${min} - ${max}`;
};

const getCompanyName = (company) => {
  if (!company) return 'Verified employer';
  return company.name || company.email || 'Verified employer';
};

const Home = () => {
  const [snapshot, setSnapshot] = useState({
    metrics: {
      openJobs: 0,
      employers: 0,
      recentApplications: 0,
    },
    featuredJobs: [],
  });
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState('');

  useEffect(() => {
    const loadSnapshot = async () => {
      setSnapshotLoading(true);
      setSnapshotError('');

      try {
        const response = await getPublicJobSnapshot();
        setSnapshot({
          metrics: response.data.metrics || {
            openJobs: 0,
            employers: 0,
            recentApplications: 0,
          },
          featuredJobs: response.data.featuredJobs || [],
        });
      } catch (error) {
        setSnapshotError(
          error.response?.data?.message || 'Live snapshot unavailable'
        );
      } finally {
        setSnapshotLoading(false);
      }
    };

    loadSnapshot();
  }, []);

  const metrics = useMemo(() => {
    return [
      {
        value: formatCompactNumber(snapshot.metrics.openJobs),
        label: 'Open jobs',
      },
      {
        value: formatCompactNumber(snapshot.metrics.employers),
        label: 'Employers',
      },
      {
        value: formatCompactNumber(snapshot.metrics.recentApplications),
        label: 'Applications / 30d',
      },
    ];
  }, [snapshot.metrics]);

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
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <strong>{snapshotLoading ? '-' : metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>

              <div className="snapshot-list">
                {snapshotLoading && (
                  <div className="snapshot-state">Loading live jobs...</div>
                )}

                {!snapshotLoading && snapshotError && (
                  <div className="snapshot-state error">{snapshotError}</div>
                )}

                {!snapshotLoading && !snapshotError && snapshot.featuredJobs.length === 0 && (
                  <div className="snapshot-state">No active jobs found yet.</div>
                )}

                {!snapshotLoading && !snapshotError && snapshot.featuredJobs.map((job) => (
                  <Link to="/jobs" className="snapshot-job" key={job._id || job.title}>
                    <div className="job-icon">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <h3>{job.title}</h3>
                      <p>{getCompanyName(job.company)} - {job.location}</p>
                    </div>
                    <span>{formatSalary(job.salary)}</span>
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
