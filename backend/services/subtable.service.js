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


class SubtableService {
    /**
     * Constructor for SubtableService.
     * @param {SubtableDAO} subtableDao - Data Access Object for subtables.
     * @param {UserPostDetailsDAO} userPostDetailsDao - DAO for the user_post_details view/query.
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
     * @param {object} subtableData - Data for the new subtable { name, description, icon, banner }.
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
        // 2. Check if creator user exists (using userProfileDao) -> NotFoundError
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
        // 3. Validate icon and banner files (Assuming this is handled or not critical for this error)
        const {name, description, iconFile, bannerFile} = subtableData; // iconFile and bannerFile are not used in provided snippet for creation logic but kept for consistency

        return await postgresInstance.transaction(async (transaction) => {
            let createdSubtable; // Declare createdSubtable here, in the transaction's scope

            try {
                const subtable = new Subtable(null, name, description, creatorUserId);
                createdSubtable = await this.subtableDao.create(subtable, transaction); // Assign to the outer scoped variable
                if (!createdSubtable || !createdSubtable.subtableId) { // Defensive check
                    throw new InternalServerError("Subtable creation returned invalid data.");
                }
            } catch (error) {
                console.error('[SubtableService:createSubtable] Error during subtableDao.create:', error);
                if (error instanceof ConflictError || error instanceof AppError) { // Handle AppErrors explicitly
                    throw error;
                }
                throw new InternalServerError("Failed to create subtable entity.");
            }

            // 5. Create a subscription for the creator user
            const subscription = new Subscription(null, creatorUserId, createdSubtable.subtableId); // Now createdSubtable is accessible
            try {
                await this.subscriptionDao.create(subscription, transaction); // Pass transaction
            } catch (error) {
                console.error(`[SubtableService:createSubtable] Error creating subscription for user ${creatorUserId} to subtable ${createdSubtable.subtableId}:`, error);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new InternalServerError("Failed to create subscription for the new subtable.");
            }

            // 6. Create a moderator entry for the creator
            const moderator = new Moderator(creatorUserId, createdSubtable.subtableId);
            try {
                await this.moderatorDao.create(moderator, transaction); // Pass transaction
            } catch (error) {
                console.error(`[SubtableService:createSubtable] Error creating moderator for user ${creatorUserId} for subtable ${createdSubtable.subtableId}:`, error);
                if (error instanceof ConflictError || error instanceof AppError) { // Handle AppErrors explicitly
                    throw error;
                }
                throw new InternalServerError("Failed to assign creator as moderator for the new subtable.");
            }

            return createdSubtable; // Now this will correctly return the subtable
        });
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