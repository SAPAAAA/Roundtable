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

// This function checks if the user has admin access
export function grantAccess(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({
            message: 'Forbidden',
            success: false,
        });
    }
}

