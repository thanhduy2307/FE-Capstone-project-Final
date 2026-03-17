import api from '../utils/axios.js';

const lecturerService = {
    // ==========================================
    // SUPERVISOR ROLE FUNCTIONS
    // ==========================================

    // Get theses assigned to current supervisor
    getMySupervisedTheses: async (supervisorId) => {
        const response = await api.get(`/api/topics/supervisor/${supervisorId}`);
        return response.data;
    },

    // GET /api/topics/{id} — chi tiết đề tài
    getThesisDetail: async (id) => {
        const response = await api.get(`/api/topics/${id}`);
        return response.data;
    },

    // GET /api/topics — tất cả đề tài
    getAllTopics: async () => {
        const response = await api.get('/api/topics');
        return response.data;
    },

    // GET /api/topics/{id}/inheritance — lịch sử kế thừa/nộp lại
    getTopicInheritance: async (id) => {
        const response = await api.get(`/api/topics/${id}/inheritance`);
        return response.data;
    },

    // GET /api/topics/supervisor/{supervisorId} — đề tài của GV
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
        const response = await api.get(`/api/topics/semester/${semesterId}`);
        return response.data;
    },

    // Propose / create a new thesis
    proposeThesis: async (data) => {
        const response = await api.post(`/api/topics`, data);
        return response.data;
    },

    // Update thesis
    updateThesis: async (id, data) => {
        const response = await api.put(`/api/topics/${id}`, data);
        return response.data;
    },

    // ==========================================
    // REVIEWER ROLE FUNCTIONS
    // ==========================================

    // Get theses assigned to reviewer
    getMyReviewTheses: async (reviewerId) => {
        const response = await api.get(`/api/topic-reviewers/reviewer/${reviewerId}`);
        return response.data;
    },

    // Get pending theses for reviewer
    getPendingReviewTheses: async (reviewerId) => {
        const response = await api.get(`/api/topic-reviewers/reviewer/${reviewerId}/pending`);
        return response.data;
    },

    // Submit review by assignmentId - POST /api/topic-reviewers/{topicReviewerId}/submit
    submitReview: async (topicReviewerId, data) => {
        const response = await api.post(`/api/topic-reviewers/${topicReviewerId}/submit`, data);
        return response.data;
    },

    // Submit review by topicId & reviewerId - POST /api/topic-reviewers/submit
    submitReviewByTopic: async (data) => {
        // data must include: topicId, reviewerId, decision, totalScore, comment, checklistDetails
        const response = await api.post(`/api/topic-reviewers/submit`, data);
        return response.data;
    },

    // Get review status
    getChecklistResults: async (topicReviewerId) => {
        const response = await api.get(`/api/topic-reviewers/${topicReviewerId}/checklist-results`);
        return response.data;
    },

    // Get Review Assignment Detail
    getReviewAssignmentDetail: async (topicReviewerId) => {
        const response = await api.get(`/api/topic-reviewers/${topicReviewerId}`);
        return response.data;
    }
};

export default lecturerService;
