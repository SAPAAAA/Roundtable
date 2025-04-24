// src/services/auth.service.js

// --- Core Dependencies ---
import argon2 from 'argon2';
import dotenv from 'dotenv';

// --- Database & Cache Clients ---
import postgres from '#db/postgres.js'; // Knex instance for transactions
import redis from '#db/redis.js'; // Redis client instance
// --- Utility Functions ---
import {generateShortCode} from '#utils/codeGenerator.js';
import {sendMail} from '#utils/email.js';

// --- Data Access Objects (DAOs) ---
import accountDao from '#daos/account.dao.js';
import principalDAO from '#daos/principal.dao.js';
import profileDao from '#daos/profile.dao.js';
import registeredUserDao from '#daos/registeredUser.dao.js';
import userProfileDao from '#daos/userProfile.dao.js';

// --- Data Models ---
import Account from '#models/account.model.js';
import Profile from '#models/profile.model.js';
import RegisteredUser from '#models/registeredUser.model.js';
import Principal, {PrincipalRoleEnum} from '#models/principal.model.js';

// --- Constants & Custom Errors ---
import {HASH_OPTIONS} from '#constants/security.js';
import {
    AuthenticationError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    VerificationError,
} from '#errors/AppError.js'; // Adjust path as needed

dotenv.config(); // Ensure env vars are loaded

const CODE_EXPIRY_MINUTES = 5;

// --- Password Hashing Utilities (Assume these are correctly defined) ---
async function hashPassword(password) {
    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new InternalServerError('Password processing failed.');
    }
}

async function verifyPassword(hashedPassword, plainPassword) {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        if (error.code === 'ERR_ARGON2_INVALID_HASH' || error.message.includes('incompatible') || error.message.includes('verification failed')) {
            console.error('Password verification failed (invalid hash, parameters, or mismatch):', error.message);
            return false;
        }
        console.error('Unexpected error during password verification:', error);
        throw new InternalServerError('Password verification encountered an internal error.');
    }
}


/**
 * @class AuthService
 * @description Handles core business logic for authentication, registration, verification.
 */
class AuthService {

    /** Sends the verification email */
    async _sendVerificationEmail(userEmail, plainCode) {
        const subject = 'Your Email Verification Code';
        const expiryMessage = `This code is valid for ${CODE_EXPIRY_MINUTES} minutes.`;
        const html = `
            <h1>Verify Your Email Address</h1>
            <p>Thank you for registering! Please use the following code to verify your email:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">${plainCode}</p>
            <p><em>${expiryMessage}</em></p>
            <p>If you did not request this verification, please ignore this email.</p>
        `;

        try {
            await sendMail(userEmail, subject, html);
            console.log(`Verification email successfully sent to ${userEmail}`);
        } catch (error) {
            console.error(`Failed to send verification email to ${userEmail}:`, error);
            throw new InternalServerError(`Failed to send verification email.`);
        }
    }

    /**
     * Registers a new user using DAOs within a transaction.
     * Sends a verification email upon successful registration.
     * (Assumes this method is correct from previous versions)
     */
    async registerUser(registrationData) {
        const {fullName, username, email, password} = registrationData;

        if (!username || !email || !password || !fullName) {
            throw new BadRequestError('Full name, username, email, and password are required.');
        }

        let createdEntities;
        try {
            createdEntities = await postgres.transaction(async (trx) => {
                // Check existing user/email
                const existingUser = await accountDao.getByUsername(username, trx);
                if (existingUser) throw new ConflictError('Username is already taken.');
                const existingEmail = await accountDao.getByEmail(email, trx);
                if (existingEmail) throw new ConflictError('Email address is already registered.');

                // Hash password
                const hashedPassword = await hashPassword(password);

                // Create records using DAOs, passing transaction object (trx)
                const account = new Account(null, username, hashedPassword, email);
                const createdAccount = await accountDao.create(account, trx);
                if (!createdAccount?.accountId) throw new Error('DB_INSERT_FAIL: Account');

                const profile = new Profile(null, null, null, null, null, fullName);
                const createdProfile = await profileDao.create(profile, trx);
                if (!createdProfile?.profileId) throw new Error('DB_INSERT_FAIL: Profile');

                const principal = new Principal(null, createdAccount.accountId, createdProfile.profileId, PrincipalRoleEnum.USER);
                const createdPrincipal = await principalDAO.create(principal, trx);
                if (!createdPrincipal?.principalId) throw new Error('DB_INSERT_FAIL: Principal');

                // Use registeredUserDao.create
                const registeredUser = new RegisteredUser(null, createdPrincipal.principalId);
                const createdRegisteredUser = await registeredUserDao.create(registeredUser, trx);
                if (!createdRegisteredUser?.userId) throw new Error('DB_INSERT_FAIL: RegisteredUser');

                return {
                    account: createdAccount,
                    profile: createdProfile,
                    principal: createdPrincipal,
                    registeredUser: createdRegisteredUser
                };
            }); // End transaction

            // --- Post-Transaction Actions ---
            const userId = createdEntities.registeredUser.userId;
            const userEmail = createdEntities.account.email;
            const plainCode = generateShortCode(6);
            const redisKey = `verify:email:${userId}`;
            const redisTTL = CODE_EXPIRY_MINUTES * 60;

            try {
                await redis.set(redisKey, plainCode, {EX: redisTTL});
                console.log(`Verification code stored in Redis for userId: ${userId}`);
                await this._sendVerificationEmail(userEmail, plainCode);
            } catch (cacheOrEmailError) {
                console.error(`Error during post-registration (Redis/Email) for userId ${userId}:`, cacheOrEmailError.message);
                throw cacheOrEmailError; // Re-throw (likely InternalServerError)
            }

            // Return safe user data
            return {
                userId: createdEntities.registeredUser.userId,
                username: createdEntities.account.username,
                displayName: createdEntities.profile.displayName,
                email: createdEntities.account.email,
                isVerified: false,
            };

        } catch (error) {
            if (error instanceof BadRequestError || error instanceof ConflictError || error instanceof InternalServerError) {
                throw error;
            }
            if (error.message?.startsWith('DB_INSERT_FAIL')) {
                console.error('User registration failed during database insertion:', error.message);
                throw new InternalServerError('Registration failed due to a database error.');
            }
            console.error('User registration process failed unexpectedly:', error);
            throw new InternalServerError('Registration failed due to an unexpected internal error.');
        }
    }


    /**
     * Verifies a user's email address using a submitted code.
     * Finds the userId via Account -> Principal -> RegisteredUser.
     * Uses RegisteredUserDAO to check and update the isVerified flag within a transaction.
     *
     * @param {string} email - The user's email.
     * @param {string} submittedCode - The code submitted by the user.
     * @returns {Promise<boolean>} True if verification is successful or user already verified.
     * @throws {BadRequestError} If email or code is missing.
     * @throws {NotFoundError} If the account, principal, or registered user record is not found.
     * @throws {VerificationError} If the code is invalid or expired.
     * @throws {InternalServerError} For database, Redis, or other unexpected errors.
     */
    async verifyEmail(email, submittedCode) {
        if (!email || !submittedCode) {
            throw new BadRequestError('Email and verification code are required.');
        }

        let userId = null;
        let redisKey = null;

        try {
            // --- 1. Find User ID from Email via Account -> Principal -> RegisteredUser ---
            // Step 1.1: Find account by email
            const account = await accountDao.getByEmail(email);
            if (!account?.accountId) {
                console.warn(`Verification attempt failed: No account found for email ${email}`);
                throw new NotFoundError('Account not found or verification failed.');
            }

            // Step 1.2: Find principal by accountId
            const principal = await principalDAO.getByAccountId(account.accountId);
            if (!principal?.principalId) {
                console.error(`Data inconsistency: Account ${account.accountId} found, but no matching Principal.`);
                throw new InternalServerError('User data configuration error during verification.');
            }

            // Step 1.3: Find registered user by principalId to get the userId
            // Assuming registeredUserDao has getByPrincipalId or similar, otherwise adapt lookup.
            // If not, we might need userProfileDao.getByPrincipalId just for the userId lookup.
            // Let's assume registeredUserDao.getByPrincipalId exists for directness:
            const registeredUser = await registeredUserDao.getByPrincipalId(principal.principalId);
            if (!registeredUser?.userId) {
                console.error(`Data inconsistency: Principal ${principal.principalId} found, but no matching RegisteredUser.`);
                throw new InternalServerError('User registration data error during verification.');
            }

            // Successfully found the userId
            userId = registeredUser.userId;
            redisKey = `verify:email:${userId}`;
            console.log(`Verification lookup: Found userId ${userId} for email ${email}.`);

            // --- 2. Check Verification Code in Redis ---
            const storedCode = await redis.get(redisKey);

            if (!storedCode) {
                console.warn(`No verification code found in Redis for key: ${redisKey} (email: ${email})`);
                throw new VerificationError('Verification code is invalid or has expired. Please request a new one.');
            }

            if (storedCode !== submittedCode) {
                console.warn(`Submitted code mismatch for key ${redisKey}. Stored: ${storedCode}, Submitted: ${submittedCode}`);
                throw new VerificationError('Invalid verification code.');
            }

            // --- 3. Update RegisteredUser within a Transaction using RegisteredUserDAO ---
            let alreadyVerified = false;
            const updatePerformed = await postgres.transaction(async (trx) => {
                // Step 3.1: Fetch the RegisteredUser record *within the transaction* using its DAO
                const userToUpdate = await registeredUserDao.getById(userId, trx); // Pass trx

                if (!userToUpdate) {
                    console.error(`Consistency issue inside transaction: RegisteredUser not found for update with userId ${userId}`);
                    throw new InternalServerError('Failed to retrieve user details for verification update.'); // Rollback
                }

                // Step 3.2: Check if already verified
                if (userToUpdate.isVerified === true) {
                    console.log(`User (userId: ${userId}) already verified (checked via DAO within transaction).`);
                    alreadyVerified = true;
                    return false; // No update needed
                }

                // Step 3.3: Perform the update using the DAO's update method
                const updateSuccessful = await registeredUserDao.update(
                    userId,
                    {isVerified: true}, // Pass data to update
                    trx // Pass the transaction object
                );

                if (!updateSuccessful) {
                    // The DAO's update method returns boolean indicating success
                    console.error(`Failed to update RegisteredUser verification status via DAO for userId: ${userId} within transaction.`);
                    throw new InternalServerError('Database update for verification failed.'); // Rollback
                }

                console.log(`User (userId: ${userId}) marked as verified via DAO within transaction.`);
                return true; // Indicate DB update was performed
            }); // End of postgres.transaction block

            // --- 4. Clean up Redis key ---
            if (updatePerformed || alreadyVerified) {
                try {
                    await redis.del(redisKey);
                    console.log(`Redis key ${redisKey} deleted after successful verification check/update.`);
                } catch (redisError) {
                    console.error(`Failed to delete Redis key ${redisKey} after verification:`, redisError);
                }
            }

            // --- 5. Return Success ---
            console.log(`Verification process completed for email ${email} (userId: ${userId}). Status updated: ${updatePerformed}`);
            return true; // Indicate success to the controller

        } catch (error) {
            // Re-throw known application errors
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof VerificationError || error instanceof InternalServerError) {
                throw error;
            }
            // Handle potential generic DB/Redis/other errors
            console.error(`Email verification process failed unexpectedly for email "${email}" (userId: ${userId || 'N/A'}):`, error);
            throw new InternalServerError('Email verification failed due to an unexpected internal error.');
        }
    }


    /**
     * Authenticates a user based on username and password.
     * Uses UserProfileDAO for fetching combined profile data after successful auth.
     * (Assumes this method is correct from previous versions)
     */
    async login(username, password) {
        if (!username || !password) {
            throw new BadRequestError('Username and password are required.');
        }

        try {
            // Find account & verify password
            const account = await accountDao.getByUsername(username);
            if (!account) throw new AuthenticationError('Invalid username or password.');

            const isPasswordValid = await verifyPassword(account.password, password);
            if (!isPasswordValid) throw new AuthenticationError('Invalid username or password.');

            // Fetch the full user profile using UserProfileDAO
            const userProfile = await userProfileDao.getByUsername(username);
            if (!userProfile?.userId) {
                console.error(`Data inconsistency: Account found (ID: ${account.accountId}), but UserProfile data missing/incomplete.`);
                throw new NotFoundError('User profile data not found. Please contact support.');
            }

            // Check verification & status from the UserProfile object
            if (!userProfile.isVerified) {
                throw new ForbiddenError('Your account is not verified. Please check your email.');
            }
            const accountStatus = userProfile.status || 'active';
            if (accountStatus !== 'active') {
                let message = 'Your account is currently inactive.';
                if (accountStatus === 'suspended') message = 'Your account has been temporarily suspended.';
                if (accountStatus === 'banned') message = 'Your account has been permanently banned.';
                throw new ForbiddenError(message);
            }

            // Prepare safe user data from UserProfile model
            const safeUserProfile = {
                userId: userProfile.userId,
                principalId: userProfile.principalId,
                username: userProfile.username,
                email: userProfile.email,
                displayName: userProfile.displayName,
                avatar: userProfile.avatar,
                karma: userProfile.karma,
                isVerified: userProfile.isVerified,
                status: accountStatus,
                role: userProfile.role,
            };

            console.log(`User ${username} (userId: ${safeUserProfile.userId}) credentials verified.`);
            return safeUserProfile;

        } catch (error) {
            if (error instanceof BadRequestError || error instanceof AuthenticationError || error instanceof ForbiddenError || error instanceof NotFoundError || error instanceof InternalServerError) {
                throw error;
            }
            console.error(`Login process failed unexpectedly for username "${username}":`, error);
            throw new InternalServerError('Login failed due to an unexpected internal error.');
        }
    }

    /**
     * Retrieves safe user profile data based on a user ID (typically from a session).
     * Uses UserProfileDAO.
     * (Assumes this method is correct from previous versions)
     */
    async loginWithSession(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required for session validation.');
        }
        try {
            // Use UserProfileDAO to get combined data directly
            const userProfile = await userProfileDao.getByUserId(userId);
            if (!userProfile?.userId) {
                throw new NotFoundError('User associated with this session not found.');
            }

            // Optional: Re-check status/verification if needed
            // if (userProfile.status !== 'active' || !userProfile.isVerified) {
            //     throw new ForbiddenError('Account status changed. Please log in again.');
            // }

            // Prepare safe user data from UserProfile model
            const safeUserProfile = {
                userId: userProfile.userId,
                principalId: userProfile.principalId,
                username: userProfile.username,
                email: userProfile.email,
                displayName: userProfile.displayName,
                avatar: userProfile.avatar,
                karma: userProfile.karma,
                isVerified: userProfile.isVerified,
                status: userProfile.status || 'active',
                role: userProfile.role,
            };

            console.log(`Session check successful: Retrieved data for userId: ${userId}`);
            return safeUserProfile;

        } catch (error) {
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof InternalServerError) {
                throw error;
            }
            console.error(`Session check failed unexpectedly for userId "${userId}":`, error);
            throw new InternalServerError('Session validation failed due to an unexpected internal error.');
        }
    }
}

// Export a singleton instance of the service
export default new AuthService();
