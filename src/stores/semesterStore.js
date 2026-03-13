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
            // Also detect active semester from the list (API embeds it)
            const active = data.find(s => s.isActive) || null;
            set({ semesters: data, activeSemester: active, isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch semesters',
                isLoading: false
            });
            throw error;
        }
    },

    // Fetch active semester (tries API first, fallback to what's in semesters list)
    fetchActiveSemester: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await semesterService.getActiveSemester();
            set({ activeSemester: data, isLoading: false });
            return data;
        } catch (error) {
            // If 404 or error, try to get active from already-loaded semesters list
            const { semesters } = get();
            const active = semesters.find(s => s.isActive) || null;
            set({ activeSemester: active, isLoading: false, error: null });
            return active;
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
                error: error.message || 'Failed to create semester',
                isLoading: false
            });
            throw error;
        }
    },

    // Activate semester - PUT /api/semesters/{id}/activate
    activateSemester: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const result = await semesterService.activateSemester(id);
            // fetchSemesters auto-detects the new activeSemester
            await get().fetchSemesters();
            return result;
        } catch (error) {
            set({
                error: error.message || 'Failed to activate semester',
                isLoading: false
            });
            throw error;
        }
    },

    // Delete semester - DELETE /api/semesters/{id}
    deleteSemester: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await semesterService.deleteSemester(id);
            set(state => ({
                semesters: state.semesters.filter(s => s.id !== id),
                activeSemester: state.activeSemester?.id === id ? null : state.activeSemester,
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.message || 'Failed to delete semester', isLoading: false });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useSemesterStore;
