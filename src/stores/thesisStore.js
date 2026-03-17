import { create } from 'zustand';
import thesisService from '../services/thesisService.js';

/**
 * Thesis Store using Zustand
 * Manages thesis/đề tài state and actions
 * This is a placeholder for future implementation
 */
const useThesisStore = create((set, get) => ({
    // State
    theses: [],
    currentThesis: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    /**
     * Fetch all theses
     * @param {Object} params - Query parameters
     */
    fetchTheses: async (params = {}) => {
        set({ isLoading: true, error: null });

        try {
            const data = await thesisService.getTheses(params);

            set({
                theses: data.theses || data,
                pagination: data.pagination || get().pagination,
                isLoading: false,
                error: null,
            });

            return { success: true, data };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || 'Failed to fetch theses',
            });

            return { success: false, error: error.message };
        }
    },

    /**
     * Fetch single thesis by ID
     * @param {string} id - Thesis ID
     */
    fetchThesisById: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const data = await thesisService.getThesisById(id);

            set({
                currentThesis: data.thesis || data,
                isLoading: false,
                error: null,
            });

            return { success: true, data };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || 'Failed to fetch thesis',
            });

            return { success: false, error: error.message };
        }
    },

    /**
     * Create new thesis
     * @param {Object} thesisData - Thesis data
     */
    createThesis: async (thesisData) => {
        set({ isLoading: true, error: null });

        try {
            const data = await thesisService.createThesis(thesisData);

            // Add new thesis to the list
            set((state) => ({
                theses: [data.thesis || data, ...state.theses],
                isLoading: false,
                error: null,
            }));

            return { success: true, data };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || 'Failed to create thesis',
            });

            return { success: false, error: error.message };
        }
    },

    /**
     * Update thesis
     * @param {string} id - Thesis ID
     * @param {Object} thesisData - Updated thesis data
     */
    updateThesis: async (id, thesisData) => {
        set({ isLoading: true, error: null });

        try {
            const data = await thesisService.updateThesis(id, thesisData);

            // Update thesis in the list
            set((state) => ({
                theses: state.theses.map((thesis) =>
                    thesis.id === id ? data.thesis || data : thesis
                ),
                currentThesis: state.currentThesis?.id === id ? data.thesis || data : state.currentThesis,
                isLoading: false,
                error: null,
            }));

            return { success: true, data };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || 'Failed to update thesis',
            });

            return { success: false, error: error.message };
        }
    },

    /**
     * Delete thesis
     * @param {string} id - Thesis ID
     */
    deleteThesis: async (id) => {
        set({ isLoading: true, error: null });

        try {
            await thesisService.deleteThesis(id);

            // Remove thesis from the list
            set((state) => ({
                theses: state.theses.filter((thesis) => thesis.id !== id),
                currentThesis: state.currentThesis?.id === id ? null : state.currentThesis,
                isLoading: false,
                error: null,
            }));

            return { success: true };
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || 'Failed to delete thesis',
            });

            return { success: false, error: error.message };
        }
    },

    /**
     * Clear current thesis
     */
    clearCurrentThesis: () => {
        set({ currentThesis: null });
    },

    /**
     * Clear error
     */
    clearError: () => {
        set({ error: null });
    },

    /**
     * Reset store
     */
    reset: () => {
        set({
            theses: [],
            currentThesis: null,
            isLoading: false,
            error: null,
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
        });
    },
}));

export default useThesisStore;
