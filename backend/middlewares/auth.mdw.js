export default function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({
            message: 'Unauthorized',
            success: false,
        });
    }
}

// This function is the opposite of isAuthenticated
export function isNotAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return res.status(401).json({
            message: 'Already authenticated',
            success: false,
        });
    } else {
        return next();
    }
}

