import api from './api';

const recommendationService = {
  getJobRecommendations: async (limit = 10) => {
    const response = await api.get('/recommendations/jobs', { params: { limit } });
    return response.data;
  },

  getCandidateFitScores: async () => {
    const response = await api.get('/recommendations/candidates');
    return response.data;
  },

  getJobCandidateRanking: async (jobId) => {
    const response = await api.get(`/recommendations/candidates/${jobId}`);
    return response.data;
  },
};

export default recommendationService;
