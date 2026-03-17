import axios from 'axios';
import { apiConfig } from '../config/api.config.js';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add JWT token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');

                if (refreshToken) {
                    const response = await axios.post(
                        `${apiConfig.baseURL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { accessToken } = response.data;

                    // Save new token
                    localStorage.setItem('accessToken', accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token failed, clear storage and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data,
        });
    }
);

export default axiosInstance;
