import homeService from '#services/home.service.js';
import HTTP_STATUS from '#constants/httpStatus.js';

class HomeController {
 
    constructor() {
        this.service = homeService;
        // Bind method để đảm bảo this luôn đúng context
        this.getHomePosts = this.getHomePosts.bind(this);
    }

  
    async getHomePosts(req, res, next) {
   

        try {
            //console.log('(controller)Request query params:', req.query);
            
            const { limit, offset, sortBy, order } = req.query;
            
            // Chuyển đổi các tham số query thành số nếu có thể
            const options = {
                limit: limit ? parseInt(limit, 10) : undefined,
                offset: offset ? parseInt(offset, 10) : undefined,
                sortBy,
                order
            };
            
            console.log('(controller)Processed options:', options);
          
            const posts = await this.service.getHomePosts(options);
            console.log(`(controller)Received ${posts?.length || 0} posts from service`);
            
            // Log mẫu bài đầu tiên nếu có
            // if (posts && posts.length > 0) {
            //     console.log('(controller)First post sample:', JSON.stringify(posts[0], null, 2));
            // }
            
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