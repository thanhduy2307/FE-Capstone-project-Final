import { create } from 'zustand';
import lecturerService from '../services/lecturerService.js';

const useLecturerStore = create((set, get) => ({
    supervisedTheses: [],
    reviewTheses: [],
    currentThesis: null,
    isLoading: false,
    error: null,

    // ==========================================
    // SUPERVISOR ACTIONS
    // ==========================================

    fetchSupervisedTheses: async (lecturerId) => {
        if (!lecturerId) return;
        set({ isLoading: true, error: null });
        try {
            const data = await lecturerService.getMySupervisedTheses(lecturerId);
            set({ supervisedTheses: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch supervised theses',
                isLoading: false
            });
            throw error;
        }
    },

    fetchThesisDetail: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await lecturerService.getThesisDetail(id);
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

    // ==========================================
    // REVIEWER ACTIONS
    // ==========================================

    fetchReviewTheses: async (lecturerId) => {
        if (!lecturerId) return;
        set({ isLoading: true, error: null });
        try {
            const data = await lecturerService.getMyReviewTheses(lecturerId);
            set({ reviewTheses: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch review theses',
                isLoading: false
            });
            throw error;
        }
    },

    submitReview: async (topicReviewerId, reviewData) => {
        set({ isLoading: true, error: null });
        try {
            const result = await lecturerService.submitReview(topicReviewerId, reviewData);
            // After submitting review, might want to refresh lists
            set({ isLoading: false });
            return result;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to submit review',
                isLoading: false
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useLecturerStore;
