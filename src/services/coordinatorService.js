import api from '../utils/axios.js';

const coordinatorService = {
    // Get theses sent from supervisors
    getReceivedTheses: async () => {
        const response = await api.get('/coordinator/theses');
        return response.data;
    },

    // Get thesis details
    getThesisDetail: async (id) => {
        const response = await api.get(`/coordinator/theses/${id}`);
        return response.data;
    },

    // Assign thesis code
    assignThesisCode: async (thesisId, code) => {
        const response = await api.post(`/coordinator/theses/${thesisId}/assign-code`, { code });
        return response.data;
    },

    // Run AI checklist
    runAIChecklist: async (thesisId) => {
        const response = await api.post(`/coordinator/theses/${thesisId}/ai-check`);
        return response.data;
    },

    // Reject thesis
    rejectThesis: async (thesisId, reason) => {
        const response = await api.post(`/coordinator/theses/${thesisId}/reject`, { reason });
        return response.data;
    },

    // Assign reviewers
    assignReviewers: async (thesisId, reviewerIds) => {
        const response = await api.post(`/coordinator/theses/${thesisId}/assign-reviewers`, {
            reviewerIds
        });
        return response.data;
    },

    // Get available reviewers
    getAvailableReviewers: async () => {
        const response = await api.get('/coordinator/reviewers');
        return response.data;
    },

    // Download thesis file
    downloadThesisFile: async (thesisId, fileId) => {
        const response = await api.get(`/coordinator/theses/${thesisId}/files/${fileId}`, {
            responseType: 'blob'
        });
        return response.data;
    },
};

export default coordinatorService;
