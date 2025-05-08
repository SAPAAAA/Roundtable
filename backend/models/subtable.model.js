// models/subtable.model.js

/**
 * Represents a Subtable (community) within the platform.
 */
class Subtable {
    /**
     * Creates an instance of Subtable.
     * @param {string | null} subtableId - The unique identifier (UUID), null if new.
     * @param {string} name - The unique name of the subtable (e.g., 'VietnamDevs'). Required.
     * @param {string | null} [description=null] - A description of the subtable.
     * @param {string | null} [creatorUserId=null] - The UUID of the RegisteredUser who created the subtable. << CHANGED
     * @param {string | null} [icon=null] - URL for the subtable's icon image.
     * @param {string | null} [banner=null] - URL for the subtable's banner image.
     * @param {number} [memberCount=0] - The number of members (defaults to 1 in DB on creation).
     * @param {Date | null} [createdAt=null] - Timestamp of creation (set by DB default).
     */
    constructor(subtableId, name, description = null, creatorUserId = null, icon = null, banner = null, memberCount = 0, createdAt = null) {
        /** @type {string | null} */
        this.subtableId = subtableId;

        /** @type {string} */
        this.name = name;

        /** @type {string | null} */
        this.description = description;

        /** @type {Date | null} */
        this.createdAt = createdAt instanceof Date ? createdAt : (createdAt ? new Date(createdAt) : null); // Ensure Date object

        /** @type {string | null} */
        this.creatorUserId = creatorUserId;

        /** @type {string | null} */
        this.icon = icon;

        /** @type {string | null} */
        this.banner = banner;

        /** @type {number} */
        this.memberCount = Number(memberCount) || 0;
    }

    /**
     * Converts a database row object into a Subtable instance.
     * Assumes the database row keys match the constructor parameter names (or are mapped accordingly).
     * Specifically, expects `creatorUserId` from the database row now.
     * @param {Object} row - The database row object (e.g., from node-postgres query result).
     * @returns {Subtable | null} A Subtable instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) {
            return null;
        }

        // Ensure correct mapping from DB column name (e.g., 'creatorUserId' or 'creator_user_id')
        // If your DB driver returns snake_case, map it here:
        const creatorUserIdFromRow = row.creatorUserId || row.creator_user_id;

        return new Subtable(
            row.subtableId || row.subtable_id, // Allow for snake_case from DB
            row.name,
            row.description,
            row.createdAt || row.created_at, // Allow for snake_case
            creatorUserIdFromRow,           // << CHANGED property access
            row.icon,
            row.banner,
            row.memberCount || row.member_count  // Allow for snake_case
        );
    }
}

export default Subtable;