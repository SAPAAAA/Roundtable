import UserPostDetailsDao from '#daos/user-post-details.dao.js';

class HomeService {
    constructor(userPostDetailsDao) {
        this.userPostDetailsDao = userPostDetailsDao;
    }
    async getHomePosts() {
        try {
            return await this.userPostDetailsDao.getHomePosts();
        } catch (error) {
            console.error('(service)Error getting home posts:', error);
            throw error;
        }
    }
}

export default new HomeService(UserPostDetailsDao);