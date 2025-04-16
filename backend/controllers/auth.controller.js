import AuthService from '#services/auth.service.js';

class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    // Use arrow function syntax
    register = async (req, res, next) => {
        try {
            console.log('Request body:', req.body);
            const {fullName, username, email, password} = req.body;
            const data = await this.authService.registerUser({fullName, username, email, password});
            if (data) {
                return res.status(201).json({
                    message: data.message,
                    success: data.success,
                    user: data.user,
                });
            }
        } catch (error) {
            // It's good practice to log the actual error
            console.error("Registration Error:", error);
            return res.status(error.statusCode).json({
                message: 'Internal server error',
                error: error.message,
                success: false,
            });
        }
    }

    // Use arrow function syntax
    login = async (req, res, next) => {
        try {
            // 'this' will now correctly refer to the AuthController instance
            const {username, password} = req.body;
            console.log('Login attempt with:', {username, password});
            const data = await this.authService.login(username, password);
            if (data) {
                return res.status(200).json(data);
            } else {
                return res.status(401).json({message: 'Tên dăng nhập hoặc mật khẩu không chính xác'});
            }
        } catch (error) {
            // It's good practice to log the actual error
            if (error.statusCode === 401) {
                console.error("Login Error:", error);
                return res.status(401).json({
                    message: 'Tên dăng nhập hoặc mật khẩu không chính xác',
                    success: false,
                });
            }
        }
    }

    verifyEmail = async (req, res, next) => {
        try {
            const {email, code} = req.body;
            const result = await this.authService.verifyEmail(email, code);
            if (result) {
                return res.status(200).json({
                    message: result.message,
                    success: result.success,
                });
            } else {
                return res.status(400).json({message: 'Mã xác thực không chính xác'});
            }
        } catch (error) {
            console.error("Email Verification Error:", error);
            return res.status(error.statusCode).json({
                message: 'Internal server error',
                error: error.message,
                success: false,
            });
        }
    }
}

export default new AuthController(AuthService);