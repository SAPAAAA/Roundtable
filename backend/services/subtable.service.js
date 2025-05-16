// backend/services/subtable.service.js
import userPostDetailsDAO from '#daos/user-post-details.dao.js';
import userProfileDAO from '#daos/user-profile.dao.js';
import subtableDAO from '#daos/subtable.dao.js';
import subscriptionDAO from '#daos/subscription.dao.js';
import moderatorDAO from '#daos/moderator.dao.js';
import {AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError} from "#errors/AppError.js";
import Subtable from "#models/subtable.model.js";
import Subscription from "#models/subscription.model.js";
import Moderator from "#models/moderator.model.js";
import {postgresInstance} from "#db/postgres.js";
import mediaService from './media.service.js';


class SubtableService {
    /**
     * Constructor for SubtableService.
     * @param {SubtableDAO} subtableDao - Data Access Object for subtables.
     * @param {UserPostDetailsDAO} userPostDetailsDao - DAO for the user_post_details view/q.
     * @param {UserProfileDAO} userProfileDao - DAO for user profiles.
     */
    constructor(subtableDao, userPostDetailsDao, userProfileDao, subscriptionDao, moderatorDao) {
        this.subtableDao = subtableDao;
        this.userPostDetailsDao = userPostDetailsDao;
        this.userProfileDao = userProfileDao;
        this.subscriptionDao = subscriptionDao;
        this.moderatorDao = moderatorDao;
    }

    /**
     * Retrieves all posts belonging to a specific subtable.
     * @param {string} subtableName - The name of the subtable.
     * @returns {Promise<Array<UserPostDetails>>} A promise that resolves to an array of post details.
     * @throws {BadRequestError} If subtableName is not provided.
     * @throws {NotFoundError} If the subtable does not exist.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async getSubtablePosts(subtableName) {
        if (!subtableName || typeof subtableName !== 'string' || subtableName.trim() === '') {
            throw new BadRequestError("Subtable name is required and must be a non-empty string.");
        }

        try {
            // Fetch subtable details first to get the ID
            const subtable = await this.subtableDao.getByName(subtableName.trim());
            if (!subtable) {
                throw new NotFoundError(`Subtable '${subtableName}' not found.`);
            }

            // Fetch posts using the subtable ID from the UserPostDetails view
            return await this.userPostDetailsDao.getBySubtableId(subtable.subtableId);

        } catch (error) {
            // Re-throw known application errors
            if (error instanceof AppError) {
                throw error;
            }
            // Wrap unexpected DAO/database errors
            console.error(`[SubtableService:getSubtablePosts] Error for ${subtableName}:`, error);
            throw new InternalServerError("An error occurred while fetching subtable posts.");
        }
    }

    /**
     * Retrieves the details of a specific subtable.
     * @param {string} subtableName - The name of the subtable.
     * @returns {Promise<Subtable>} A promise that resolves to the subtable details object.
     * @throws {BadRequestError} If subtableName is not provided.
     * @throws {NotFoundError} If the subtable does not exist.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async getSubtableDetails(subtableName) {
        if (!subtableName || typeof subtableName !== 'string' || subtableName.trim() === '') {
            throw new BadRequestError("Subtable name is required and must be a non-empty string.");
        }

        try {
            const subtable = await this.subtableDao.getByName(subtableName.trim());
            if (!subtable) {
                throw new NotFoundError(`Subtable '${subtableName}' not found.`);
            }
            return subtable; // Return the Subtable model instance

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error(`[SubtableService:getSubtableDetails] Error for ${subtableName}:`, error);
            throw new InternalServerError("An error occurred while fetching subtable details.");
        }
    }

    /**
     * Retrieves the list of subtables a user is subscribed to.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Array<Subtable>>} A promise that resolves to an array of subscribed subtable details.
     * @throws {BadRequestError} If userId is not provided.
     * @throws {NotFoundError} If the user does not exist.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async getSubscribedSubtables(userId) {
        if (!userId) {
            throw new BadRequestError("User ID is required to fetch subscribed subtables.");
        }

        try {
            // Optional: Check if user exists first using UserProfileDAO for a clearer NotFoundError
            const userExists = await this.userProfileDao.getByUserId(userId);
            if (!userExists) {
                // Throw specific error if the user initiating the request doesn't exist
                throw new NotFoundError(`User with ID '${userId}' not found.`);
            }

            // Fetch subscribed subtables using subtableDAO's dedicated method
            return await this.subtableDao.getSubscribedSubtables(userId);

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error(`[SubtableService:getSubscribedSubtables] Error for userId ${userId}:`, error);
            throw new InternalServerError("An error occurred while fetching subscribed subtables.");
        }
    }

    /**
     * Creates a new subtable.
     * @param {string} creatorUserId - The ID of the user creating the subtable.
     * @param {object} subtableData - Data for the new subtable { name, description, iconFile, bannerFile }.
     * @param {Object} [subtableData.iconFile] - The uploaded icon file from multer.
     * @param {Object} [subtableData.bannerFile] - The uploaded banner file from multer.
     * @returns {Promise<Subtable>} The newly created subtable.
     * @throws {BadRequestError} For invalid input.
     * @throws {NotFoundError} If creator user doesn't exist.
     * @throws {ConflictError} If subtable name is taken.
     * @throws {InternalServerError} For database errors.
     */
    async createSubtable(creatorUserId, subtableData) {
        // 1. Validate creatorUserId and subtableData
        if (!creatorUserId || !subtableData || !subtableData.name) {
            throw new BadRequestError("Invalid input for creating a subtable.");
        }

        // 2. Check if creator user exists
        try {
            const userExists = await this.userProfileDao.getByUserId(creatorUserId);
            if (!userExists) {
                throw new NotFoundError(`User with ID '${creatorUserId}' not found.`);
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Failed to verify user existence.");
        }

        const {name, description, iconFile, bannerFile} = subtableData;

        // 3. Process file uploads and create media records
        let iconMediaId = null;
        let bannerMediaId = null;

        try {
            // Create media records for uploaded files
            if (iconFile) {
                const iconMedia = await mediaService.createMediaRecord(creatorUserId, iconFile);
                iconMediaId = iconMedia.mediaId;
            }
            if (bannerFile) {
                const bannerMedia = await mediaService.createMediaRecord(creatorUserId, bannerFile);
                bannerMediaId = bannerMedia.mediaId;
            }

            // 4. Create the subtable with media IDs
            const subtable = new Subtable(
                null,
                name,
                description,
                creatorUserId,
                iconMediaId, // Store media ID instead of file path
                bannerMediaId, // Store media ID instead of file path
                0 // Initial member count
            );

            // 5. Save to database within a transaction
            return await postgresInstance.transaction(async (trx) => {
                try {
                    const createdSubtable = await this.subtableDao.create(subtable, trx);
                    return createdSubtable;
                } catch (error) {
                    // If subtable creation fails, clean up any created media records
                    if (iconMediaId) {
                        await mediaService.deleteMedia(iconMediaId).catch(console.error);
                    }
                    if (bannerMediaId) {
                        await mediaService.deleteMedia(bannerMediaId).catch(console.error);
                    }
                    throw error;
                }
            });
        } catch (error) {
            console.error('[SubtableService] Error creating subtable:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError('Failed to create subtable.');
        }
    }

    /**
     * Searches subtables based on q parameters
     * @param {string} q - Search q string
     * @param {object} options - Search options
     * @param {number} [options.limit=25] - Maximum number of results
     * @param {number} [options.offset=0] - Number of results to skip
     * @returns {Promise<{communities: Array<Subtable>}>} Array of matching subtables
     * @throws {BadRequestError} If q is invalid
     * @throws {InternalServerError} For unexpected errors
     */
    async searchSubtables(q, options = {}) {
        try {
            // Validate input
            if (!q || typeof q !== 'string' || q.trim() === '') {
                throw new BadRequestError('Search q is required and must be a non-empty string');
            }

            const { limit = 25, offset = 0 } = options;

            // Validate numeric parameters
            if (isNaN(Number(limit)) || Number(limit) < 1) {
                throw new BadRequestError('Invalid limit parameter');
            }
            if (isNaN(Number(offset)) || Number(offset) < 0) {
                throw new BadRequestError('Invalid offset parameter');
            }


            // Get search results from DAO
            const results = await this.subtableDao.searchSubtables(q.trim(), {limit, offset});

            console.log('[SubtableService:searchSubtables] Search results:', results);

            return {
                communities: results,
            }
        } catch (error) {
            console.error('[SubtableService:searchSubtables] Error details:', {
                message: error.message,
                stack: error.stack,
                code: error.code,
                detail: error.detail
            });

            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError('An error occurred while searching subtables');
        }
    }
}

// Inject dependencies when creating the instance
export default new SubtableService(
    subtableDAO,
    userPostDetailsDAO,
    userProfileDAO,
    subscriptionDAO,
    moderatorDAO
);