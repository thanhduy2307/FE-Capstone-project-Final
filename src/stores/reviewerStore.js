import { create } from 'zustand';
import reviewerService from '../services/reviewerService.js';

const useReviewerStore = create((set, get) => ({
    myTheses: [],
    currentThesis: null,
    isLoading: false,
    error: null,

    // Fetch reviewer's assigned theses
    fetchMyTheses: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await reviewerService.getMyReviewTheses();
            set({ myTheses: data, isLoading: false });
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
            const data = await reviewerService.getThesisDetail(id);
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

    // Submit review
    submitReview: async (thesisId, reviewData) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await reviewerService.submitReview(thesisId, reviewData);
            set(state => ({
                myTheses: state.myTheses.map(t => t.id === thesisId ? updatedThesis : t),
                currentThesis: state.currentThesis?.id === thesisId ? updatedThesis : state.currentThesis,
                isLoading: false
            }));
            return updatedThesis;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to submit review',
                isLoading: false
            });
            throw error;
        }
    },

    // Get review status
    getReviewStatus: async (thesisId) => {
        set({ isLoading: true, error: null });
        try {
            const status = await reviewerService.getReviewStatus(thesisId);
            set({ isLoading: false });
            return status;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to get review status',
                isLoading: false
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useReviewerStore;
