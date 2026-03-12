import api from '../utils/axios.js';

const moderatorService = {
    // Get theses sent from supervisors
    getReceivedTheses: async () => {
        const response = await api.get('/api/topics'); // Placeholder, may need adjustment based on exact BE routes
        return response.data;
    },

    // Get thesis details
    getThesisDetail: async (id) => {
        const response = await api.get(`/api/topics/${id}`);
        return response.data;
    },

    // Reject thesis
    rejectThesis: async (thesisId, reason) => {
        // Will need to be adapted to matching API endpoint
        const response = await api.put(`/api/topics/${thesisId}`, { status: 'FAIL', reason });
        return response.data;
    },

    // Assign reviewers
    assignReviewers: async (topicId, reviewerIds) => {
        const response = await api.post(`/api/topic-reviewers/assign/${topicId}`, {
            reviewerIds
        });
        return response.data;
    },

    // Assign 3rd reviewer
    assignThirdReviewer: async (topicId, reviewerId) => {
        const response = await api.post(`/api/topic-reviewers/assign-third/${topicId}`, {
            reviewerId
        });
        return response.data;
    },

    // Get available reviewers
    getAvailableReviewers: async () => {
        const response = await api.get('/api/auth/users/role/LECTURER');
        return response.data;
    }
};

export default moderatorService;
