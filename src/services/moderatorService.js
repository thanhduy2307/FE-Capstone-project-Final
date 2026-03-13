import api from '../utils/axios.js';

const moderatorService = {
    // Get all relevant topics (working around backend enum crash by fetching specific statuses)
    getAllTopics: async () => {
        try {
            const [pending, inReview, needThird, consider] = await Promise.all([
                api.get('/api/topics/status/PENDING').catch(() => ({ data: [] })),
                api.get('/api/topics/status/IN_REVIEW').catch(() => ({ data: [] })),
                api.get('/api/topics/status/NEED_THIRD_REVIEWER').catch(() => ({ data: [] })),
                api.get('/api/topics/status/CONSIDER').catch(() => ({ data: [] }))
            ]);
            
            // Combine all valid statuses that a Moderator cares about
            return [
                ...(Array.isArray(pending.data) ? pending.data : []),
                ...(Array.isArray(inReview.data) ? inReview.data : []),
                ...(Array.isArray(needThird.data) ? needThird.data : []),
                ...(Array.isArray(consider.data) ? consider.data : [])
            ];
        } catch (error) {
            console.error("Error fetching grouped topics", error);
            return [];
        }
    },

    // Get topics that specifically need a 3rd reviewer
    getTopicsNeedThirdReviewer: async () => {
        const response = await api.get('/api/topic-reviewers/need-third-reviewer');
        return response.data;
    },

    // Get thesis details
    getThesisDetail: async (id) => {
        const response = await api.get(`/api/topics/${id}`);
        return response.data;
    },

    // Assign reviewers (R1 & R2) - POST /api/topics/{id}/assign-reviewers
    assignReviewers: async (topicId, reviewerIds) => {
        // reviewerIds is an array of exactly 2 IDs: [r1id, r2id]
        const response = await api.post(`/api/topics/${topicId}/assign-reviewers`, {
            reviewer1Id: reviewerIds[0],
            reviewer2Id: reviewerIds[1]
        });
        return response.data;
    },

    // Assign 3rd reviewer - POST /api/topic-reviewers/assign-third/{topicId}
    assignThirdReviewer: async (topicId, reviewerId) => {
        const response = await api.post(`/api/topic-reviewers/assign-third/${topicId}`, {
            reviewerId
        });
        return response.data;
    },

    // Get available reviewers (Lecturers)
    getAvailableReviewers: async () => {
        const response = await api.get('/api/auth/users/role/LECTURER');
        return response.data;
    }
};

export default moderatorService;
