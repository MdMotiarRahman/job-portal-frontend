import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, ChevronDown, AlertCircle, Loader, RefreshCw, Eye, ArrowRightLeft, Clock } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/adminModule.css';
import MoveApplicationModal from './MoveApplicationModal';
import CandidateDetailModal from './CandidateDetailModal';

const ALL_STAGES = [
  'Applied',
  'Screening',
  'Reviewing',
  'Shortlisted',
  'Interview Scheduled',
  'Assessment',
  'Offer Extended',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

const STAGE_COLORS = {
  Applied: '#6B7280',
  Screening: '#3B82F6',
  Reviewing: '#8B5CF6',
  Shortlisted: '#F59E0B',
  'Interview Scheduled': '#EC4899',
  Assessment: '#14B8A6',
  'Offer Extended': '#10B981',
  Accepted: '#22C55E',
  Rejected: '#EF4444',
  Withdrawn: '#9CA3AF',
};

const ATSPipelineBoard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (selectedStageFilter) filters.stage = selectedStageFilter;
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      const response = await atsService.getBoard(filters);
      if (response.success) {
        const board = response.data.board || {};
        const allApps = [];
        Object.entries(board).forEach(([stage, apps]) => {
          if (Array.isArray(apps)) {
            apps.forEach((app) => {
              allApps.push({ ...app, stage });
            });
          }
        });
        allApps.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setApplications(allApps);
      }
    } catch (err) {
      console.error('ATS Board Error:', err);
      setError(err.message || err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [selectedStageFilter, searchTerm]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  useEffect(() => {
    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, [fetchApplications]);

  const handleMoveStage = (application) => {
    setSelectedApplication(application);
    setMoveModalOpen(true);
  };

  const handleViewDetail = (application) => {
    setSelectedApplication(application);
    setDetailModalOpen(true);
  };

  const closeModals = () => {
    setSelectedApplication(null);
    setMoveModalOpen(false);
    setDetailModalOpen(false);
  };

  const stageCounts = useMemo(() => {
    const counts = {};
    ALL_STAGES.forEach((s) => (counts[s] = 0));
    applications.forEach((app) => {
      if (counts[app.stage] !== undefined) counts[app.stage]++;
    });
    return counts;
  }, [applications]);

  if (loading && applications.length === 0) {
    return (
      <div className="adm-mod">
        <div className="adm-mod-empty">
          <Loader size={28} className="adm-spin" />
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-mod">
      {error && (
        <div className="admin-alert admin-alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong>Error</strong>
              <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: 0, lineHeight: 1 }}>&times;</button>
        </div>
      )}

      <div className="adm-mod-header">
        <div className="adm-mod-header-text">
          <h1>ATS Pipeline</h1>
          <p>Track candidates through every stage of your hiring pipeline.</p>
        </div>
      </div>

      <div className="adm-mod-card">
        <div className="adm-mod-toolbar">
          <div className="adm-mod-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="adm-mod-tab"
              onClick={() => setFilterOpen(!filterOpen)}
              style={{ gap: 6 }}
            >
              <Filter size={14} />
              Stage
              <ChevronDown size={12} />
            </button>
            {filterOpen && (
              <div className="ats-filter-dropdown" style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: 'var(--bg-primary)',
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', minWidth: 220,
                maxHeight: 320, overflowY: 'auto', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <button
                  className={!selectedStageFilter ? 'adm-mod-tab active' : 'adm-mod-tab'}
                  onClick={() => { setSelectedStageFilter(''); setFilterOpen(false); }}
                  style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0 }}
                >
                  All Stages
                </button>
                {ALL_STAGES.map((stage) => (
                  <button
                    key={stage}
                    className={selectedStageFilter === stage ? 'adm-mod-tab active' : 'adm-mod-tab'}
                    onClick={() => { setSelectedStageFilter(stage); setFilterOpen(false); }}
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, gap: 8 }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: STAGE_COLORS[stage], flexShrink: 0, display: 'inline-block' }} />
                    {stage} ({stageCounts[stage]})
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="adm-mod-tab" onClick={fetchApplications} type="button">
            <RefreshCw size={14} />
            Refresh
          </button>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{applications.length}</strong> applications
          </div>
        </div>

        {loading && applications.length === 0 ? (
          <div className="adm-mod-empty"><Loader size={28} className="adm-spin" /><p>Loading...</p></div>
        ) : applications.length === 0 ? (
          <div className="adm-mod-empty">
            <Clock size={36} />
            <p>No applications found</p>
            <span>{searchTerm || selectedStageFilter ? 'Try adjusting your search or filters.' : 'No applications in the pipeline yet.'}</span>
          </div>
        ) : (
          <div className="adm-mod-table-wrap">
            <table className="adm-mod-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Stage</th>
                  <th>Applied</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          backgroundColor: STAGE_COLORS[app.stage] || '#6B7280',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0
                        }}>
                          {app.seeker?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="adm-mod-cell-main">{app.seeker?.name || 'Unknown'}</p>
                          <p className="adm-mod-cell-sub">{app.seeker?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="adm-mod-cell-main">{app.job?.title || 'N/A'}</p>
                      <p className="adm-mod-cell-sub">{app.job?.location || ''}</p>
                    </td>
                    <td>
                      <span className="adm-badge" style={{ backgroundColor: STAGE_COLORS[app.stage] || '#6B7280', color: '#fff' }}>
                        {app.stage}
                      </span>
                    </td>
                    <td className="adm-mod-date">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="adm-mod-date">{new Date(app.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-mod-view-btn" onClick={() => handleViewDetail(app)}>
                          <Eye size={13} /> View
                        </button>
                        <button className="adm-mod-view-btn" onClick={() => handleMoveStage(app)}
                          style={{ borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.06)', color: '#059669' }}>
                          <ArrowRightLeft size={13} /> Move
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailModalOpen && selectedApplication && (
        <CandidateDetailModal
          application={selectedApplication}
          stageColor={STAGE_COLORS[selectedApplication.stage]}
          onClose={closeModals}
          onMoveClick={() => { setDetailModalOpen(false); setMoveModalOpen(true); }}
        />
      )}

      {moveModalOpen && selectedApplication && (
        <MoveApplicationModal
          application={selectedApplication}
          stages={ALL_STAGES}
          onClose={closeModals}
          onSuccess={() => { fetchApplications(); closeModals(); }}
        />
      )}
    </div>
  );
};

export default ATSPipelineBoard;
