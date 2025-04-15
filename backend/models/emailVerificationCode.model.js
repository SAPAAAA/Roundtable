/**
 * @typedef {Object} emailVerificationCode
 */
class emailVerificationCode {
    constructor(verificationCodeId, accountId, code, createdAt, expiresAt) {
        /** @type {string | null} */
        this.verificationCodeId = verificationCodeId;

        /** @type {string} */
        this.accountId = accountId;

        /** @type {string} */
        this.code = code;

        /** @type {Date} */
        // this.createdAt is set to the current date if createdAt is not provided
        this.createdAt = createdAt ? new Date(createdAt) : new Date();

        /** @type {Date | null} */
        this.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    /**
     * Converts a database row to an EmailVerificationCode instance.
     * @param {Object} row - The database row.
     * @returns {emailVerificationCode | null} The EmailVerificationCode instance or null if no row is provided.
     */
    static fromDbRow(row) {
        if (!row) return null;
        return new emailVerificationCode(
            row.verificationCodeId,
            row.accountId,
            row.code,
            row.createdAt,
            row.expiresAt
        );
    }
}

export default emailVerificationCode;