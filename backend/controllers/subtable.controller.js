// backend/controllers/subtable.controller.js
import HTTP_STATUS from '#constants/http-status.js';
import subtableService from '#services/subtable.service.js';
import {BadRequestError, ConflictError, InternalServerError, NotFoundError, UnauthorizedError} from "#errors/AppError.js"; // Include potential errors from service

class SubtableController {
    /**
     * @param {SubtableService} injectedSubtableService
     */
    constructor(injectedSubtableService) {
        this.subtableService = injectedSubtableService;
    }

    /**
     * Handles GET /s/:subtableName/posts
     * Retrieves posts for a specific subtable.
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     */
    getSubtablePosts = async (req, res) => {
        try {
            const {subtableName} = req.params;
            // Delegate fetching and logic to the service
            const posts = await this.subtableService.getSubtablePosts(subtableName);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: `Posts for subtable '${subtableName}' fetched successfully.`, // Optional success message
                data: posts // Send the data returned by the service
            });
        } catch (error) {
            console.error(`[SubtableController:getSubtablePosts] Error for ${req.params?.subtableName}:`, error.message);
            if (error instanceof NotFoundError) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            // Fallback for truly unexpected errors
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An unexpected error occurred while fetching subtable posts."
            });
        }
    };

    /**
     * Handles GET /s/:subtableName
     * Retrieves details for a specific subtable.
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     */
    getSubtableDetails = async (req, res) => {
        try {
            const {subtableName} = req.params;
            const subtableDetails = await this.subtableService.getSubtableDetails(subtableName);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: `Details for subtable '${subtableName}' fetched successfully.`,
                data: subtableDetails
            });
        } catch (error) {
            console.error(`[SubtableController:getSubtableDetails] Error for ${req.params?.subtableName}:`, error.message);
            if (error instanceof NotFoundError) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An unexpected error occurred while fetching subtable details."
            });
        }
    };

    /**
     * Handles GET /s/subscribed
     * Retrieves subtables the authenticated user is subscribed to.
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     */
    getSubscribedSubtables = async (req, res) => {
        try {
            const {userId} = req.session; // Assumes isAuthenticated middleware runs first

            const subscribedSubtables = await this.subtableService.getSubscribedSubtables(userId);
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Subscribed subtables fetched successfully.',
                data: subscribedSubtables
            });
        } catch (error) {
            console.error(`[SubtableController:getSubscribedSubtables] Error for userId ${req.session?.userId}:`, error.message);
            if (error instanceof NotFoundError) { // User not found, though unlikely if session is valid
                return res.status(HTTP_STATUS.NOT_FOUND).json({success: false, message: error.message});
            }
            if (error instanceof BadRequestError) { // Should not happen if userId is from session
                return res.status(HTTP_STATUS.BAD_REQUEST).json({success: false, message: error.message});
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success: false, message: error.message});
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An unexpected error occurred while fetching subscribed subtables."
            });
        }
    }

    /**
     * Handles GET /s/search
     * Searches for subtables based on q parameters.
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     */
    searchSubtables = async (req, res) => {
        try {
            const {q, limit, offset} = req.query;
            const searchResults = await this.subtableService.searchSubtables(q, {limit, offset});

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Search completed successfully.',
                data: searchResults
            });
        } catch (error) {
            console.error('[SubtableController:searchSubtables] Error:', error.message);
            if (error instanceof BadRequestError) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
            }
            if (error instanceof InternalServerError) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
            }
            console.error(error.stack || error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An unexpected error occurred while searching subtables."
            });
        }
    };

    /**
     * Creates a new subtable.
     * @param {import('express').Request} req - The request object.
     * @param {import('express').Response} res - The response object.
     * @param {import('express').NextFunction} next - The next middleware function.
     */
    createSubtable = async (req, res, next) => {
        try {
            const creatorUserId = req.session?.userId;
            if (!creatorUserId) {
                throw new UnauthorizedError('User must be logged in to create a subtable.');
            }

            // Sanitize name and description to ensure they are strings
            let { name, description } = req.body;
            if (Array.isArray(name)) name = name[0];
            if (Array.isArray(description)) description = description[0];

            const iconFile = req.files?.iconFile?.[0]; // Get first file from iconFile field
            const bannerFile = req.files?.bannerFile?.[0]; // Get first file from bannerFile field

            // Validate required fields
            if (!name) {
                throw new BadRequestError('Subtable name is required.');
            }

            // Create subtable with file uploads
            const subtable = await this.subtableService.createSubtable(creatorUserId, {
                name,
                description,
                iconFile,
                bannerFile
            });

            res.status(201).json({
                success: true,
                message: 'Subtable created successfully.',
                data: subtable
            });
        } catch (error) {
            next(error);
        }
    }
}

// Create and export a properly initialized instance
const subtableController = new SubtableController(subtableService);
export default subtableController;