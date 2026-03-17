import api from '../utils/axios.js';

const supervisorService = {
    // Get theses assigned to current supervisor
    getMyTheses: async () => {
        const response = await api.get('/supervisor/theses');
        return response.data;
    },

    // Get thesis details
    getThesisDetail: async (id) => {
        const response = await api.get(`/supervisor/theses/${id}`);
        return response.data;
    },

    // Send thesis to coordinator
    sendToCoordinator: async (thesisId, data) => {
        const response = await api.post(`/supervisor/theses/${thesisId}/send-to-coordinator`, data);
        return response.data;
    },

    // Update thesis status
    updateThesisStatus: async (id, status) => {
        const response = await api.patch(`/supervisor/theses/${id}/status`, { status });
        return response.data;
    },

    // Download thesis file
    downloadThesisFile: async (thesisId, fileId) => {
        const response = await api.get(`/supervisor/theses/${thesisId}/files/${fileId}`, {
            responseType: 'blob'
        });
        return response.data;
    },
};

export default supervisorService;
