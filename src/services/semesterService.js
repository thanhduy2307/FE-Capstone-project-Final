import api from '../utils/axios.js';

/**
 * Semester Service
 */
const semesterService = {
    // Get all semesters
    getSemesters: async () => {
        const response = await api.get('/api/semesters');
        return response.data;
    },

    // Get semester by ID
    getSemesterById: async (id) => {
        const response = await api.get(`/api/semesters/${id}`);
        return response.data;
    },

    // Get active semester
    getActiveSemester: async () => {
        const response = await api.get('/api/semesters/active');
        return response.data;
    },

    // Create new semester
    createSemester: async (semesterData) => {
        const response = await api.post('/api/semesters', semesterData);
        return response.data;
    },

    // Activate semester
    activateSemester: async (id) => {
        const response = await api.put(`/api/semesters/${id}/activate`);
        return response.data;
    },

    // Delete semester
    deleteSemester: async (id) => {
        const response = await api.delete(`/api/semesters/${id}`);
        return response.data;
    }
};

export default semesterService;
