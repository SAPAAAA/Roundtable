import multer from 'multer';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';

import {AppError, BadRequestError, InternalServerError,} from '#errors/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Default Configurations ---
const DEFAULT_STORAGE_ENGINE = multer.memoryStorage();

const DEFAULT_DISK_STORAGE = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadSubDir = file.fieldname || 'general_uploads';
        const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', uploadSubDir); // e.g., project_root/public/uploads/general_uploads
        fs.mkdirSync(uploadDir, {recursive: true});
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.originalname.split('.')[0]}-${uniqueSuffix}${extension}`);
    }
});

const DEFAULT_LIMITS = {
    fileSize: 5 * 1024 * 1024, // 5MB
};

// --- Error Mapping ---
const mapMulterErrorToAppError = (err) => {
    if (err instanceof AppError) {
        return err;
    }

    if (err instanceof multer.MulterError) {
        const fieldInfo = err.field ? ` (Field: ${err.field})` : '';
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return new BadRequestError(`File too large.${fieldInfo}`);
            case 'LIMIT_FILE_COUNT':
                return new BadRequestError(`Too many files.${fieldInfo}`);
            case 'LIMIT_FIELD_KEY':
                return new BadRequestError(`Field name is too long.${fieldInfo}`);
            case 'LIMIT_FIELD_VALUE':
                return new BadRequestError(`Field value is too long.${fieldInfo}`);
            case 'LIMIT_FIELD_COUNT':
                return new BadRequestError('Too many fields in the form.');
            case 'LIMIT_UNEXPECTED_FILE':
                return new BadRequestError(`Unexpected file or file type not allowed.${fieldInfo}`);
            case 'LIMIT_PART_COUNT':
                return new BadRequestError('Form data has too many parts (fields + files).');
            default:
                return new BadRequestError(`File upload error: ${err.message}.${fieldInfo}`);
        }
    }
    console.error('Unknown upload error:', err);
    return new InternalServerError(err.message || 'An unexpected error occurred during file upload.');
};

// --- Multer Instance Creator ---
const createMulterInstance = (customOptions = {}) => {
    let storage = customOptions.storage || DEFAULT_STORAGE_ENGINE;
    if (typeof customOptions.storage === 'string') {
        if (customOptions.storage.toLowerCase() === 'disk') {
            storage = DEFAULT_DISK_STORAGE;
        } else if (customOptions.storage.toLowerCase() === 'memory') {
            storage = multer.memoryStorage();
        }
    }

    const fileFilter = customOptions.fileFilter || availableFilters.imagesOnly; // Defaulting to imagesOnly filter
    const limits = {...DEFAULT_LIMITS, ...customOptions.limits};

    return multer({
        storage,
        fileFilter,
        limits
    });
};

// --- Middleware Wrapper for Error Handling ---
const wrapMulterMiddleware = (multerMiddlewareFn) => {
    return (req, res, next) => {
        multerMiddlewareFn(req, res, (err) => {
            if (err) {
                const appError = mapMulterErrorToAppError(err);
                return next(appError);
            }
            next();
        });
    };
};

// --- Exportable Middleware Generators ---
export const handleFieldsUpload = (fieldArray, customMulterOptions) => {
    if (!Array.isArray(fieldArray) || fieldArray.length === 0) {
        throw new BadRequestError('fieldArray must be a non-empty array of field configurations.');
    }
    fieldArray.forEach(field => {
        if (!field.name || typeof field.name !== 'string') {
            throw new BadRequestError('Each field configuration in fieldArray must have a "name" property (string).');
        }
        if (field.maxCount !== undefined && (typeof field.maxCount !== 'number' || field.maxCount < 1)) {
            throw new BadRequestError(`Field "${field.name}" must have a valid "maxCount" property (positive number) if provided.`);
        }
    });

    const instance = createMulterInstance(customMulterOptions);
    const rawMulterMiddleware = instance.fields(fieldArray);
    return wrapMulterMiddleware(rawMulterMiddleware);
};

export const handleSingleUpload = (fieldName, customMulterOptions) => {
    if (!fieldName || typeof fieldName !== 'string') {
        throw new BadRequestError('fieldName must be a non-empty string.');
    }
    const instance = createMulterInstance(customMulterOptions);
    const rawMulterMiddleware = instance.single(fieldName);
    return wrapMulterMiddleware(rawMulterMiddleware);
};

export const handleArrayUpload = (fieldName, maxCount, customMulterOptions) => {
    if (!fieldName || typeof fieldName !== 'string') {
        throw new BadRequestError('fieldName must be a non-empty string.');
    }
    if (typeof maxCount !== 'number' || maxCount < 1) {
        throw new BadRequestError('maxCount must be a positive number.');
    }
    const instance = createMulterInstance(customMulterOptions);
    const rawMulterMiddleware = instance.array(fieldName, maxCount);
    return wrapMulterMiddleware(rawMulterMiddleware);
};

// --- Exportable Pre-defined Filters and Storages ---
export const availableStorages = {
    memory: multer.memoryStorage(),
    defaultDisk: DEFAULT_DISK_STORAGE,
    userUploadsDisk: multer.diskStorage({ // Example specific disk storage
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'users');
            fs.mkdirSync(uploadDir, {recursive: true});
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
        }
    })
};

export const availableFilters = {
    imagesOnly: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        const err = new BadRequestError(
            `Invalid file type for field '${file.fieldname}'. Only JPEG, JPG, PNG, GIF, or WEBP images are allowed.`
        );
        cb(err, false);
    },
    pdfOnly: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            const err = new BadRequestError(
                `Invalid file type for field '${file.fieldname}'. Only PDF files are allowed.`
            );
            cb(err, false);
        }
    },
    anyFile: (req, file, cb) => cb(null, true),
};