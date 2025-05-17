// backend/models/subtable-details.model.js

/**
 * Represents the detailed information of a Subtable, as provided by the "SubtableDetails" view.
 * This model is primarily for reading data.
 */
class SubtableDetails {
    /**
     * Creates an instance of SubtableDetails.
     * @param {string | null} subtableId - The unique identifier (UUID) of the subtable.
     * @param {string | null} name - The unique name of the subtable.
     * @param {string | null} [description=null] - The description of the subtable.
     * @param {Date | null} [subtableCreatedAt=null] - Timestamp of the subtable's creation.
     * @param {number} [memberCount=0] - The number of members in the subtable.
     * @param {string | null} [icon=null] - URL of the subtable's icon media.
     * @param {string | null} [banner=null] - URL of the subtable's banner media.
     * @param {string | null} [creatorUserId=null] - UUID of the user who created the subtable.
     * @param {string | null} [creatorUsername=null] - Username of the subtable's creator.
     * @param {string | null} [creatorDisplayName=null] - Display name of the subtable's creator.
     * @param {string | null} [creatorAvatar=null] - URL of the subtable creator's avatar.
     */
    constructor(
        subtableId,
        name,
        description = null,
        subtableCreatedAt = null,
        memberCount = 0,
        icon = null,
        banner = null,
        creatorUserId = null,
        creatorUsername = null,
        creatorDisplayName = null,
        creatorAvatar = null
    ) {
        /** @type {string | null} */
        this.subtableId = subtableId;
        /** @type {string | null} */
        this.name = name;
        /** @type {string | null} */
        this.description = description;
        /** @type {Date | null} */
        this.subtableCreatedAt = subtableCreatedAt ? new Date(subtableCreatedAt) : null;
        /** @type {number} */
        this.memberCount = memberCount;
        /** @type {string | null} */
        this.icon = icon;
        /** @type {string | null} */
        this.banner = banner;
        /** @type {string | null} */
        this.creatorUserId = creatorUserId;
        /** @type {string | null} */
        this.creatorUsername = creatorUsername;
        /** @type {string | null} */
        this.creatorDisplayName = creatorDisplayName;
        /** @type {string | null} */
        this.creatorAvatar = creatorAvatar;

        if (!this.subtableId) {
            console.warn("SubtableDetails model created without subtableId.");
            // Depending on use case, you might throw an error if subtableId is always expected.
        }
        if (!this.name) {
            console.warn("SubtableDetails model created without a name.");
        }
    }

    /**
     * Converts a database row object from the "SubtableDetails" view into a SubtableDetails instance.
     * @param {Object | null} row - The database row object from the view.
     * @returns {SubtableDetails | null} A SubtableDetails instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) {
            return null;
        }
        return new SubtableDetails(
            row.subtableId,
            row.name,
            row.description,
            row.subtableCreatedAt,
            row.memberCount !== null ? parseInt(row.memberCount, 10) : 0,
            row.icon,
            row.banner,
            row.creatorUserId,
            row.creatorUsername,
            row.creatorDisplayName,
            row.creatorAvatar
        );
    }
}

export default SubtableDetails;