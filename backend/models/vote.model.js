// models/vote.model.js

/**
 * Represents the possible types for a Vote, mirroring the "VoteType" ENUM.
 * @readonly
 * @enum {string}
 */
const VoteTypeEnum = Object.freeze({
    UPVOTE: 'upvote',
    DOWNVOTE: 'downvote'
});

/**
 * Represents a Vote cast on a Post or Comment.
 */
class Vote {
    /**
     * Creates an instance of Vote.
     * @param {string | null} voteId - The unique identifier (UUID), null if new.
     * @param {string} voterUserId - The UUID of the RegisteredUser who cast the vote. Required.
     * @param {string | null} postId - The UUID of the Post being voted on (null if voting on a comment).
     * @param {string | null} commentId - The UUID of the Comment being voted on (null if voting on a post).
     * @param {typeof VoteTypeEnum[keyof typeof VoteTypeEnum]} voteType - The type of the vote ('upvote' or 'downvote'). Required.
     * @param {Date | null} [createdAt=null] - Timestamp of creation (set by DB default).
     */
    constructor(voteId, voterUserId, postId, commentId, voteType, createdAt = null) {
        /** @type {string | null} */
        this.voteId = voteId;

        /** @type {string} */
        this.voterUserId = voterUserId;

        /** @type {string | null} */
        this.postId = postId;

        /** @type {string | null} */
        this.commentId = commentId;

        /**
         * The type of the vote. Should hold one of the values from VoteTypeEnum.
         * @type {typeof VoteTypeEnum[keyof typeof VoteTypeEnum]}
         */
        this.voteType = voteType;

        /** @type {Date | null} */
        this.createdAt = createdAt ? new Date(createdAt) : null;

        // Basic validation
        if (voteType !== VoteTypeEnum.UPVOTE && voteType !== VoteTypeEnum.DOWNVOTE) {
            throw new Error(`Vote type must be one of: ${Object.values(VoteTypeEnum).join(', ')}.`);
        }
        if (!postId && !commentId) {
            throw new Error("Vote must target either a postId or a commentId.");
        }
        if (postId && commentId) {
            throw new Error("Vote cannot target both a postId and a commentId.");
        }
    }

    /**
     * Converts a database row object into a Vote instance.
     * @param {Object | null} row - The database row object.
     * @returns {Vote | null} A Vote instance or null if no row provided.
     */
    static fromDbRow(row) {
        if (!row) return null;
        // Ensure the row.voteType is one of the expected enum values
        if (!Object.values(VoteTypeEnum).includes(row.voteType)) {
            console.warn(`Invalid voteType ('${row.voteType}') received from database for voteId: ${row.voteId}. Setting to null or default might be needed.`);
            // Depending on strictness, you might throw an error or handle it gracefully
            // For now, we pass it through, assuming DB constraints enforce correctness.
        }
        return new Vote(
            row.voteId,
            row.voterUserId,
            row.postId,
            row.commentId,
            row.voteType,
            row.createdAt
        );
    }

    /**
     * Example validation method (optional)
     * @param {any} value
     * @returns {boolean}
     */
    static isValidVoteType(value) {
        return Object.values(VoteTypeEnum).includes(value);
    }
}

export {Vote, VoteTypeEnum}; // Export both class and enum
export default Vote; // Default export for convenience
