import path from 'path';

/**
 * Generates a unique filename for uploaded files.
 * Uses timestamp and random string to ensure uniqueness.
 * @param {string} originalFilename - The original filename to get extension from
 * @returns {string} A unique filename with the same extension as the original
 */
export function generateUniqueFilename(originalFilename) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8); // 6 chars
    const ext = path.extname(originalFilename);
    return `${timestamp}-${randomString}${ext}`;
} 