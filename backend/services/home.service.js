import userPostDetailsDao from '#daos/user-post-details.dao.js';

class HomeService {
    async getHomePosts(options = {}) {
        try {
            return await userPostDetailsDao.getHomePosts(options);
        } catch (error) {
            console.error('(service)Error getting home posts:', error);
            throw error;
        }
    }
}

export default new HomeService();