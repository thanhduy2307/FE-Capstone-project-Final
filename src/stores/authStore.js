import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService.js';

/**
 * Authentication Store using Zustand
 * Manages user authentication state and actions
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            /**
             * Login action
             * @param {Object} credentials - { email/username, password }
             */
            login: async (credentials) => {
                set({ isLoading: true, error: null });

                try {
                    const data = await authService.login(credentials);

                    set({
                        user: data.user,
                        token: data.accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return { success: true, data };
                } catch (error) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message || 'Login failed',
                    });

                    return { success: false, error: error.message };
                }
            },

            /**
             * Register action
             * @param {Object} userData - { email, password, fullName, role }
             */
            register: async (userData) => {
                set({ isLoading: true, error: null });

                try {
                    const data = await authService.register(userData);

                    set({
                        isLoading: false,
                        error: null,
                    });

                    return { success: true, data };
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Registration failed',
                    });

                    return { success: false, error: error.message };
                }
            },

            /**
             * Logout action
             */
            logout: async () => {
                set({ isLoading: true });

                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            /**
             * Set user data
             * @param {Object} user - User object
             */
            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            /**
             * Set token
             * @param {string} token - JWT token
             */
            setToken: (token) => {
                set({ token, isAuthenticated: !!token });
            },

            /**
             * Check authentication status
             * Verifies if user is still authenticated and refreshes user data
             */
            checkAuth: async () => {
                const isAuth = authService.isAuthenticated();

                if (!isAuth) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                    return false;
                }

                // Get stored user data
                const storedUser = authService.getStoredUser();
                const storedToken = localStorage.getItem('accessToken');

                if (storedUser && storedToken) {
                    set({
                        user: storedUser,
                        token: storedToken,
                        isAuthenticated: true,
                    });

                    // Optionally fetch fresh user data from API
                    try {
                        const data = await authService.getCurrentUser();
                        set({ user: data.user });
                    } catch (error) {
                        console.error('Error fetching current user:', error);
                        // Keep using stored user data if API call fails
                    }

                    return true;
                }

                return false;
            },

            /**
             * Clear error
             */
            clearError: () => {
                set({ error: null });
            },

            /**
             * Check if user has specific role
             * @param {string|string[]} roles - Role or array of roles to check
             * @returns {boolean}
             */
            hasRole: (roles) => {
                const { user } = get();
                if (!user || !user.role) return false;

                const rolesArray = Array.isArray(roles) ? roles : [roles];
                return rolesArray.includes(user.role);
            },
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
