import axiosInstance from '../utils/axios.js';
import { API_ENDPOINTS } from '../config/api.config.js';

/**
 * Thesis Service
 * Handles all thesis/đề tài-related API calls
 * This is a placeholder for future implementation
 */
const thesisService = {
    /**
     * Get all theses
     * @param {Object} params - Query parameters (filters, pagination, etc.)
     * @returns {Promise} List of theses
     */
    async getTheses(params = {}) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.THESIS.LIST, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get single thesis by ID
     * @param {string} id - Thesis ID
     * @returns {Promise} Thesis data
     */
    async getThesisById(id) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.THESIS.DETAIL(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create new thesis
     * @param {Object} data - Thesis data
     * @returns {Promise} Created thesis
     */
    async createThesis(data) {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.THESIS.CREATE, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update thesis
     * @param {string} id - Thesis ID
     * @param {Object} data - Updated thesis data
     * @returns {Promise} Updated thesis
     */
    async updateThesis(id, data) {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.THESIS.UPDATE(id), data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete thesis
     * @param {string} id - Thesis ID
     * @returns {Promise}
     */
    async deleteThesis(id) {
        try {
            const response = await axiosInstance.delete(API_ENDPOINTS.THESIS.DELETE(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ========== ADMIN FUNCTIONS ==========

    /**
     * Get topics by status (e.g. PASS, PENDING, IN_REVIEW)
     * @param {string} status
     * @returns {Promise}
     */
    async getTopicsByStatus(status) {
        try {
            const response = await axiosInstance.get(`/api/topics/status/${status}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // The previous approveThesis/rejectThesis were placeholders, we now use update API endpoints.
    // i.e `PUT /api/topics/{id}`
};

export default thesisService;
