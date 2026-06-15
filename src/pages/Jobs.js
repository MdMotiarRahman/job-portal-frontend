import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  DollarSign,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { getPublicJobs } from '../services/jobService';
import '../styles/jobs.css';
import { getMyApplications } from "../services/seekerService";
import authService from '../services/auth.service';

const jobTypes = ['', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const experienceLevels = ['', 'Entry', 'Mid', 'Senior'];

const getInitialFilters = (searchParams) => ({
  search: searchParams.get('search') || '',
  location: searchParams.get('location') || '',
  jobType: searchParams.get('jobType') || '',
  experienceLevel: searchParams.get('experienceLevel') || '',
});

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) {
    return 'Salary not disclosed';
  }

  const currency = salary.currency || 'USD';
  const min = salary.min ? Number(salary.min).toLocaleString() : 'Open';
  const max = salary.max ? Number(salary.max).toLocaleString() : 'Open';

  return `${currency} ${min} - ${max}`;
};

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));
  const [pagination, setPagination] = useState({
    total: 0,
    page: Number(searchParams.get('page')) || 1,
    pages: 1,
    limit: 9,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeQuery = useMemo(() => {
    const page = Number(searchParams.get('page')) || 1;
    const query = { page, limit: 9 };

    Object.entries(getInitialFilters(searchParams)).forEach(([key, value]) => {
      if (value) query[key] = value;
    });

    return query;
  }, [searchParams]);

  const loadJobs = useCallback(async () => {
  setLoading(true);
  setError('');

  try {
    const response = await getPublicJobs(activeQuery);

    let allJobs = Array.isArray(response.data)
      ? response.data
      : response.data?.jobs || [];

    try {
      const user = authService.getCurrentUser();
      if (user?.token) {
        const applicationsResponse = await getMyApplications();

        const myApplications = Array.isArray(applicationsResponse.data)
          ? applicationsResponse.data
          : applicationsResponse.data?.applications || [];

        const appliedJobIds = myApplications
          .map((app) =>
            app.job?._id ||
            app.job?.id ||
            app.jobId?._id ||
            app.jobId ||
            app.job
          )
          .filter(Boolean)
          .map(String);

        allJobs = allJobs.filter(
          (job) => !appliedJobIds.includes(String(job._id))
        );
      }
    } catch (applicationError) {
      console.log('Could not filter applied jobs', applicationError);
    }

    setJobs(allJobs);

    setPagination({
      ...(response.data?.pagination || {
        page: activeQuery.page,
        pages: 1,
        limit: activeQuery.limit,
      }),
      total: allJobs.length,
    });
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load jobs.');
  } finally {
    setLoading(false);
  }
}, [activeQuery]);

  useEffect(() => {
    setFilters(getInitialFilters(searchParams));
  }, [searchParams]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const updateSearchParams = (nextFilters, nextPage = 1) => {
    const params = {};

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    if (nextPage > 1) {
      params.page = String(nextPage);
    }

    setSearchParams(params);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateSearchParams(filters, 1);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      location: '',
      jobType: '',
      experienceLevel: '',
    };

    setFilters(clearedFilters);
    updateSearchParams(clearedFilters, 1);
  };

  const goToPage = (page) => {
    updateSearchParams(getInitialFilters(searchParams), page);
  };

  return (
    <div className="jobs-page">
      <section className="jobs-hero">
        <div className="jobs-hero-content">
          <div>
            <p className="jobs-eyebrow">Public Job Board</p>
            <h1>Find open roles from verified employers</h1>
            <p>
              Browse active openings, filter by role type, experience, and location,
              then apply when you find the right fit.
            </p>
          </div>
          <div className="jobs-hero-panel">
            <span>Live listings</span>
            <strong>{pagination.total}</strong>
            <p>Active jobs from the database</p>
          </div>
        </div>
      </section>

      <section className="jobs-shell">
        <form className="jobs-filter-panel" onSubmit={handleSubmit}>
          <div className="jobs-filter-title">
            <SlidersHorizontal size={20} />
            <span>Filter Jobs</span>
          </div>

          <label className="jobs-input-group jobs-input-wide">
            <span>Search</span>
            <div className="jobs-input-icon">
              <Search size={18} />
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Job title, skill, keyword"
              />
            </div>
          </label>

          <label className="jobs-input-group">
            <span>Location</span>
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Remote, city, country"
            />
          </label>

          <label className="jobs-input-group">
            <span>Job Type</span>
            <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
              {jobTypes.map((jobType) => (
                <option key={jobType || 'all-types'} value={jobType}>
                  {jobType || 'All Types'}
                </option>
              ))}
            </select>
          </label>

          <label className="jobs-input-group">
            <span>Experience</span>
            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleFilterChange}
            >
              {experienceLevels.map((level) => (
                <option key={level || 'all-levels'} value={level}>
                  {level || 'All Levels'}
                </option>
              ))}
            </select>
          </label>

          <div className="jobs-filter-actions">
            <button type="button" className="jobs-clear-btn" onClick={clearFilters}>
              Clear
            </button>
            <button type="submit" className="jobs-search-btn">
              Search Jobs
            </button>
          </div>
        </form>

        <div className="jobs-results-head">
          <div>
            <h2>Available Jobs</h2>
            <p>
              {loading
                ? 'Loading jobs...'
                : `${pagination.total} active ${pagination.total === 1 ? 'job' : 'jobs'} found`}
            </p>
          </div>
        </div>

        {error ? <div className="jobs-alert">{error}</div> : null}

        {loading ? (
          <div className="jobs-loading">Fetching latest jobs from the database...</div>
        ) : jobs.length === 0 ? (
          <div className="jobs-empty">
            <Briefcase size={42} />
            <h3>No jobs found</h3>
            <p>Try changing your filters or searching with a broader keyword.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <article className="jobs-card" key={job._id}>
                <div className="jobs-card-top">
                  <div className="jobs-company-mark">
                    {(job.company?.name || job.title || 'J').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company?.name || 'Verified Employer'}</p>
                  </div>
                </div>

                <p className="jobs-description">
                  {job.description?.length > 150
                    ? `${job.description.slice(0, 150)}...`
                    : job.description}
                </p>

                <div className="jobs-meta-grid">
                  <span>
                    <MapPin size={16} />
                    {job.location}
                  </span>
                  <span>
                    <Briefcase size={16} />
                    {job.jobType}
                  </span>
                  <span>
                    <Layers size={16} />
                    {job.experienceLevel}
                  </span>
                  <span>
                    <DollarSign size={16} />
                    {formatSalary(job.salary)}
                  </span>
                </div>

                {job.skills?.length ? (
                  <div className="jobs-skills">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                ) : null}

                <div className="jobs-card-footer">
                  <span className="jobs-date">
                    <Clock size={15} />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/apply-job/${job._id}`} className="jobs-apply-btn">
                    Apply Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="jobs-pagination">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || loading}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default Jobs;
