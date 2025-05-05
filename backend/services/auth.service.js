// src/services/auth.service.js

// --- Core Dependencies ---
import argon2 from 'argon2';
import dotenv from 'dotenv';

// --- PostgresDB & Cache Clients ---
import {postgresInstance} from '#db/postgres.js';
import redisClient from '#db/redis.js';

// --- Utility Functions ---
import {generateShortCode} from '#utils/codeGenerator.js';
import {sendMail} from '#utils/email.js';

// --- Data Access Objects (DAOs) ---
// Import DAOs to be injected
import AccountDAO from '#daos/account.dao.js';
import PrincipalDAO from '#daos/principal.dao.js';
import ProfileDAO from '#daos/profile.dao.js';
import RegisteredUserDAO from '#daos/registered-user.dao.js';
import UserProfileDAO from '#daos/user-profile.dao.js';

// --- Data Models ---
import Account from '#models/account.model.js';
import Profile from '#models/profile.model.js';
import RegisteredUser from '#models/registered-user.model.js';
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
} from '#errors/AppError.js';

dotenv.config(); // Ensure environment variables are loaded

const CODE_EXPIRY_MINUTES = 5;

// --- Password Hashing Utilities ---
// (Keep these as module-level functions or move them to a separate utility file)
async function hashPassword(password) {
    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        console.error('[AuthService] Error hashing password:', error);
        throw new InternalServerError('Password processing failed.');
    }
}

async function verifyPassword(hashedPassword, plainPassword) {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        // Handle expected verification failures gracefully
        if (error.code === 'ERR_ARGON2_INVALID_HASH' || error.message.includes('incompatible') || error.message.includes('verification failed')) {
            console.warn('[AuthService] Password verification failed (invalid hash, parameters, or mismatch):', error.message);
            return false; // Indicate verification failure
        }
        // Log unexpected errors during verification
        console.error('[AuthService] Unexpected error during password verification:', error);
        throw new InternalServerError('Password verification encountered an internal error.');
    }
}


/**
 * @class AuthService
 * @description Handles core business logic for authentication, registration, verification.
 */
class AuthService {
    /**
     * Constructor for AuthService.
     * @param {object} accountDao - DAO for Account operations.
     * @param {object} principalDao - DAO for Principal operations.
     * @param {object} profileDao - DAO for Profile operations.
     * @param {object} registeredUserDao - DAO for RegisteredUser operations.
     * @param {object} userProfileDao - DAO for the UserProfile view/query.
     */
    constructor(accountDao, principalDao, profileDao, registeredUserDao, userProfileDao) {
        // Store injected DAOs as instance properties
        this.accountDao = accountDao;
        this.principalDao = principalDao;
        this.profileDao = profileDao;
        this.registeredUserDao = registeredUserDao;
        this.userProfileDao = userProfileDao;
        // Dependencies like redisClient, postgresInstance, utilities can be accessed directly
        // if they are singletons or module exports, or they could also be injected.
    }

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
            console.log(`[AuthService] Verification email successfully sent to ${userEmail}`);
        } catch (error) {
            console.error(`[AuthService] Failed to send verification email to ${userEmail}:`, error);
            // Avoid exposing details, let controller handle generic error
            throw new InternalServerError(`Failed to send verification email.`);
        }
    }

    /**
     * Registers a new user using DAOs within a transaction.
     * Sends a verification email upon successful registration.
     * @param {object} registrationData - Contains username, email, password.
     * @returns {Promise<object>} Safe user data (userId, username, email, isVerified).
     */
    async registerUser(registrationData) {
        const {username, email, password} = registrationData;

        if (!username || !email || !password) {
            throw new BadRequestError('Username, email, and password are required.');
        }

        let createdEntities;
        try {
            createdEntities = await postgresInstance.transaction(async (trx) => {
                // Use injected DAOs, passing transaction object (trx)
                const existingUser = await this.accountDao.getByUsername(username, trx);
                if (existingUser) {
                    throw new ConflictError('Username is already taken.');
                }
                const existingEmail = await this.accountDao.getByEmail(email, trx);
                if (existingEmail) {
                    throw new ConflictError('Email address is already registered.');
                }

                const hashedPassword = await hashPassword(password); // Use helper function

                // Create records using injected DAOs
                const account = new Account(null, username, hashedPassword, email);
                const createdAccount = await this.accountDao.create(account, trx);
                if (!createdAccount?.accountId) throw new Error('DB_INSERT_FAIL: Account');

                const profile = new Profile(null, null, null, null, null, null);
                const createdProfile = await this.profileDao.create(profile, trx);
                if (!createdProfile?.profileId) throw new Error('DB_INSERT_FAIL: Profile');

                const principal = new Principal(null, createdAccount.accountId, createdProfile.profileId, PrincipalRoleEnum.USER);
                const createdPrincipal = await this.principalDao.create(principal, trx);
                if (!createdPrincipal?.principalId) throw new Error('DB_INSERT_FAIL: Principal');

                const registeredUser = new RegisteredUser(null, createdPrincipal.principalId);
                const createdRegisteredUser = await this.registeredUserDao.create(registeredUser, trx);
                if (!createdRegisteredUser?.userId) throw new Error('DB_INSERT_FAIL: RegisteredUser');

                return {
                    account: createdAccount,
                    profile: createdProfile,
                    principal: createdPrincipal,
                    registeredUser: createdRegisteredUser
                };
            }); // End transaction

            // --- Post-Transaction Actions ---
            const {userId} = createdEntities.registeredUser;
            const userEmail = createdEntities.account.email;
            const plainCode = generateShortCode(6);
            const redisKey = `verify:email:${userId}`;
            const redisTTL = CODE_EXPIRY_MINUTES * 60;

            try {
                await redisClient.set(redisKey, plainCode, {EX: redisTTL});
                console.log(`[AuthService] Verification code stored in Redis for userId: ${userId}`);
                await this._sendVerificationEmail(userEmail, plainCode); // Use internal helper
            } catch (cacheOrEmailError) {
                console.error(`[AuthService] Error during post-registration (Redis/Email) for userId ${userId}:`, cacheOrEmailError.message);
                // Decide how to handle this - maybe log and continue, or throw
                // Throwing ensures the user knows something went wrong with verification setup
                throw new InternalServerError('Registration succeeded, but failed to set up email verification.');
            }

            // Return safe user data
            return {
                userId: createdEntities.registeredUser.userId,
                username: createdEntities.account.username,
                email: createdEntities.account.email,
                isVerified: false, // User starts as unverified
            };

        } catch (error) {
            // Handle specific known errors first
            if (error instanceof BadRequestError || error instanceof ConflictError || error instanceof InternalServerError || error instanceof VerificationError) {
                throw error;
            }
            // Handle custom DB failure indicators from transaction
            if (error.message?.startsWith('DB_INSERT_FAIL')) {
                console.error('[AuthService] Registration failed during database insertion:', error.message);
                throw new InternalServerError('Registration failed due to a database error.');
            }
            // Catch-all for unexpected errors
            console.error('[AuthService] User registration process failed unexpectedly:', error);
            throw new InternalServerError('Registration failed due to an unexpected internal error.');
        }
    }


    /**
     * Verifies a user's email address using a submitted code.
     * Finds the userId via Account -> Principal -> RegisteredUser using injected DAOs.
     * Uses RegisteredUserDAO to check and update the isVerified flag within a transaction.
     * @param {string} email - The user's email.
     * @param {string} submittedCode - The code submitted by the user.
     * @returns {Promise<boolean>} True if verification is successful or user already verified.
     */
    async verifyEmail(email, submittedCode) {
        if (!email || !submittedCode) {
            throw new BadRequestError('Email and verification code are required.');
        }

        let userId = null;
        let redisKey = null;

        try {
            // --- 1. Find User ID from Email ---
            // Use injected DAOs sequentially
            const account = await this.accountDao.getByEmail(email);
            if (!account?.accountId) {
                console.warn(`[AuthService] Verification attempt failed: No account found for email ${email}`);
                // Use a generic error to avoid confirming email existence unless intended
                throw new VerificationError('Invalid email or verification code.');
            }

            const principal = await this.principalDao.getByAccountId(account.accountId);
            if (!principal?.principalId) {
                console.error(`[AuthService] Data inconsistency: Account ${account.accountId} found, but no matching Principal.`);
                throw new InternalServerError('User data configuration error during verification.');
            }

            const registeredUser = await this.registeredUserDao.getByPrincipalId(principal.principalId);
            if (!registeredUser?.userId) {
                console.error(`[AuthService] Data inconsistency: Principal ${principal.principalId} found, but no matching RegisteredUser.`);
                throw new InternalServerError('User registration data error during verification.');
            }

            userId = registeredUser.userId;
            redisKey = `verify:email:${userId}`;
            console.log(`[AuthService] Verification lookup: Found userId ${userId} for email ${email}.`);

            // --- 2. Check Verification Code in Redis ---
            const storedCode = await redisClient.get(redisKey);
            if (!storedCode) {
                console.warn(`[AuthService] No verification code found in Redis for key: ${redisKey} (email: ${email})`);
                // Check if already verified before declaring code expired/invalid
                if (registeredUser.isVerified === true) {
                    console.log(`[AuthService] User (userId: ${userId}) is already verified, code check skipped.`);
                    // Optionally delete the key if found but user is verified
                    if (storedCode) await redisClient.del(redisKey);
                    return true;
                }
                throw new VerificationError('Verification code is invalid or has expired. Please request a new one.');
            }

            if (storedCode !== submittedCode) {
                console.warn(`[AuthService] Submitted code mismatch for key ${redisKey}.`);
                throw new VerificationError('Invalid verification code.');
            }

            // --- 3. Update RegisteredUser within a Transaction using RegisteredUserDAO ---
            let alreadyVerified = false;
            const updatePerformed = await postgresInstance.transaction(async (trx) => {
                // Use injected DAO, passing transaction object (trx)
                const userToUpdate = await this.registeredUserDao.getById(userId, trx);
                if (!userToUpdate) {
                    console.error(`[AuthService] Consistency issue inside transaction: RegisteredUser not found for update with userId ${userId}`);
                    throw new InternalServerError('Failed to retrieve user details for verification update.');
                }

                if (userToUpdate.isVerified === true) {
                    console.log(`[AuthService] User (userId: ${userId}) already verified (checked via DAO within transaction).`);
                    alreadyVerified = true;
                    return false; // No DB update needed
                }

                // Use injected DAO's update method
                const updateSuccessful = await this.registeredUserDao.update(userId, {isVerified: true}, trx);
                if (!updateSuccessful) {
                    console.error(`[AuthService] Failed to update RegisteredUser verification status via DAO for userId: ${userId} within transaction.`);
                    throw new InternalServerError('Database update for verification failed.');
                }

                console.log(`[AuthService] User (userId: ${userId}) marked as verified via DAO within transaction.`);
                return true; // Indicate DB update was performed
            });

            // --- 4. Clean up Redis key ---
            // Delete key if update was performed OR if user was found to be already verified
            if (updatePerformed || alreadyVerified) {
                try {
                    await redisClient.del(redisKey);
                    console.log(`[AuthService] Redis key ${redisKey} deleted after successful verification check/update.`);
                } catch (redisError) {
                    // Log error but don't fail the verification process for this
                    console.error(`[AuthService] Non-critical error: Failed to delete Redis key ${redisKey} after verification:`, redisError);
                }
            }

            // --- 5. Return Success ---
            console.log(`[AuthService] Verification process completed for email ${email} (userId: ${userId}). Status updated: ${updatePerformed}`);
            return true;

        } catch (error) {
            // Re-throw known application errors
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof VerificationError || error instanceof InternalServerError || error instanceof ForbiddenError || error instanceof ConflictError) {
                throw error;
            }
            // Handle potential generic DB/Redis/other errors
            console.error(`[AuthService] Email verification process failed unexpectedly for email "${email}" (userId: ${userId || 'N/A'}):`, error);
            throw new InternalServerError('Email verification failed due to an unexpected internal error.');
        }
    }


    /**
     * Authenticates a user based on username and password.
     * Uses injected UserProfileDAO for fetching combined profile data after successful auth.
     * @param {string} username - The username to authenticate.
     * @param {string} password - The plain text password.
     * @returns {Promise<object>} Safe user profile data for the session.
     */
    async login(username, password) {
        if (!username || !password) {
            throw new BadRequestError('Username and password are required.');
        }

        try {
            // Use injected DAO
            const account = await this.accountDao.getByUsername(username);
            // Use a generic error message for failed login attempts
            if (!account) throw new AuthenticationError('Invalid username or password.');

            const isPasswordValid = await verifyPassword(account.password, password);
            if (!isPasswordValid) throw new AuthenticationError('Invalid username or password.');

            // Fetch full user profile using injected UserProfileDAO
            // This DAO should join Account, Principal, Profile, RegisteredUser tables
            const userProfile = await this.userProfileDao.getByUsername(username);
            if (!userProfile?.userId) {
                // This indicates a data integrity issue if account exists but profile doesn't
                console.error(`[AuthService] Data inconsistency: Account found (ID: ${account.accountId}), but UserProfile data missing/incomplete.`);
                throw new NotFoundError('User profile data not found. Please contact support.'); // Or InternalServerError
            }

            // Check verification & status from the comprehensive UserProfile object
            if (!userProfile.isVerified) {
                // Consider allowing login but restricting actions, or throwing ForbiddenError
                throw new ForbiddenError('Your account is not verified. Please check your email.');
            }
            const accountStatus = userProfile.status || 'active'; // Default to active if null
            if (accountStatus !== 'active') {
                let message = 'Your account is currently inactive.';
                if (accountStatus === 'suspended') message = 'Your account has been temporarily suspended.';
                if (accountStatus === 'banned') message = 'Your account has been permanently banned.';
                throw new ForbiddenError(message); // Prevent login for non-active statuses
            }

            // Prepare safe user data from UserProfile model (ensure UserProfileDAO returns these fields)
            const safeUserProfile = {
                userId: userProfile.userId,
                principalId: userProfile.principalId,
                username: userProfile.username,
                email: userProfile.email, // Include email if needed in session/frontend
                displayName: userProfile.displayName,
                avatar: userProfile.avatar,
                karma: userProfile.karma,
                isVerified: userProfile.isVerified,
                status: accountStatus,
                role: userProfile.role, // Include role for authorization checks
            };

            console.log(`[AuthService] User ${username} (userId: ${safeUserProfile.userId}) credentials verified.`);
            return safeUserProfile; // Return data needed for session/token

        } catch (error) {
            // Re-throw known application errors
            if (error instanceof BadRequestError || error instanceof AuthenticationError || error instanceof ForbiddenError || error instanceof NotFoundError || error instanceof InternalServerError) {
                throw error;
            }
            // Catch-all for unexpected errors
            console.error(`[AuthService] Login process failed unexpectedly for username "${username}":`, error);
            throw new InternalServerError('Login failed due to an unexpected internal error.');
        }
    }

    /**
     * Retrieves safe user profile data based on a user ID (typically from a session/token).
     * Uses injected UserProfileDAO.
     * @param {string} userId - The user ID from the validated session/token.
     * @returns {Promise<object>} Safe user profile data.
     */
    async loginWithSession(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required for session validation.');
        }
        try {
            // Use injected UserProfileDAO to get combined data directly by userId
            const userProfile = await this.userProfileDao.getByUserId(userId);
            if (!userProfile?.userId) {
                // User existed previously but might have been deleted
                throw new NotFoundError('User associated with this session not found.');
            }

            // Optional: Re-check status here if critical (e.g., user banned mid-session)
            // const accountStatus = userProfile.status || 'active';
            // if (accountStatus !== 'active' || !userProfile.isVerified) {
            //     console.warn(`[AuthService] Session check failed for userId ${userId} due to status/verification change.`);
            //     throw new ForbiddenError('Account status requires re-authentication.');
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

            console.log(`[AuthService] Session check successful: Retrieved data for userId: ${userId}`);
            return safeUserProfile;

        } catch (error) {
            // Re-throw known application errors
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof InternalServerError) {
                throw error;
            }
            // Catch-all for unexpected errors
            console.error(`[AuthService] Session check failed unexpectedly for userId "${userId}":`, error);
            throw new InternalServerError('Session validation failed due to an unexpected internal error.');
        }
    }
}

export default new AuthService(
    AccountDAO,
    PrincipalDAO,
    ProfileDAO,
    RegisteredUserDAO,
    UserProfileDAO
);
