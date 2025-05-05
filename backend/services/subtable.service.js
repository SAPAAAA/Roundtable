// services/subtable.service.js
import UserPostDetailsDAO from '#daos/user-post-details.dao.js';
import UserProfileDAO from '#daos/user-profile.dao.js'; // Assuming this DAO exists and has getByUserId
import SubtableDAO from '#daos/subtable.dao.js';
import {BadRequestError, InternalServerError, NotFoundError} from "#errors/AppError.js";

class SubtableService {
    /**
     * Constructor for SubtableService.
     * @param {object} subtableDao - Data Access Object for subtables.
     * @param {object} userPostDetailsDao - DAO for the user_post_details view/query.
     * @param {object} userProfileDao - DAO for user profiles.
     */
    constructor(subtableDao, userPostDetailsDao, userProfileDao) {
        this.subtableDao = subtableDao;
        this.userPostDetailsDao = userPostDetailsDao;
        this.userProfileDao = userProfileDao;
    }

    /**
     * Retrieves all posts belonging to a specific subtable.
     * @param {string} subtableName - The name of the subtable.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of post details.
     * @throws {BadRequestError} If subtableName is not provided.
     * @throws {NotFoundError} If the subtable does not exist.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async getSubtablePosts(subtableName) {
        if (!subtableName) {
            throw new BadRequestError("Subtable name is required to fetch posts.");
        }
        try {
            // Fetch subtable details first to get the ID
            const subtable = await this.subtableDao.getByName(subtableName);
            if (!subtable) {
                // Throw specific error if subtable not found
                throw new NotFoundError(`Subtable '${subtableName}' not found.`);
            }

            // Fetch posts using the subtable ID
            const posts = await this.userPostDetailsDao.getBySubtableId(subtable.subtableId);
            return posts;

        } catch (error) {
            // If it's already a known AppError, re-throw it
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            // Otherwise, wrap unexpected errors
            console.error(`Error fetching posts for subtable ${subtableName}:`, error);
            throw new InternalServerError("An error occurred while fetching subtable posts.");
        }
    }

    /**
     * Retrieves the details of a specific subtable.
     * @param {string} subtableName - The name of the subtable.
     * @returns {Promise<object>} A promise that resolves to the subtable details object.
     * @throws {BadRequestError} If subtableName is not provided.
     * @throws {NotFoundError} If the subtable does not exist.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async getSubtableDetails(subtableName) {
        if (!subtableName) {
            throw new BadRequestError("Subtable name is required to fetch details.");
        }
        try {
            const subtable = await this.subtableDao.getByName(subtableName);
            if (!subtable) {
                // Throw specific error if subtable not found
                throw new NotFoundError(`Subtable '${subtableName}' not found.`);
            }
            return subtable;

        } catch (error) {
            // If it's already a known AppError, re-throw it
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            // Otherwise, wrap unexpected errors
            console.error(`Error fetching details for subtable ${subtableName}:`, error);
            throw new InternalServerError("An error occurred while fetching subtable details.");
        }
    }

    /**
     * Retrieves the list of subtables a user is subscribed to.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of subscribed subtable details.
     * @throws {BadRequestError} If userId is not provided.
     * @throws {NotFoundError} If the user does not exist.
     * @throws {InternalServerError} For unexpected errors during data retrieval.
     */
    async getSubscribedSubtables(userId) {
        if (!userId) {
            throw new BadRequestError("User ID is required to fetch subscribed subtables.");
        }

        try {
            // Check if user exists using UserProfileDAO
            const userExists = await this.userProfileDao.getByUserId(userId); // Ensure this method exists
            if (!userExists) {
                throw new NotFoundError(`User with ID '${userId}' not found.`);
            }

            // Fetch subscribed subtables using SubtableDAO
            const subtables = await this.subtableDao.getSubscribedSubtables(userId); // Ensure this method exists
            return subtables;

        } catch (error) {
            // If it's already a known AppError, re-throw it
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                throw error;
            }
            // Otherwise, wrap unexpected errors
            console.error(`Error fetching subscribed subtables for user ${userId}:`, error);
            throw new InternalServerError("An error occurred while fetching subscribed subtables.");
        }
    }
}

export default new SubtableService(
    SubtableDAO,
    UserPostDetailsDAO,
    UserProfileDAO
);
