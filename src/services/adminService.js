import api from '../utils/axios.js';

const adminService = {
    // --- USERS ---
    getAllUsers: async () => {
        const response = await api.get('/api/auth/users');
        return response.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/api/auth/users/${id}`);
        return response.data;
    },
    updateUserRole: async (id, role) => {
        const response = await api.put(`/api/auth/users/${id}/role`, { role });
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/api/auth/users/${id}`);
        return response.data;
    },
    getUsersByRole: async (role) => {
        const response = await api.get(`/api/auth/users/role/${role}`);
        return response.data;
    },

    // --- SEMESTERS ---
    getAllSemesters: async () => {
        const response = await api.get('/api/semesters');
        return response.data;
    },
    createSemester: async (data) => {
        const response = await api.post('/api/semesters', data);
        return response.data;
    },
    activateSemester: async (id) => {
        const response = await api.put(`/api/semesters/${id}/activate`);
        return response.data;
    },
    deleteSemester: async (id) => {
        const response = await api.delete(`/api/semesters/${id}`);
        return response.data;
    },

    // --- REGISTRATION PHASES ---
    createPhase: async (data) => {
        const response = await api.post('/api/registration-phases', data);
        return response.data;
    },
    openPhase: async (id) => {
        const response = await api.post(`/api/registration-phases/${id}/open`);
        return response.data;
    },
    closePhase: async (id) => {
        const response = await api.post(`/api/registration-phases/${id}/close`);
        return response.data;
    },
    deletePhase: async (id) => {
        const response = await api.delete(`/api/registration-phases/${id}`);
        return response.data;
    },
};

export default adminService;
