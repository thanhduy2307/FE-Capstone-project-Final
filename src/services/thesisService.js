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
     * Student - Register new topic
     * @param {Object} data - Student topic registration payload
     * @returns {Promise} 
     */
    async createStudentThesis(data) {
        try {
            // Updated to be consistent with whether it uses /api/topics or /api/topics/student-register
            // If the standard POST is /api/topics, it overlaps with CREATE. 
            // We use the specific endpoint defined in API_ENDPOINTS.
            const response = await axiosInstance.post(API_ENDPOINTS.THESIS.STUDENT_REGISTER, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Student - Resubmit a topic
     * @param {string} parentTopicId - ID of the topic being resubmitted
     * @param {Object} data - Resubmission payload
     * @returns {Promise}
     */
    async resubmitStudentThesis(parentTopicId, data) {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.THESIS.STUDENT_RESUBMIT(parentTopicId), data);
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
            const response = await axiosInstance.get(API_ENDPOINTS.THESIS.BY_STATUS(status));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get topics by semester
     * @param {number} semesterId
     * @returns {Promise}
     */
    async getTopicsBySemester(semesterId) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.THESIS.BY_SEMESTER(semesterId));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get passed topics by semester
     * @param {number} semesterId
     * @returns {Promise}
     */
    async getPassedTopicsBySemester(semesterId) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.THESIS.BY_SEMESTER_PASSED(semesterId));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get topics by submitter
     * @param {number|string} submitterId
     * @returns {Promise} List of topics submitted by the given submitterId
     */
    async getTopicsBySubmitter(submitterId) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.THESIS.BY_SUBMITTER(submitterId));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // The previous approveThesis/rejectThesis were placeholders, we now use update API endpoints.
    // i.e `PUT /api/topics/{id}`
};

export default thesisService;
