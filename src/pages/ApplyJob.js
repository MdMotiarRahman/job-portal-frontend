import React, { useState } from 'react';
import { applyJob } from '../services/seekerService';
import '../styles/applyJob.css';

const ApplyJob = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    coverLetter: '',
  });

  const [resume, setResume] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append('jobTitle', formData.jobTitle);
      data.append('coverLetter', formData.coverLetter);

      if (resume) {
        data.append('resume', resume);
      }

      await applyJob(data);

      alert('Application submitted successfully');

      setFormData({
        jobTitle: '',
        coverLetter: '',
      });

      setResume(null);
    } catch (error) {
      console.log(error);
      alert('Error applying');
    }
  };

  return (
    <div className="apply-job-page">
      <div className="apply-card">
        <h1>Apply Job</h1>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />

          <textarea
            name="coverLetter"
            placeholder="Cover Letter"
            value={formData.coverLetter}
            onChange={handleChange}
            required
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files[0])}
          />

          <button type="submit">
            Submit Application
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyJob;