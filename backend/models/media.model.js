// backend/models/media.model.js

/**
 * @typedef {'image' | 'video' | 'audio'} MediaTypeEnum
 * Represents the type of media, mirroring the "MediaType" ENUM in the database.
 */
export const MediaTypeEnum = Object.freeze({
    /** Represents an image file. */
    IMAGE: 'image',
    /** Represents a video file. */
    VIDEO: 'video',
    /** Represents an audio file. */
    AUDIO: 'audio'
});

/**
 * Represents a media record in the "Media" table.
 */
class Media {
    /**
     * Creates an instance of Media.
     * @param {string | null} mediaId - The unique identifier (UUID), null if new.
     * @param {string | null} uploaderUserId - UUID of the "RegisteredUser" who uploaded the media, null if user deleted.
     * @param {string} url - The URL where the media is stored. Required.
     * @param {MediaTypeEnum} mediaType - The type of the media. Required.
     * @param {string | null} [mimeType=null] - The MIME type of the media file (e.g., 'image/jpeg', 'video/mp4').
     * @param {number | null} [fileSize=null] - The size of the media file in bytes.
     * @param {Date | null} [createdAt=null] - Timestamp of creation (set by DB default).
     */
    constructor(
        mediaId, uploaderUserId, url, mediaType,
        mimeType = null, fileSize = null, createdAt = null
    ) {
        /** @type {string | null} */
        this.mediaId = mediaId;
        /** @type {string | null} */
        this.uploaderUserId = uploaderUserId;
        /** @type {string} */
        this.url = url;
        /** @type {MediaTypeEnum} */
        this.mediaType = mediaType;
        /** @type {string | null} */
        this.mimeType = mimeType;
        /** @type {number | null} */
        this.fileSize = fileSize; // Stored as BIGINT in DB, which can be a large number. JS numbers are 64-bit floats.
        /** @type {Date | null} */
        this.createdAt = createdAt ? new Date(createdAt) : null;

        if (!this.url) {
            throw new Error("Media URL cannot be empty.");
        }
        if (!this.mediaType) {
            throw new Error("Media type cannot be empty.");
        }
        if (!Object.values(MediaTypeEnum).includes(this.mediaType)) {
            console.warn(`Invalid mediaType provided: ${this.mediaType}.`);
            // Depending on strictness, you might throw an error or default it.
            // For now, we'll allow it but log a warning, assuming validation happens elsewhere or it's a new type.
            // Or, to be stricter and align with the provided Message model:
            // throw new Error(`Invalid mediaType: ${this.mediaType}. Must be one of ${Object.values(MediaTypeEnum).join(', ')}`);
        }

        if (this.fileSize !== null && typeof this.fileSize !== 'number') {
            try {
                this.fileSize = parseInt(this.fileSize, 10);
                if (isNaN(this.fileSize)) {
                    this.fileSize = null; // Reset if parsing failed
                    console.warn(`Invalid fileSize provided: ${fileSize}. Could not parse to number.`);
                }
            } catch (e) {
                this.fileSize = null;
                console.warn(`Error parsing fileSize: ${fileSize}. Setting to null.`);
            }
        }
    }

    /**
     * Converts a database row object from the "Media" table into a Media instance.
     * @param {Object | null} row - The database row object.
     * @returns {Media | null} A Media instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) {
            return null;
        }
        return new Media(
            row.mediaId,
            row.uploaderUserId,
            row.url,
            row.mediaType,
            row.mimeType,
            row.fileSize !== null ? parseInt(row.fileSize, 10) : null, // Ensure fileSize is a number
            row.createdAt
        );
    }
}

export default Media;