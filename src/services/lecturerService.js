import api from '../utils/axios.js';

const lecturerService = {
    // ==========================================
    // SUPERVISOR ROLE FUNCTIONS
    // ==========================================

    // Get theses assigned to current supervisor
    getMySupervisedTheses: async (supervisorId) => {
        const response = await api.get(`/api/topics/supervisor/${supervisorId}`);
        return response.data;
    },

    // Get thesis details
    getThesisDetail: async (id) => {
        const response = await api.get(`/api/topics/${id}`);
        return response.data;
    },

    // Propose / create a new thesis
    proposeThesis: async (data) => {
        const response = await api.post(`/api/topics`, data);
        return response.data;
    },

    // Update thesis
    updateThesis: async (id, data) => {
        const response = await api.put(`/api/topics/${id}`, data);
        return response.data;
    },

    // ==========================================
    // REVIEWER ROLE FUNCTIONS
    // ==========================================

    // Get theses assigned to reviewer
    getMyReviewTheses: async (reviewerId) => {
        const response = await api.get(`/api/topic-reviewers/reviewer/${reviewerId}`);
        return response.data;
    },

    // Get pending theses for reviewer
    getPendingReviewTheses: async (reviewerId) => {
        const response = await api.get(`/api/topic-reviewers/reviewer/${reviewerId}/pending`);
        return response.data;
    },

    // Submit review (approve=1 / reject=-1)
    submitReview: async (topicReviewerId, data) => {
        const response = await api.post(`/api/topic-reviewers/${topicReviewerId}/submit`, data);
        return response.data;
    },

    // Get review status
    getChecklistResults: async (topicReviewerId) => {
        const response = await api.get(`/api/topic-reviewers/${topicReviewerId}/checklist-results`);
        return response.data;
    }
};

export default lecturerService;
