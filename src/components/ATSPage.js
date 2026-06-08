import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ATSDashboard from './ATSDashboard';
import ATSPipelineBoard from './ATSPipelineBoard';
import '../styles/atsPage.css';

const ATSPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const basePath = location.pathname.startsWith('/employer/ats') ? '/employer/ats' : '/admin/ats';
  const activeTab = useMemo(() => {
    return location.pathname.includes('/analytics') ? 'analytics' : 'board';
  }, [location.pathname]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (tab) => {
    navigate(tab === 'analytics' ? `${basePath}/analytics` : basePath);
  };

  return (
    <div className="ats-page-container">
      <div className="ats-page-tabs">
        <button
          className={`ats-page-tab ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => handleTabChange('board')}
        >
          Pipeline Board
        </button>
        <button
          className={`ats-page-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          Analytics & Reports
        </button>
      </div>

      <div className="ats-page-content">
        {activeTab === 'board' && (
          <div className="ats-page-section" key={`board-${refreshKey}`}>
            <ATSPipelineBoard />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="ats-page-section" key={`analytics-${refreshKey}`}>
            <ATSDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSPage;
