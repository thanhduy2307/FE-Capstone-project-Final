import { create } from 'zustand';
import moderatorService from '../services/moderatorService.js';

const useModeratorStore = create((set, get) => ({
    theses: [],
    currentThesis: null,
    availableReviewers: [],
    isLoading: false,
    error: null,

    // Fetch received theses
    fetchTheses: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await moderatorService.getReceivedTheses();
            set({ theses: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch theses',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetch thesis details
    fetchThesisDetail: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await moderatorService.getThesisDetail(id);
            set({ currentThesis: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch thesis details',
                isLoading: false
            });
            throw error;
        }
    },

    // Reject thesis
    rejectThesis: async (thesisId, reason) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await moderatorService.rejectThesis(thesisId, reason);
            set(state => ({
                theses: state.theses.map(t => t.id === thesisId ? updatedThesis : t),
                isLoading: false
            }));
            return updatedThesis;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to reject thesis',
                isLoading: false
            });
            throw error;
        }
    },

    // Assign reviewers
    assignReviewers: async (thesisId, reviewerIds) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await moderatorService.assignReviewers(thesisId, reviewerIds);
            set(state => ({
                theses: state.theses.map(t => t.id === thesisId ? updatedThesis : t),
                isLoading: false
            }));
            return updatedThesis;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to assign reviewers',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetch available reviewers
    fetchReviewers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await moderatorService.getAvailableReviewers();
            set({ availableReviewers: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch reviewers',
                isLoading: false
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useModeratorStore;
