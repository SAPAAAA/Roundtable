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
     * @param {Date | null} [createdAt=null] - Timestamp of creation (set by DB default).
     * @param {string | null} [creatorPrincipalId=null] - The UUID of the Principal who created the subtable.
     * @param {string | null} [iconUrl=null] - URL for the subtable's icon image.
     * @param {string | null} [bannerUrl=null] - URL for the subtable's banner image.
     * @param {number} [memberCount=1] - The number of members (defaults to 1 in DB on creation).
     */
    constructor(subtableId, name, description = null, createdAt = null, creatorPrincipalId = null, iconUrl = null, bannerUrl = null, memberCount = 1) {
        /** @type {string | null} */
        this.subtableId = subtableId;

        /** @type {string} */
        this.name = name;

        /** @type {string | null} */
        this.description = description;

        /** @type {Date | null} */
        this.createdAt = createdAt;

        /** @type {string | null} */
        this.creatorPrincipalId = creatorPrincipalId;

        /** @type {string | null} */
        this.iconUrl = iconUrl;

        /** @type {string | null} */
        this.bannerUrl = bannerUrl;

        /** @type {number} */
        this.memberCount = memberCount; // Reflects DB default
    }

    /**
     * Converts a database row object into a Subtable instance.
     * @param {Object} row - The database row object.
     * @returns {Subtable | null} A Subtable instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) return null;
        return new Subtable(
            row.subtableId,
            row.name,
            row.description,
            row.createdAt ? new Date(row.createdAt) : null, // Ensure it's a Date object
            row.creatorPrincipalId,
            row.iconUrl,
            row.bannerUrl,
            row.memberCount
        );
    }
}

export default Subtable;