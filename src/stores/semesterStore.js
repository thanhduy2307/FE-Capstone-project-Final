import { create } from 'zustand';
import semesterService from '../services/semesterService.js';

const useSemesterStore = create((set, get) => ({
    semesters: [],
    activeSemester: null,
    isLoading: false,
    error: null,

    // Fetch all semesters
    fetchSemesters: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await semesterService.getSemesters();
            set({ semesters: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch semesters',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetch active semester
    fetchActiveSemester: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await semesterService.getActiveSemester();
            set({ activeSemester: data, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch active semester',
                isLoading: false
            });
            // Don't throw if it's just a 404 meaning no active semester
            if (error.response?.status !== 404) {
                throw error;
            }
            return null;
        }
    },

    // Create semester
    createSemester: async (semesterData) => {
        set({ isLoading: true, error: null });
        try {
            const newSemester = await semesterService.createSemester(semesterData);
            set(state => ({
                semesters: [...state.semesters, newSemester],
                isLoading: false
            }));
            return newSemester;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create semester',
                isLoading: false
            });
            throw error;
        }
    },

    // Activate semester
    activateSemester: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const activatedSemester = await semesterService.activateSemester(id);
            // Updating all to inactive and this one to active might require a re-fetch, but let's do locally what we can
            // Safest way is to refetch all semesters and active semester
            await get().fetchSemesters();
            await get().fetchActiveSemester();
            return activatedSemester;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to activate semester',
                isLoading: false
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useSemesterStore;
