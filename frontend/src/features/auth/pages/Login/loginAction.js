// src/features/auth/pages/Login/loginAction.js
import {sendApiRequest} from '#utils/apiClient';

export default async function loginAction({request}) { // Destructure request here
    // --- Form Data Handling ---
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // --- Get the method from the request object ---
    const httpMethod = request.method;

    console.log('Login action data:', data);
    console.log('Request method:', httpMethod); // Will log "POST" if set correctly in the Form

    try {
        // Use the standalone function, passing the dynamic method and body
        const response = await sendApiRequest('http://localhost:5000/api/auth/login', {
            method: httpMethod,
            body: data
        });

        // ... (rest of your success handling remains the same)
        return {
            success: response.success,
            error: false,
            message: response.message || "Đăng nhập thành công.",
            status: 200,
            user: response.user,
        }

    } catch (error) {
        // ... (rest of your error handling remains the same)
        if (error.status === 401 || error.status === 400) {
            console.error("Login failed:", error);
            return {
                success: false,
                error: true,
                message: error.message || "Tên đăng nhập hoặc mật khẩu không chính xác.",
                status: error.status,
            }
        }
        console.error("Server error during login:", error);
        return {
            success: false,
            error: true,
            message: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
            status: error.status || 500,
        }
    }
}