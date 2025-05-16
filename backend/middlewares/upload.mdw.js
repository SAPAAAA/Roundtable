import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { BadRequestError, InternalServerError } from '#errors/AppError.js';
import { generateUniqueFilename } from '#utils/fileUtils.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure temp directory exists with absolute path
const tempDir = path.join(__dirname, 'temp');
try {
    await fs.mkdir(tempDir, { recursive: true });
} catch (error) {
    console.error('[Upload Middleware] Error creating temp directory:', error);
    throw new InternalServerError('Failed to initialize upload directory');
}

// Configure storage
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Ensure temp directory exists before storing file
            await fs.mkdir(tempDir, { recursive: true });
            cb(null, tempDir);
        } catch (error) {
            cb(new InternalServerError('Failed to create upload directory'), null);
        }
    },
    filename: function (req, file, cb) {
        // Use the shared filename generation function
        const filename = generateUniqueFilename(file.originalname);
        cb(null, filename);
    }
});

// File filter to only accept image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Only image files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 2 // Maximum 2 files (icon and banner)
    }
});

// Middleware for handling subtable image uploads
export const uploadSubtableImages = upload.fields([
    {name: 'iconFile', maxCount: 1},
    {name: 'bannerFile', maxCount: 1}
]);

// Error handling middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded. Maximum is 2 files (icon and banner).'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + err.message
        });
    }
    if (err instanceof BadRequestError) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
}; 