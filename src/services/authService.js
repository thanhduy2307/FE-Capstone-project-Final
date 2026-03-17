import axiosInstance from '../utils/axios.js';
import { API_ENDPOINTS } from '../config/api.config.js';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
    /**
     * Login user
     * @param {Object} credentials - { email/username, password }
     * @returns {Promise} User data and tokens
     */
    async login(credentials) {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

            // Save tokens to localStorage
            // The current test api returns `{ message: "Login successful", user: { ... } }` and optionally token.
            // If token is in response.data.token, we use it, otherwise use a default mechanism if the backend uses sessions
            const token = typeof response.data === 'string' ? response.data : response.data.token || response.data.accessToken || response.headers['authorization'];

            if (token) {
                // Remove 'Bearer ' prefix if present
                const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
                localStorage.setItem('accessToken', cleanToken);
            }

            // The API returns the user object in `response.data.user`
            const user = response.data.user || response.data;
            if (user && typeof user === 'object' && !user.message) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            return { token, ...response.data };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Register new user
     * @param {Object} userData - { email, password, fullName, role }
     * @returns {Promise} 
     */
    async register(userData) {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logout user
     * @returns {Promise}
     */
    async logout() {
        try {
            await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // Even if API call fails, clear local storage
            console.error('Logout error:', error);
        } finally {
            // Clear all auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    /**
     * Refresh access token
     * @returns {Promise} New access token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
                refreshToken,
            });

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }

            return response.data;
        } catch (error) {
            // Clear tokens if refresh fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            throw error;
        }
    },

    /**
     * Get current user info
     * @returns {Promise} Current user data
     */
    async getCurrentUser() {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.AUTH.CURRENT_USER);

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Check if user is authenticated (has valid token)
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        return !!token;
    },

    /**
     * Get stored user data
     * @returns {Object|null} User object or null
     */
    getStoredUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    },

    /**
     * Get all users
     * @returns {Promise} List of users
     */
    async getAllUsers() {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.AUTH.USERS);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get user by ID
     * @param {number|string} id 
     * @returns {Promise} User object
     */
    async getUserById(id) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.AUTH.USER_DETAIL(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get users by role
     * @param {string} role 
     * @returns {Promise} List of users
     */
    async getUsersByRole(role) {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.AUTH.USERS_BY_ROLE(role));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update user role
     * @param {number|string} id 
     * @param {string} role 
     * @returns {Promise}
     */
    async updateUserRole(id, role) {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.AUTH.UPDATE_ROLE(id), { role });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete user
     * @param {number|string} id 
     * @returns {Promise}
     */
    async deleteUser(id) {
        try {
            const response = await axiosInstance.delete(API_ENDPOINTS.AUTH.DELETE_USER(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default authService;
