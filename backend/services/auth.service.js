// backend/services/auth.service.js
import argon2 from 'argon2';
import dotenv from 'dotenv';
import {postgresInstance} from '#db/postgres.js';
import redisClient from '#db/redis.js';
import {generateShortCode} from '#utils/codeGenerator.js';
import {sendMail} from '#utils/email.js';
import AccountDAO from '#daos/account.dao.js';
import PrincipalDAO from '#daos/principal.dao.js';
import ProfileDAO from '#daos/profile.dao.js';
import RegisteredUserDAO from '#daos/registered-user.dao.js';
import UserProfileDAO from '#daos/user-profile.dao.js';
import Account from '#models/account.model.js';
import Profile from '#models/profile.model.js';
import RegisteredUser from '#models/registered-user.model.js';
import Principal, {PrincipalRoleEnum} from '#models/principal.model.js';
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

dotenv.config();

const CODE_EXPIRY_MINUTES = 5;

async function hashPassword(password) {
    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        console.error('[AuthService] Error hashing password:', error);
        throw new InternalServerError('Password processing failed.'); // Service throws specific internal error
    }
}

async function verifyPassword(hashedPassword, plainPassword) {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        if (error.code === 'ERR_ARGON2_INVALID_HASH' || error.message.includes('incompatible') || error.message.includes('verification failed')) {
            return false; // Indicates verification failure, not an internal error
        }
        console.error('[AuthService] Unexpected error during password verification:', error);
        throw new InternalServerError('Password verification encountered an internal error.');
    }
}

class AuthService {
    constructor(accountDao, principalDao, profileDao, registeredUserDao, userProfileDao) {
        this.accountDao = accountDao;
        this.principalDao = principalDao;
        this.profileDao = profileDao;
        this.registeredUserDao = registeredUserDao;
        this.userProfileDao = userProfileDao;
    }

    async _sendVerificationEmail(userEmail, plainCode) {
        const subject = 'Your Email Verification Code';
        const expiryMessage = `This code is valid for ${CODE_EXPIRY_MINUTES} minutes.`;
        const html = `
            <h1>Verify Your Email Address</h1>
            <p>Please use the following code to verify your email:</p>
            <p style="font-size: 24px; font-weight: bold;">${plainCode}</p>
            <p><em>${expiryMessage}</em></p>`;
        try {
            await sendMail(userEmail, subject, html); // Assuming sendMail is robust
        } catch (error) {
            console.error(`[AuthService] Failed to send verification email to ${userEmail}:`, error);
            throw new InternalServerError('Failed to send verification email.'); // Let controller handle generic error message
        }
    }

    async registerUser(registrationData) {
        const {username, email, password} = registrationData;

        if (!username || !email || !password) {
            throw new BadRequestError('Username, email, and password are required.');
        }
        // Add more validation (e.g., email format, password strength) here if desired

        let createdEntities;
        try {
            createdEntities = await postgresInstance.transaction(async (trx) => {
                const existingUser = await this.accountDao.getByUsername(username, trx);
                if (existingUser) {
                    throw new ConflictError('Username is already taken.');
                }
                const existingEmail = await this.accountDao.getByEmail(email, trx);
                if (existingEmail) {
                    throw new ConflictError('Email address is already registered.');
                }

                const hashedPassword = await hashPassword(password);

                const account = new Account(null, username, hashedPassword, email)
                const createdAccount = await this.accountDao.create(account, trx);
                if (!createdAccount?.accountId) {
                    throw new Error('DB_INSERT_FAIL: Account');
                }

                const profile = new Profile(null, null, null, null, null, username); // Default displayName to username
                const createdProfile = await this.profileDao.create(profile, trx);
                if (!createdProfile?.profileId) {
                    throw new Error('DB_INSERT_FAIL: Profile');
                }

                const principal = new Principal(null, createdAccount.accountId, createdProfile.profileId, PrincipalRoleEnum.USER);
                const createdPrincipal = await this.principalDao.create(principal, trx);
                if (!createdPrincipal?.principalId) {
                    throw new Error('DB_INSERT_FAIL: Principal');
                }

                const registeredUser = new RegisteredUser(null, createdPrincipal.principalId);
                const createdRegisteredUser = await this.registeredUserDao.create(registeredUser, trx);
                if (!createdRegisteredUser?.userId) {
                    throw new Error('DB_INSERT_FAIL: RegisteredUser');
                }

                return {account: createdAccount, registeredUser: createdRegisteredUser};
            });

            const {userId} = createdEntities.registeredUser;
            const userEmail = createdEntities.account.email;
            const plainCode = generateShortCode(6);
            const redisKey = `verify:email:${userId}`; // Use userId as it's the public-facing ID
            const redisTTL = CODE_EXPIRY_MINUTES * 60;

            try {
                await redisClient.set(redisKey, plainCode, {EX: redisTTL});
                await this._sendVerificationEmail(userEmail, plainCode);
            } catch (cacheOrEmailError) {
                console.error(`[AuthService] Error during post-registration (Redis/Email) for userId ${userId}:`, cacheOrEmailError.message);
                // This is a critical part of registration; if it fails, the user experience is broken.
                throw new InternalServerError('Registration succeeded, but failed to set up email verification. Please try registering again or contact support.');
            }

            return { // Return data that the controller might need
                userId: createdEntities.registeredUser.userId,
                username: createdEntities.account.username,
                email: createdEntities.account.email,
                isVerified: false,
            };

        } catch (error) {
            if (error instanceof BadRequestError || error instanceof ConflictError || error instanceof InternalServerError) {
                throw error; // Re-throw known application errors
            }
            if (error.message?.startsWith('DB_INSERT_FAIL')) {
                console.error('[AuthService] Registration DB insertion failed:', error.message);
                throw new InternalServerError('Registration failed due to a database error.');
            }
            console.error('[AuthService] User registration unexpected error:', error);
            throw new InternalServerError('An unexpected error occurred during registration.');
        }
    }

    async login(username, password) {
        if (!username || !password) {
            throw new BadRequestError('Username and password are required.');
        }

        try {
            const account = await this.accountDao.getByUsername(username);
            if (!account) {
                throw new AuthenticationError('Invalid username or password.');
            }

            const isPasswordValid = await verifyPassword(account.password, password);
            if (!isPasswordValid) {
                throw new AuthenticationError('Invalid username or password.');
            }

            // Fetch the full user profile using the UserProfileDAO
            const userProfile = await this.userProfileDao.getByUsername(username); // Assuming UserProfileDAO connects all tables
            if (!userProfile?.userId) {
                console.error(`[AuthService] Data inconsistency: Account found (ID: ${account.accountId}), but UserProfile data missing.`);
                throw new NotFoundError('User profile data not found. Please contact support.'); // Or InternalServerError
            }

            if (!userProfile.isVerified) {
                throw new ForbiddenError('Your account is not verified. Please check your email.');
            }
            if (userProfile.status !== 'active') {
                let message = 'Your account is currently inactive.';
                if (userProfile.status === 'suspended') {
                    message = 'Your account has been temporarily suspended.';
                }
                if (userProfile.status === 'banned') {
                    message = 'Your account has been permanently banned.';
                }
                throw new ForbiddenError(message);
            }

            // Return only necessary and safe data for the session/client
            return {
                userId: userProfile.userId,
                principalId: userProfile.principalId,
                username: userProfile.username,
                email: userProfile.email,
                displayName: userProfile.displayName,
                avatar: userProfile.avatar,
                karma: userProfile.karma,
                isVerified: userProfile.isVerified,
                status: userProfile.status,
                role: userProfile.role, // Assuming 'role' is on UserProfile view from Principal table
            };
        } catch (error) {
            if (error instanceof BadRequestError || error instanceof AuthenticationError || error instanceof ForbiddenError || error instanceof NotFoundError || error instanceof InternalServerError) {
                throw error;
            }
            console.error(`[AuthService] Login process failed for username "${username}":`, error);
            throw new InternalServerError('An unexpected error occurred during login.');
        }
    }

    async verifyEmail(email, submittedCode) {
        if (!email || !submittedCode) {
            throw new BadRequestError('Email and verification code are required.');
        }

        let userId; // To keep track for logging
        try {
            const account = await this.accountDao.getByEmail(email);
            if (!account?.accountId) {
                throw new VerificationError('Invalid email or verification code.'); // Generic to prevent email enumeration
            }

            const principal = await this.principalDao.getByAccountId(account.accountId);
            if (!principal?.principalId) {
                console.error(`[AuthService] Data inconsistency: Account ${account.accountId} has no Principal.`);
                throw new InternalServerError('User data configuration error.');
            }

            const registeredUser = await this.registeredUserDao.getByPrincipalId(principal.principalId);
            if (!registeredUser?.userId) {
                console.error(`[AuthService] Data inconsistency: Principal ${principal.principalId} has no RegisteredUser.`);
                throw new InternalServerError('User registration data error.');
            }
            userId = registeredUser.userId; // For logging and Redis key

            // Check if already verified first
            if (registeredUser.isVerified) {
                // Optionally delete the code if it exists, but main thing is user is already verified
                await redisClient.del(`verify:email:${userId}`);
                return true; // Indicate success as user is already verified
            }

            const redisKey = `verify:email:${userId}`;
            const storedCode = await redisClient.get(redisKey);

            if (!storedCode) {
                throw new VerificationError('Verification code is invalid or has expired. Please request a new one.');
            }
            if (storedCode !== submittedCode) {
                throw new VerificationError('Invalid verification code.');
            }

            // If code is valid, update user status and delete code
            const updateSuccessful = await postgresInstance.transaction(async (trx) => {
                return await this.registeredUserDao.update(userId, {isVerified: true}, trx);
            });

            if (!updateSuccessful) {
                console.error(`[AuthService] Failed to update RegisteredUser ${userId} as verified.`);
                throw new InternalServerError('Failed to update verification status.');
            }

            await redisClient.del(redisKey);
            return true; // Verification successful

        } catch (error) {
            if (error instanceof BadRequestError || error instanceof VerificationError || error instanceof InternalServerError || error instanceof NotFoundError) {
                throw error;
            }
            console.error(`[AuthService] Email verification failed for email "${email}" (userId: ${userId || 'N/A'}):`, error);
            throw new InternalServerError('An unexpected error occurred during email verification.');
        }
    }


    async loginWithSession(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required for session validation.');
        }
        try {
            const userProfile = await this.userProfileDao.getByUserId(userId);
            if (!userProfile?.userId) {
                throw new NotFoundError('User associated with this session not found.'); // Could be stale session
            }

            // Optionally, re-check status or verification if critical for every session request
            // if (!userProfile.isVerified || userProfile.status !== 'active') {
            //     throw new ForbiddenError('Account status requires re-authentication.');
            // }

            return { // Return only necessary and safe data
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
        } catch (error) {
            if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof InternalServerError) {
                throw error;
            }
            console.error(`[AuthService] Session check failed for userId "${userId}":`, error);
            throw new InternalServerError('An unexpected error occurred during session validation.');
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