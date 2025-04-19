import argon2 from 'argon2';
import dotenv from 'dotenv';
// --- Database Clients ---
import postgres from '#db/postgres.js';
import redis from '#db/redis.js'; // Redis client instance
// --- Utility Functions ---
import {generateShortCode} from '#utils/codeGenerator.js'; // Utility for generating short codes
import {sendMail} from '#utils/email.js'; // Utility for sending emails
// --- Data Access Objects (DAOs) ---
import accountDao from '#daos/account.dao.js';
import profileDao from '#daos/profile.dao.js';
import PrincipalDAO from '#daos/principal.dao.js';
// Ensure DAOs used within transactions can accept the transaction object (trx)
import registeredUserDao from '#daos/registeredUser.dao.js';
import userProfileDao from '#daos/userProfile.dao.js';
// --- Data Models ---
import Account from '#models/account.model.js';
import Profile from '#models/profile.model.js';
import RegisteredUser from '#models/registeredUser.model.js';
import Principal, {PrincipalRoleEnum} from '#models/principal.model.js';
// --- Constants ---
import HTTP_STATUS from '#constants/httpStatus.js'; // HTTP status codes
import {HASH_OPTIONS} from '#constants/security.js';

// Configure environment variables
dotenv.config();

const CODE_EXPIRY_MINUTES = 5; // Expiry time for email verification codes


// --- Password Hashing Utilities ---
// (hashPassword and verifyPassword functions remain the same as previous version)
async function hashPassword(password) {
    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Password processing failed.');
    }
}

async function verifyPassword(hashedPassword, plainPassword) {
    try {
        console.log(hashedPassword, plainPassword);
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        if (error.code === 'ERR_ARGON2_INVALID_HASH' || error.message.includes('incompatible') || error.message.includes('verification failed')) {
            console.error('Password verification failed (invalid hash, parameters, or mismatch):', error.message);
            return false;
        }
        console.error('Unexpected error during password verification:', error);
        throw new Error('Password verification encountered an internal error.');
    }
}


/**
 * @class AuthService
 * @description Handles user authentication, registration, and email verification logic.
 */
class AuthService {

    // _sendVerificationEmail method remains the same
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
            throw new Error(`Failed to send verification email. Your account is registered, but please request a new verification code or contact support if you don't receive it.`);
        }
    }

    // registerUser method remains the same as the previous version with transaction
    async registerUser(registrationData) {
        const {fullName, username, email, password} = registrationData;

        if (!username || !email || !password || !fullName) {
            const error = new Error('Full name, username, email, and password are required.');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        let createdEntities;

        try {
            createdEntities = await postgres.transaction(async (trx) => {
                const existingUser = await accountDao.getByUsername(username);
                if (existingUser) {
                    const error = new Error('Username is already taken.');
                    error.statusCode = HTTP_STATUS.CONFLICT;
                    throw error;
                }

                const existingEmail = await accountDao.getByEmail(email);
                if (existingEmail) {
                    const error = new Error('Email address is already registered.');
                    error.statusCode = HTTP_STATUS.CONFLICT;
                    throw error;
                }

                const hashedPassword = await hashPassword(password);

                const account = new Account(null, username, hashedPassword, email);
                const createdAccount = await accountDao.create(account, trx);
                if (!createdAccount?.accountId) throw new Error('Failed to create account record.');

                const profile = new Profile(null, null, null, null, null, fullName);
                const createdProfile = await profileDao.create(profile, trx);
                if (!createdProfile?.profileId) throw new Error('Failed to create profile record.');

                const principal = new Principal(null, createdAccount.accountId, createdProfile.profileId, PrincipalRoleEnum.USER);
                const createdPrincipal = await PrincipalDAO.create(principal, trx);
                if (!createdPrincipal?.principalId) throw new Error('Failed to create principal record.');

                const registeredUser = new RegisteredUser(null, createdPrincipal.principalId);
                const createdRegisteredUser = await registeredUserDao.create(registeredUser, trx);
                if (!createdRegisteredUser?.userId) throw new Error('Failed to create registered user record.');

                return {
                    account: createdAccount,
                    profile: createdProfile,
                    principal: createdPrincipal,
                    registeredUser: createdRegisteredUser,
                };
            }); // End of postgres.transaction block

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
                throw cacheOrEmailError;
            }

            return {
                message: 'Registration successful. Please check your email for a verification code.',
                success: true,
                user: {
                    userId: createdEntities.registeredUser.userId,
                    principalId: createdEntities.principal.principalId,
                    username: createdEntities.account.username,
                    displayName: createdEntities.profile.displayName,
                    email: createdEntities.account.email,
                    isVerified: false, // Initially set to false until verified
                },
            };

        } catch (error) {
            console.error('User registration process failed:', error.message);
            if (!error.statusCode) {
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                if (!error.message || error.message === 'Password processing failed.' || error.message.startsWith('Failed to create')) {
                    error.message = 'Registration failed due to an unexpected internal error. Please try again later.';
                }
            }
            if (error.statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                console.error(error.stack);
            }
            throw error;
        }
    }


    /**
     * Verifies a user's email address using a submitted code.
     * Updates the isVerified flag on the RegisteredUser table within a transaction.
     */
    async verifyEmail(email, submittedCode) {
        if (!email || !submittedCode) {
            const error = new Error('Email and verification code are required.');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        let userId = null;
        let redisKey = null; // Define redisKey here to use it after the transaction

        try {
            // --- 1. Find User Profile (View) to get IDs ---
            // This read operation doesn't strictly need to be in the transaction.
            const userProfile = await userProfileDao.getByEmail(email);

            if (!userProfile || !userProfile.userId) {
                if (userProfile) console.warn(`UserProfile found for email ${email} but missing userId.`);
                const error = new Error('Account not found or verification failed.');
                error.statusCode = HTTP_STATUS.NOT_FOUND; // 404
                throw error;
            }

            userId = userProfile.userId;
            redisKey = `verify:email:${userId}`; // Construct Redis key

            // --- 2. Check Verification Code in Redis (before DB transaction) ---
            const storedCode = await redis.get(redisKey);

            if (!storedCode) {
                console.warn(`No verification code found in Redis for key: ${redisKey}`);
                const error = new Error('Invalid or expired verification code.');
                error.statusCode = HTTP_STATUS.UNAUTHORIZED; // 401 or 400
                throw error;
            }

            if (storedCode !== submittedCode) {
                console.warn(`Submitted code mismatch for key ${redisKey}. Stored: ${storedCode}, Submitted: ${submittedCode}`);
                const error = new Error('Invalid or expired verification code.');
                error.statusCode = HTTP_STATUS.UNAUTHORIZED; // 401
                throw error;
            }

            // --- 3. Update RegisteredUser within a Transaction ---
            // Start transaction to ensure fetch + update is atomic.
            const updateSuccessful = await postgres.transaction(async (trx) => {
                // Fetch the RegisteredUser record *within the transaction*
                // Pass `trx` to the DAO method.
                const userToUpdate = await registeredUserDao.getById(userId);

                if (!userToUpdate) {
                    // Should not happen if userProfile was found, but handle defensively.
                    console.error(`Consistency issue inside transaction: RegisteredUser not found for update with userId ${userId}`);
                    // Throwing error here triggers automatic rollback
                    throw new Error('Failed to retrieve user details for verification update.');
                }

                // Check if already verified *within the transaction* to handle race conditions
                if (userToUpdate.isVerified) {
                    console.log(`User (userId: ${userId}) already verified (checked inside transaction).`);
                    // Return a specific value or flag indicating already verified,
                    // so we can skip the Redis delete later if needed, or just handle it.
                    // Here we'll return `false` to indicate no update was needed.
                    return false; // No update needed
                }

                // Update the flag
                userToUpdate.isVerified = true;

                // Persist the change using the DAO's update method *within the transaction*
                // Pass `trx` to the DAO method.
                const updatedUser = await registeredUserDao.update(userId, userToUpdate, trx);

                if (!updatedUser) {
                    console.error(`Failed to update RegisteredUser verification status in DB for userId: ${userId} within transaction.`);
                    // Throwing error here triggers automatic rollback
                    throw new Error('Database update for verification failed.');
                }

                console.log(`User (userId: ${userId}) marked as verified within transaction.`);
                // If all steps succeed, the transaction wrapper will COMMIT automatically.
                return true; // Indicate update was performed
            }); // End of postgres.transaction block

            // --- 4. Clean up Redis key ---
            await redis.del(redisKey);
            console.log(`Redis key ${redisKey} deleted after successful verification check/update.`);

            // --- 5. Return Success Response ---
            const message = updateSuccessful
                ? 'Email verified successfully.'
                : 'Email is already verified.'; // Adjust message if no update occurred

            console.log(`Verification process completed for email ${email} (userId: ${userId}). Status: ${message}`);
            return {
                success: true,
                message: message,
            };

        } catch (error) {
            // Catches errors from:
            // 1. Initial UserProfile lookup.
            // 2. Redis operations (get).
            // 3. The database transaction (fetch/update) - after automatic rollback.
            // 4. Redis delete operation *after* a potentially successful transaction.
            console.error(`Email verification process failed for email "${email}" (userId: ${userId || 'N/A'}):`, error.message);

            if (!error.statusCode) {
                // Assign generic server error if needed, but try to preserve specific messages
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                if (!error.message || error.message === 'Database update for verification failed.' || error.message.startsWith('Failed to retrieve')) {
                    error.message = 'Email verification failed due to an unexpected internal error.';
                }
            }
            if (error.statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                console.error(error.stack);
            }
            throw error; // Re-throw the error with statusCode
        }
    }

    // login method remains the same as previous version
    async login(username, password) {
        if (!username || !password) {
            const error = new Error('Username and password are required.');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        try {
            const account = await accountDao.getByUsername(username);
            if (!account) {
                const error = new Error('Invalid username or password.');
                error.statusCode = HTTP_STATUS.UNAUTHORIZED;
                throw error;
            }

            let isPasswordValid;
            try {
                isPasswordValid = await verifyPassword(account.password, password);
            } catch (verificationError) {
                console.error(`Internal error during password verification for ${username}:`, verificationError);
                const error = new Error('Login failed due to a server issue during authentication.');
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                throw error;
            }

            if (!isPasswordValid) {
                console.log('111')
                const error = new Error('Invalid username or password.');
                error.statusCode = HTTP_STATUS.UNAUTHORIZED;
                throw error;
            }

            const userProfile = await userProfileDao.getByAccountId(account.accountId);
            if (!userProfile) {
                console.error(`Data inconsistency: Account found for username ${username} (ID: ${account.accountId}), but no UserProfile found.`);
                const error = new Error('Login failed due to an internal account configuration issue.');
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                throw error;
            }

            if (!userProfile.isVerified) {
                console.warn(`Login attempt failed for ${username}: Account not verified.`);
                const error = new Error('Account not verified. Please check your email for the verification code or request a new one.');
                error.statusCode = HTTP_STATUS.FORBIDDEN;
                throw error;
            }

            if (userProfile.status && userProfile.status !== 'active') {
                console.warn(`Login attempt failed for ${username}: Account status is '${userProfile.status}'.`);
                let message = 'Your account is currently inactive.';
                if (userProfile.status === 'suspended') message = 'Your account has been temporarily suspended.';
                if (userProfile.status === 'banned') message = 'Your account has been banned.';

                const error = new Error(message);
                error.statusCode = HTTP_STATUS.FORBIDDEN;
                throw error;
            }

            const safeUserProfile = {
                userId: userProfile.userId,
                principalId: userProfile.principalId,
                username: userProfile.username,
                email: userProfile.email,
                displayName: userProfile.displayName,
                avatar: userProfile.avatar,
                karma: userProfile.karma,
                isVerified: userProfile.isVerified,
                status: userProfile.status,
                role: userProfile.role,
            };

            // TODO: Generate JWT or session token here
            // const token = generateAuthToken(safeUserProfile.principalId, safeUserProfile.role);

            console.log(`User ${username} (userId: ${safeUserProfile.userId}) logged in successfully.`);

            return {
                success: true,
                message: 'Đăng nhập thành công.',
                user: safeUserProfile
                // token: token
            };

        } catch (error) {
            console.error(`Login process failed for username "${username}":`, error.message);
            if (!error.statusCode) {
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                if (!error.message || error.message === 'Login failed due to a server issue during authentication.' || error.message.startsWith('Data inconsistency')) {
                    error.message = 'Login failed due to an unexpected internal error.';
                }
            }
            if (error.statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                console.error(error.stack);
            }
            if (error.statusCode === HTTP_STATUS.UNAUTHORIZED) {
                console.warn(`Unauthorized access attempt for username "${username}":`, error.message);
            }
            throw error; // Re-throw the error with statusCode
        }
    }
    async loginWithSession(userId) {
        if (!userId) {
            const error = new Error('User ID is required.');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw error;
        }

        try {
            const userProfile = await userProfileDao.getByUserId(userId);
            if (!userProfile) {
                const error = new Error('User not found.');
                error.statusCode = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            return {
                success: true,
                message: 'Session is valid.',
                user: userProfile,
            };
        } catch (error) {
            console.error(`Session check failed for userId "${userId}":`, error.message);
            if (!error.statusCode) {
                error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                if (!error.message || error.message === 'User not found.') {
                    error.message = 'Session validation failed due to an unexpected internal error.';
                }
            }
            if (error.statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
                console.error(error.stack);
            }
            throw error; // Re-throw the error with statusCode
        }
    }
}

// Export a singleton instance of the service
export default new AuthService();