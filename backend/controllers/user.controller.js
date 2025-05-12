import HTTP_STATUS from '#constants/http-status.js';
import userService from '#services/user.service.js';
import {BadRequestError, InternalServerError} from '#errors/AppError.js';

class UserController {
    /**
     * Handles GET /users/search
     * Searches users based on q parameters
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    searchUsers = async (req, res) => {
        try {
            const {q, limit = 5} = req.query;

            if (!q) {
                throw new BadRequestError('Search q is required');
            }

            const searchResults = await userService.searchUsers({
                q,
                limit: parseInt(limit)
            });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: searchResults
            });
        } catch (error) {
            console.error('[UserController:searchUsers] Error:', error.message);
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An unexpected error occurred while searching users.'
            });
        }
    };
}

export default new UserController(); 