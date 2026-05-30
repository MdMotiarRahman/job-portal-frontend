import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, FileText, MapPin, Send } from 'lucide-react';
import { getPublicJobById } from '../services/jobService';
import { applyJob } from '../services/seekerService';
import '../styles/applyJob.css';

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
  });
  const [resume, setResume] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      setLoadingJob(true);
      setError('');

      try {
        const response = await getPublicJobById(id);
        setJob(response.data.job);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this job.');
      } finally {
        setLoadingJob(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      data.append('jobId', id);
      data.append('jobTitle', job?.title || '');
      data.append('coverLetter', formData.coverLetter);

      if (resume) {
        data.append('resume', resume);
      }

      await applyJob(data);
      setSuccess('Application submitted successfully.');
      setFormData({ coverLetter: '' });
      setResume(null);

      window.setTimeout(() => {
        navigate('/seeker');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-job-page">
      <div className="apply-job-shell">
        <Link to="/jobs" className="apply-back-link">
          <ArrowLeft size={16} />
          Back to jobs
        </Link>

        <section className="apply-card">
          <div className="apply-card-header">
            <div>
              <p className="apply-kicker">Job Application</p>
              <h1>{loadingJob ? 'Loading job...' : job?.title || 'Apply for this role'}</h1>
              {job ? (
                <div className="apply-job-meta">
                  <span>
                    <Briefcase size={15} />
                    {job.company?.name || 'Verified Employer'}
                  </span>
                  <span>
                    <MapPin size={15} />
                    {job.location}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {error ? <div className="apply-alert apply-alert-error">{error}</div> : null}
          {success ? <div className="apply-alert apply-alert-success">{success}</div> : null}

          <form onSubmit={handleSubmit} className="apply-form">
            <label>
              <span>Cover Letter</span>
              <textarea
                name="coverLetter"
                placeholder="Write a short note about why you are a good fit for this role."
                value={formData.coverLetter}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Resume PDF</span>
              <div className="apply-file-input">
                <FileText size={18} />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(event) => setResume(event.target.files[0] || null)}
                />
              </div>
            </label>

            <button type="submit" disabled={submitting || loadingJob || !job}>
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ApplyJob;
