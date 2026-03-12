import { create } from 'zustand';
import periodService from '../services/periodService.js';

const usePeriodStore = create((set, get) => ({
    periods: [],
    currentPeriod: null,
    isLoading: false,
    error: null,

    // Fetch all periods by semester
    fetchPeriods: async (semesterId) => {
        if (!semesterId) return;
        set({ isLoading: true, error: null });
        try {
            const data = await periodService.getPeriodsBySemester(semesterId);
            set({ periods: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch periods',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetch open periods by semester
    fetchOpenPeriods: async (semesterId) => {
        if (!semesterId) return;
        set({ isLoading: true, error: null });
        try {
            const data = await periodService.getOpenPeriods(semesterId);
            set({ periods: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch open periods',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetch single period
    fetchPeriod: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await periodService.getPeriod(id);
            set({ currentPeriod: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch period',
                isLoading: false
            });
            throw error;
        }
    },

    // Create period
    createPeriod: async (periodData) => {
        set({ isLoading: true, error: null });
        try {
            const newPeriod = await periodService.createPeriod(periodData);
            set(state => ({
                periods: [...state.periods, newPeriod],
                isLoading: false
            }));
            return newPeriod;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create period',
                isLoading: false
            });
            throw error;
        }
    },

    // Update period
    updatePeriod: async (id, periodData) => {
        set({ isLoading: true, error: null });
        try {
            const updatedPeriod = await periodService.updatePeriod(id, periodData);
            set(state => ({
                periods: state.periods.map(p => p.id === id ? updatedPeriod : p),
                currentPeriod: state.currentPeriod?.id === id ? updatedPeriod : state.currentPeriod,
                isLoading: false
            }));
            return updatedPeriod;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update period',
                isLoading: false
            });
            throw error;
        }
    },

    // Delete period
    deletePeriod: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await periodService.deletePeriod(id);
            set(state => ({
                periods: state.periods.filter(p => p.id !== id),
                currentPeriod: state.currentPeriod?.id === id ? null : state.currentPeriod,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete period',
                isLoading: false
            });
            throw error;
        }
    },

    // Open period
    openPeriod: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updatedPeriod = await periodService.openPeriod(id);
            set(state => ({
                periods: state.periods.map(p => p.id === id ? updatedPeriod : p),
                isLoading: false
            }));
            return updatedPeriod;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to open period',
                isLoading: false
            });
            throw error;
        }
    },

    // Close period
    closePeriod: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updatedPeriod = await periodService.closePeriod(id);
            set(state => ({
                periods: state.periods.map(p => p.id === id ? updatedPeriod : p),
                isLoading: false
            }));
            return updatedPeriod;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to close period',
                isLoading: false
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default usePeriodStore;
