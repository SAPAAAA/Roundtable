import argon2 from 'argon2';
import dotenv from 'dotenv';
// --- Core & Utilities ---
import db from '#utils/db.js'; // Database connection/query builder instance (Knex)
import {generateShortCode} from '#utils/codeGenerator.js'; // Utility for generating short codes
import {sendMail} from '#utils/email.js'; // Utility for sending emails
// --- Data Access Objects (DAOs) ---
import accountDao from '#daos/account.dao.js';
import profileDao from '#daos/profile.dao.js';
import PrincipalDAO from '#daos/principal.dao.js';
import registeredUserDao from '#daos/registeredUser.dao.js';
import EmailVerificationCodeDao from '#daos/emailVerificationCode.dao.js'; // DAO for verification codes
// --- Data Models ---
import Account from '#models/account.model.js';
import Profile from '#models/profile.model.js';
import RegisteredUser from '#models/registeredUser.model.js';
import Principal, {PrincipalRoleEnum} from '#models/principal.model.js';
import EmailVerificationCode from '#models/emailVerificationCode.model.js'; // Import the model
// --- Constants ---
import HTTP_STATUS from '#constants/httpStatus.js'; // HTTP status codes
import {HASH_OPTIONS} from '#constants/security.js'; // Hashing options for Argon2

// Configure environment variables
dotenv.config();

const CODE_EXPIRY_MINUTES = 5; // Expiry time for email verification codes


// --- Password Hashing Utilities ---
// (Consider moving these to a dedicated 'utils/security.js' or 'utils/password.js' file)

/**
 * Hashes a plain-text password using Argon2id.
 * @param {string} password - The plain-text password to hash.
 * @returns {Promise<string>} The Argon2id hash of the password.
 * @throws {Error} If hashing fails.
 */
async function hashPassword(password) {
    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        console.error('Error hashing password:', error);
        // Log the detailed error internally, but throw a generic one
        throw new Error('Password hashing failed due to an internal error.');
    }
}

/**
 * Verifies a plain-text password against an Argon2id hash.
 * @param {string} hashedPassword - The stored Argon2id hash.
 * @param {string} plainPassword - The plain-text password submitted by the user.
 * @returns {Promise<boolean>} True if the password matches the hash, false otherwise.
 * @throws {Error} If verification fails for reasons other than mismatch.
 */
async function verifyPassword(hashedPassword, plainPassword) {
    try {
        // IMPORTANT: argon2.verify expects (hash, password)
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        // Log internal errors, but verification failure (mismatch) is not an error condition here
        if (error.code === 'ERR_ARGON2_INVALID_HASH' || error.message.includes('incompatible')) {
            console.error('Error verifying password (invalid hash format or parameters):', error);
            // Treat invalid hash format as a failure, but log it specifically.
            return false;
        } else if (error.message.includes('verification failed')) {
            // This is the expected result for a password mismatch - return false
            return false;
        }
        // Log other unexpected errors
        console.error('Unexpected error verifying password:', error);
        throw new Error('Password verification failed due to an internal error.');
    }
}


/**
 * @class AuthService
 * @description Handles user authentication, registration, and email verification logic.
 */
class AuthService {

    /**
     * Sends a verification code email to the user.
     * @private Internal method
     * @param {string} userEmail - The recipient's email address.
     * @param {string} plainCode - The plain (non-hashed) verification code to send.
     * @returns {Promise<void>}
     * @throws {Error} If sending the email fails.
     */
    async _sendVerificationEmail(userEmail, plainCode) {
        const subject = 'Your Email Verification Code';
        const expiryMessage = `This code is valid for ${CODE_EXPIRY_MINUTES} minutes.`;
        // Consider using an HTML email template engine (like Handlebars, EJS) for more complex emails
        const html = `
            <h1>Verify Your Email Address</h1>
            <p>Thank you for registering! Please use the following code to verify your email:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">${plainCode}</p>
            <p><em>${expiryMessage}</em></p>
            <p>If you did not request this verification, please ignore this email.</p>
        `;

        try {
            // Assuming sendMail handles potential errors internally or throws them
            await sendMail(userEmail, subject, html);
            console.log(`Verification email successfully sent to ${userEmail}`);
        } catch (error) {
            console.error(`Failed to send verification email to ${userEmail}:`, error);
            // Re-throw a service-level error to be handled by the caller
            throw new Error(`Failed to send verification email. Please try again later or contact support.`);
        }
    }

    /**
     * Registers a new user, creates associated records, and sends a verification email.
     * @param {object} registrationData - The user registration details.
     * @param {string} registrationData.fullName - The user's full name (used as display name).
     * @param {string} registrationData.username - The desired username.
     * @param {string} registrationData.email - The user's email address.
     * @param {string} registrationData.password - The user's plain-text password.
     * @returns {Promise<{message: string}>} Success message upon completion.
     * @throws {Error} If validation fails, user exists, DB operation fails, or email sending fails. Includes statusCode property.
     */
    async registerUser(registrationData) {
        const {fullName, username, email, password} = registrationData;

        // --- 1. Input Validation ---
        if (!username || !email || !password || !fullName) { // Added fullName check
            const error = new Error('Full name, username, email, and password are required.');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        let createdEntities; // To store results from the transaction

        try {
            // --- 2. Database Transaction: Atomically create all related records ---
            createdEntities = await db.transaction(async (trx) => {
                // --- Check for Existing Users (within transaction for consistency) ---
                const existingByUsername = await accountDao.findByUsername(username, trx); // Pass trx
                if (existingByUsername) {
                    const error = new Error('Username is already taken.');
                    error.statusCode = HTTP_STATUS.CONFLICT;
                    throw error; // Triggers rollback
                }
                const existingByEmail = await accountDao.findByEmail(email, trx); // Pass trx
                if (existingByEmail) {
                    const error = new Error('Email address is already registered.');
                    error.statusCode = HTTP_STATUS.CONFLICT;
                    throw error; // Triggers rollback
                }

                // --- Create Account ---
                const hashedPassword = await hashPassword(password);
                const account = new Account(null, username, hashedPassword, email, null, null, false); // Ensure is_email_verified defaults to false
                const createdAccount = await accountDao.create(account, trx);
                if (!createdAccount?.accountId) throw new Error('Account creation failed.'); // Rollback

                // --- Create Profile ---
                const profile = new Profile(
                    null,       // profileId
                    null,       // avatar
                    null,       // banner
                    null,       // bio
                    null,       // location
                    fullName,   // displayName
                    null        // gender
                );
                const createdProfile = await profileDao.create(profile, trx);
                if (!createdProfile?.profileId) throw new Error('Profile creation failed.'); // Rollback

                // --- Create Principal ---
                const principal = new Principal(null, createdAccount.accountId, createdProfile.profileId, PrincipalRoleEnum.USER);
                const createdPrincipal = await PrincipalDAO.create(principal, trx);
                if (!createdPrincipal?.principalId) throw new Error('Principal creation failed.'); // Rollback

                // --- Create RegisteredUser ---
                const registeredUser = new RegisteredUser(null, createdPrincipal.principalId);
                const createdRegisteredUser = await registeredUserDao.create(registeredUser, trx);
                if (!createdRegisteredUser?.userId) throw new Error('Registered user linking failed.'); // Rollback

                // --- Return created entities (Knex commits automatically if no error) ---
                return {
                    account: createdAccount,
                    profile: createdProfile,
                    principal: createdPrincipal, // Added principal for completeness if needed later
                    registeredUser: createdRegisteredUser,
                };
            }); // --- End Transaction ---

            // --- 3. Generate and Send Verification Code (AFTER successful transaction) ---
            const accountId = createdEntities?.account?.accountId;
            const userEmail = createdEntities?.account?.email;

            if (!accountId || !userEmail) {
                // This case should theoretically not happen if the transaction succeeded, but good to guard against
                console.error('Registration transaction completed but account data is missing. Cannot send verification.');
                throw new Error('Registration partially succeeded, but failed to retrieve account details for verification.');
            }

            try {
                const plainCode = generateShortCode(6); // 6-digit code
                const hashedCode = await hashPassword(plainCode); // Hash the code for storage
                const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

                // Use a nested transaction for code creation/deletion atomicity
                const createdCodeRecord = await db.transaction(async (trx) => {
                    // Delete any previous *active* codes for this account (important for re-requesting codes)
                    await EmailVerificationCodeDao.deleteByAccountId(accountId, trx);

                    // Create and save the new code record
                    const verificationCode = new EmailVerificationCode(null, accountId, hashedCode, null, expiresAt);
                    return await EmailVerificationCodeDao.create(verificationCode, trx);
                });

                if (!createdCodeRecord?.verificationCodeId) {
                    throw new Error('Failed to store verification code.');
                }

                // Send the email with the PLAIN code
                await this._sendVerificationEmail(userEmail, plainCode);

            } catch (emailOrCodeError) {
                console.error('Error during verification code generation or sending:', emailOrCodeError);
                const error = new Error(`Registration successful, but failed to send verification email: ${emailOrCodeError.message}`);
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR; // Indicate a server-side issue post-registration
                throw error;
            }

            // --- 4. Return Success Response ---
            return {
                message: 'Registration successful. Please check your email for a verification code.',
                success: true,
            }

        } catch (error) {
            console.error('User registration failed:', error.message);
            // If a statusCode wasn't already set, assign a generic server error
            if (!error.statusCode) {
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                // Avoid exposing detailed internal errors to the client
                error.message = 'Registration failed due to an unexpected internal error. Please try again later.';
            }
            // Re-throw the error with statusCode for the controller to handle
            throw error;
        }
    }

    /**
     * Verifies a user's email address using a submitted code.
     * @param {string} email - The email address of the account to verify.
     * @param {string} submittedCode - The plain (non-hashed) verification code submitted by the user.
     * @returns {Promise<{success: boolean, message: string}>} Result of the verification attempt.
     * @throws {Error} If the account is not found, code is invalid/expired, or DB update fails. Includes statusCode property.
     */
    // async verifyEmailCode(email, submittedCode) {
    //     if (!email || !submittedCode) {
    //         const error = new Error('Email and verification code are required.');
    //         error.statusCode = HTTP_STATUS.BAD_REQUEST;
    //         throw error;
    //     }
    //
    //     try {
    //         // --- 1. Find User ---
    //         const account = await accountDao.findByEmail(email);
    //         if (!account) {
    //             // Use a generic message to avoid revealing if an email exists
    //             const error = new Error('Invalid verification request or code.');
    //             error.statusCode = HTTP_STATUS.BAD_REQUEST; // Or NOT_FOUND (404)
    //             throw error;
    //         }
    //         if (account.isVerified) {
    //             // Email already verified, treat as success (idempotent)
    //             return { success: true, message: 'Email address is already verified.' };
    //         }
    //         const accountId = account.accountId;
    //
    //         // --- 2. Find Active Verification Code ---
    //         // Assumes findActiveByAccountId checks both accountId AND expiry date
    //         const storedCodeData = await EmailVerificationCodeDao.findActiveByAccountId(accountId);
    //         if (!storedCodeData) {
    //             const error = new Error('Invalid or expired verification code. Please request a new one.');
    //             error.statusCode = HTTP_STATUS.BAD_REQUEST;
    //             throw error;
    //         }
    //
    //         // --- 3. Verify Submitted Code against Stored Hash ---
    //         // IMPORTANT: verifyPassword expects (hash, plainPassword)
    //         const isCodeValid = await verifyPassword(storedCodeData.hashed_code, submittedCode);
    //         if (!isCodeValid) {
    //             // Increment attempt counter here? (Security enhancement)
    //             const error = new Error('Invalid verification code.');
    //             error.statusCode = HTTP_STATUS.BAD_REQUEST;
    //             throw error;
    //         }
    //
    //         // --- 4. Code is Valid - Update Account and Clean Up ---
    //         // Use a transaction for atomicity of update and delete
    //         await db.transaction(async (trx) => {
    //             // Mark account as verified
    //             const updated = await accountDao.update(accountId, { is_email_verified: true }, trx);
    //             if (!updated) { // Check if the update affected any row
    //                 throw new Error('Failed to update account verification status.');
    //             }
    //
    //             // Delete the used verification code(s) for this account
    //             await EmailVerificationCodeDao.deleteByAccountId(accountId, trx);
    //         });
    //
    //         console.log(`Email successfully verified for account ID: ${accountId}`);
    //         return { success: true, message: 'Email verified successfully.' };
    //
    //     } catch (error) {
    //         console.error(`Email verification error for ${email}:`, error);
    //         if (!error.statusCode) {
    //             error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    //             error.message = 'Email verification failed due to an unexpected server error.';
    //         }
    //         // Re-throw the error with statusCode
    //         throw error;
    //     }
    // }


    /**
     * Logs in a user with username and password.
     * @param {string} username - The username provided by the user.
     * @param {string} password - The plain-text password provided by the user.
     * @returns {Promise<object>} The account data (excluding password hash) upon successful login.
     * @throws {Error} If login fails (invalid credentials, account not found, not verified, server error). Includes statusCode property.
     */
    async login(username, password) {
        if (!username || !password) {
            const error = new Error('Username and password are required.');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        try {
            // --- 1. Find Account ---
            const account = await accountDao.findByUsername(username);
            if (!account) {
                const error = new Error('Invalid username or password.');
                error.statusCode = HTTP_STATUS.UNAUTHORIZED; // 401 for authentication failure
                throw error;
            }

            // --- 2. Check Email Verification Status ---
            if (!account.is_email_verified) {
                // Consider allowing login but restricting features, or requiring verification first.
                // Current implementation: block login completely.
                const error = new Error('Account not verified. Please check your email for the verification code or request a new one.');
                error.statusCode = HTTP_STATUS.FORBIDDEN; // 403 Forbidden is appropriate here
                // Optionally add info on how to resend verification
                throw error;
            }

            // --- 3. Verify Password ---
            // IMPORTANT: verifyPassword expects (hash, plainPassword)
            const isPasswordValid = await verifyPassword(account.password, password);
            if (!isPasswordValid) {
                const error = new Error('Invalid username or password.');
                error.statusCode = HTTP_STATUS.UNAUTHORIZED;
                throw error;
            }

            // --- 4. Login Successful - Prepare Response ---
            // Remove sensitive password hash before returning account data
            const {password: _, ...accountData} = account;

            // TODO: Generate JWT or session token here
            // const token = generateAuthToken(accountData.accountId, accountData.username);
            // return { ...accountData, token };

            console.log(`User ${username} logged in successfully.`);
            return accountData; // Return account data (or token in a real app)

        } catch (error) {
            console.error(`Login attempt failed for username "${username}":`, error.message);
            if (!error.statusCode) {
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                error.message = 'Login failed due to a server issue. Please try again later.';
            }
            // Re-throw the error with statusCode
            throw error;
        }
    }

    // TODO: Add methods for:
    // - Resend Verification Email
    // - Forgot Password / Password Reset Request
    // - Reset Password with Token
    // - Logout (if using server-side sessions or token blacklisting)
}

// Export a singleton instance of the service
export default new AuthService();