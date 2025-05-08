import homeService from '#services/home.service.js';
import HTTP_STATUS from '#constants/http-status.js';

class HomeController {
    constructor() {
        this.service = homeService;
        this.getHomePosts = this.getHomePosts.bind(this);
    }
    async getHomePosts(req, res, next) {
        try {
            const posts = await this.service.getHomePosts();
            console.log(`(controller)Received ${posts?.length || 0} posts from service`);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: posts
            });
        } catch (error) {
            console.error('(controller)[HomeController.getHomePosts] Error:', error.message);
            console.error('(controller)[HomeController.getHomePosts] Stack:', error.stack);
            next(error);
        }
    }
}

export default new HomeController();