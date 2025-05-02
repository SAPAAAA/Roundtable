import userPostDetailsDao from '#daos/userPostDetails.dao.js';
import { formatTimeAgo } from '#utils/dateFormatter.js';

class HomeService {
    async getHomePosts(options = {}) {
        try {
            const posts = await userPostDetailsDao.getHomePosts(options);
            //console.log('(service)Posts from DAO (service file BE):', posts);
            
            return posts.map(post => ({
                ...post,
                time: formatTimeAgo(post.time)
            }));
        } catch (error) {
            console.error('(service)Error getting home posts:', error);
            throw error;
        }
    }
}

export default new HomeService();