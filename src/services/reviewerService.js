import api from '../utils/axios.js';

const reviewerService = {
    // Get theses assigned to reviewer
    getMyReviewTheses: async () => {
        const response = await api.get('/reviewer/theses');
        return response.data;
    },

    // Get thesis details
    getThesisDetail: async (id) => {
        const response = await api.get(`/reviewer/theses/${id}`);
        return response.data;
    },

    // Submit review (approve/reject)
    submitReview: async (thesisId, data) => {
        const response = await api.post(`/reviewer/theses/${thesisId}/review`, data);
        return response.data;
    },

    // Get review status (check if other reviewers voted)
    getReviewStatus: async (thesisId) => {
        const response = await api.get(`/reviewer/theses/${thesisId}/review-status`);
        return response.data;
    },

    // Download thesis file
    downloadThesisFile: async (thesisId, fileId) => {
        const response = await api.get(`/reviewer/theses/${thesisId}/files/${fileId}`, {
            responseType: 'blob'
        });
        return response.data;
    },
};

export default reviewerService;
