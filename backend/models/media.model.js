/**
 * Represents a media file uploaded to the platform.
 */
class Media {
    /**
     * Creates an instance of Media.
     * @param {string | null} mediaId - The unique identifier (UUID), null if new.
     * @param {string} uploaderUserId - The UUID of the RegisteredUser who uploaded the file. Required.
     * @param {string} url - The URL or path where the file is stored. Required.
     * @param {string} mediaType - The type of media (e.g., 'image', 'video'). Required.
     * @param {string} mimeType - The MIME type of the file (e.g., 'image/jpeg'). Required.
     * @param {number} fileSize - The size of the file in bytes. Required.
     * @param {Date | null} [createdAt=null] - Timestamp of creation (set by DB default).
     */
    constructor(mediaId, uploaderUserId, url, mediaType, mimeType, fileSize, createdAt = null) {
        /** @type {string | null} */
        this.mediaId = mediaId;

        /** @type {string} */
        this.uploaderUserId = uploaderUserId;

        /** @type {string} */
        this.url = url;

        /** @type {string} */
        this.mediaType = mediaType;

        /** @type {string} */
        this.mimeType = mimeType;

        /** @type {number} */
        this.fileSize = fileSize;

        /** @type {Date | null} */
        this.createdAt = createdAt ? new Date(createdAt) : null;

        // Basic validation
        if (!uploaderUserId || !url || !mediaType || !mimeType || !fileSize) {
            throw new Error('Missing required fields for Media creation.');
        }
        if (fileSize <= 0) {
            throw new Error('File size must be greater than 0.');
        }
    }

    /**
     * Converts a database row object into a Media instance.
     * @param {Object} row - The database row object.
     * @returns {Media | null} A Media instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) return null;
        return new Media(
            row.mediaId,
            row.uploaderUserId,
            row.url,
            row.mediaType,
            row.mimeType,
            row.fileSize,
            row.createdAt
        );
    }
}

export default Media; 