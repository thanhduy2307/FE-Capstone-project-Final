import { create } from 'zustand';
import coordinatorService from '../services/coordinatorService.js';

const useCoordinatorStore = create((set, get) => ({
    theses: [],
    currentThesis: null,
    availableReviewers: [],
    isLoading: false,
    error: null,

    // Fetch received theses
    fetchTheses: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await coordinatorService.getReceivedTheses();
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
            const data = await coordinatorService.getThesisDetail(id);
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

    // Assign thesis code
    assignCode: async (thesisId, code) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await coordinatorService.assignThesisCode(thesisId, code);
            set(state => ({
                theses: state.theses.map(t => t.id === thesisId ? updatedThesis : t),
                currentThesis: state.currentThesis?.id === thesisId ? updatedThesis : state.currentThesis,
                isLoading: false
            }));
            return updatedThesis;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to assign code',
                isLoading: false
            });
            throw error;
        }
    },

    // Run AI checklist
    runAICheck: async (thesisId) => {
        set({ isLoading: true, error: null });
        try {
            const result = await coordinatorService.runAIChecklist(thesisId);
            set(state => ({
                theses: state.theses.map(t => t.id === thesisId ? { ...t, aiCheckResult: result } : t),
                currentThesis: state.currentThesis?.id === thesisId ? { ...state.currentThesis, aiCheckResult: result } : state.currentThesis,
                isLoading: false
            }));
            return result;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'AI check failed',
                isLoading: false
            });
            throw error;
        }
    },

    // Reject thesis
    rejectThesis: async (thesisId, reason) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await coordinatorService.rejectThesis(thesisId, reason);
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
            const updatedThesis = await coordinatorService.assignReviewers(thesisId, reviewerIds);
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
            const data = await coordinatorService.getAvailableReviewers();
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

export default useCoordinatorStore;
