import { create } from 'zustand';
import supervisorService from '../services/supervisorService.js';

const useSupervisorStore = create((set, get) => ({
    myTheses: [],
    currentThesis: null,
    isLoading: false,
    error: null,

    // Fetch supervisor's theses
    fetchMyTheses: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await supervisorService.getMyTheses();
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
            const data = await supervisorService.getThesisDetail(id);
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

    // Send to coordinator
    sendToCoordinator: async (thesisId, note) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await supervisorService.sendToCoordinator(thesisId, { note });
            set(state => ({
                myTheses: state.myTheses.map(t => t.id === thesisId ? updatedThesis : t),
                currentThesis: state.currentThesis?.id === thesisId ? updatedThesis : state.currentThesis,
                isLoading: false
            }));
            return updatedThesis;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to send thesis',
                isLoading: false
            });
            throw error;
        }
    },

    // Update thesis status
    updateStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const updatedThesis = await supervisorService.updateThesisStatus(id, status);
            set(state => ({
                myTheses: state.myTheses.map(t => t.id === id ? updatedThesis : t),
                isLoading: false
            }));
            return updatedThesis;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update status',
                isLoading: false
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useSupervisorStore;
