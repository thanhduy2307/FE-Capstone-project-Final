import api from '../utils/axios.js';

/**
 * Period Service (Registration Phases)
 */
const periodService = {
    // Get Registration Phases by Semester
    getPeriodsBySemester: async (semesterId) => {
        const response = await api.get(`/api/registration-phases/semester/${semesterId}`);
        return response.data;
    },

    // Get Open Phases
    getOpenPeriods: async (semesterId) => {
        const response = await api.get(`/api/registration-phases/semester/${semesterId}/open`);
        return response.data;
    },

    // Get single period
    getPeriod: async (id) => {
        const response = await api.get(`/api/registration-phases/${id}`);
        return response.data;
    },

    // Create period (Registration Phase)
    createPeriod: async (periodData) => {
        const response = await api.post('/api/registration-phases', periodData);
        return response.data;
    },

    // Update period (Assuming PUT exists, or we might not need it based on docs. Docs didn't specify PUT, only POST to close/open)
    updatePeriod: async (id, periodData) => {
        const response = await api.put(`/api/registration-phases/${id}`, periodData);
        return response.data;
    },

    // Open period
    openPeriod: async (id) => {
        const response = await api.post(`/api/registration-phases/${id}/open`);
        return response.data;
    },

    // Close period
    closePeriod: async (id) => {
        const response = await api.post(`/api/registration-phases/${id}/close`);
        return response.data;
    },

    // Delete period
    deletePeriod: async (id) => {
        const response = await api.delete(`/api/registration-phases/${id}`);
        return response.data;
    }
};

export default periodService;
