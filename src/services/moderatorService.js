import api from '../utils/axios.js';

const moderatorService = {
    // =============================================
    // TOPIC QUERIES
    // =============================================

    // Get all relevant topics (by status)
    getAllTopics: async () => {
        try {
            const [pending, waiting1, waiting2, inReview, needThird, consider] = await Promise.all([
                api.get('/api/topics/status/PENDING').catch(() => ({ data: [] })),
                api.get('/api/topics/status/WATTING_MODERATOR').catch(() => ({ data: [] })),
                api.get('/api/topics/status/WAITING_MODERATOR').catch(() => ({ data: [] })),
                api.get('/api/topics/status/IN_REVIEW').catch(() => ({ data: [] })),
                api.get('/api/topics/status/NEED_THIRD_REVIEWER').catch(() => ({ data: [] })),
                api.get('/api/topics/status/CONSIDER').catch(() => ({ data: [] }))
            ]);
            return [
                ...(Array.isArray(pending.data)   ? pending.data   : []),
                ...(Array.isArray(waiting1.data)  ? waiting1.data  : []),
                ...(Array.isArray(waiting2.data)  ? waiting2.data  : []),
                ...(Array.isArray(inReview.data)  ? inReview.data  : []),
                ...(Array.isArray(needThird.data) ? needThird.data : []),
                ...(Array.isArray(consider.data)  ? consider.data  : [])
            ];
        } catch (error) {
            console.error('Error fetching grouped topics', error);
            return [];
        }
    },

    // GET /api/topics/{id} — chi tiết đề tài
    getThesisDetail: async (id) => {
        const response = await api.get(`/api/topics/${id}`);
        return response.data;
    },

    // GET /api/topics — tất cả đề tài (all roles)
    getAllTopicsFlat: async () => {
        const response = await api.get('/api/topics');
        return response.data;
    },

    // GET /api/topics/{id}/inheritance — lịch sử kế thừa/nộp lại
    getTopicInheritance: async (id) => {
        const response = await api.get(`/api/topics/${id}/inheritance`);
        return response.data;
    },

    // GET /api/topics/supervisor/{supervisorId} — đề tài của một GV
    getTopicsBySupervisor: async (supervisorId) => {
        const response = await api.get(`/api/topics/supervisor/${supervisorId}`);
        return response.data;
    },

    // GET /api/topics/status/{status} — lọc theo trạng thái
    getTopicsByStatus: async (status) => {
        const response = await api.get(`/api/topics/status/${status}`);
        return response.data;
    },

    // GET /api/topics/semester/{semesterId} — lọc theo học kỳ
    getTopicsBySemester: async (semesterId) => {
        try {
            const [base, waiting1, waiting2] = await Promise.all([
                api.get(`/api/topics/semester/${semesterId}`).catch(() => ({ data: [] })),
                api.get('/api/topics/status/WATTING_MODERATOR').catch(() => ({ data: [] })),
                api.get('/api/topics/status/WAITING_MODERATOR').catch(() => ({ data: [] }))
            ]);
            
            const baseData = Array.isArray(base.data) ? base.data : [];
            const w1Data = Array.isArray(waiting1.data) ? waiting1.data : [];
            const w2Data = Array.isArray(waiting2.data) ? waiting2.data : [];
            
            // Filter waiting data to ensure it belongs to this semester
            const w1Filtered = w1Data.filter(t => t.semester?.id === parseInt(semesterId) || t.semesterId === parseInt(semesterId));
            const w2Filtered = w2Data.filter(t => t.semester?.id === parseInt(semesterId) || t.semesterId === parseInt(semesterId));
            
            // Merge and remove duplicates by ID
            const merged = [...baseData, ...w1Filtered, ...w2Filtered];
            const unique = [];
            const map = new Map();
            for (const item of merged) {
                if (!map.has(item.id)) {
                    map.set(item.id, true);
                    unique.push(item);
                }
            }
            return unique;
        } catch (error) {
            console.error('Error fetching semester topics', error);
            return [];
        }
    },

    // =============================================
    // ASSIGN REVIEWERS — two equivalent endpoints
    // =============================================

    // POST /api/topic-reviewers/assign/{topicId}  (primary)
    assignReviewers: async (topicId, reviewerIds) => {
        const response = await api.post(`/api/topic-reviewers/assign/${topicId}`, { reviewerIds });
        return response.data;
    },

    // POST /api/topics/{id}/assign-reviewers  (alt / fallback)
    assignReviewersAlt: async (topicId, reviewerIds) => {
        const response = await api.post(`/api/topics/${topicId}/assign-reviewers`, { reviewerIds });
        return response.data;
    },

    // =============================================
    // ASSIGN THIRD REVIEWER — two equivalent endpoints
    // =============================================

    // POST /api/topic-reviewers/assign-third/{topicId}  (primary)
    assignThirdReviewer: async (topicId, reviewerId) => {
        const response = await api.post(`/api/topic-reviewers/assign-third/${topicId}`, { reviewerId });
        return response.data;
    },

    // POST /api/topics/{id}/assign-third-reviewer  (alt / fallback)
    assignThirdReviewerAlt: async (topicId, reviewerId) => {
        const response = await api.post(`/api/topics/${topicId}/assign-third-reviewer`, { reviewerId });
        return response.data;
    },

    // =============================================
    // FINALIZE
    // =============================================

    // POST /api/topics/{id}/finalize  — Chốt đề tài FINALIZED
    finalizeTopic: async (topicId) => {
        const response = await api.post(`/api/topics/${topicId}/finalize`);
        return response.data;
    },

    // =============================================
    // TOPIC-REVIEWERS QUERIES
    // =============================================

    // GET /api/topic-reviewers/need-third-reviewer
    getTopicsNeedThirdReviewer: async () => {
        const response = await api.get('/api/topic-reviewers/need-third-reviewer');
        return response.data;
    },

    // GET /api/topic-reviewers/topic/{topicId}
    getTopicReviewers: async (topicId) => {
        const response = await api.get(`/api/topic-reviewers/topic/${topicId}`);
        return response.data;
    },

    // GET /api/topic-reviewers/{id}
    getReviewAssignmentDetail: async (id) => {
        const response = await api.get(`/api/topic-reviewers/${id}`);
        return response.data;
    },

    // GET /api/topic-reviewers/stats/{semesterId}
    getReviewerStats: async (semesterId) => {
        const response = await api.get(`/api/topic-reviewers/stats/${semesterId}`);
        return response.data;
    },

    // =============================================
    // HELPERS
    // =============================================

    // GET all lecturers (for reviewer picker)
    getAvailableReviewers: async () => {
        const response = await api.get('/api/auth/users/role/LECTURER');
        return response.data;
    },
};

export default moderatorService;
