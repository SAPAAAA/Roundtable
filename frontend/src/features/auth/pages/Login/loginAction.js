import {sendApiRequest} from "@hooks/apiClient.jsx";

export default async function loginAction({request}) {
    // --- Form Data Handling ---
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    console.log('Login action data:', data);

    try {
        // Use the standalone function, passing method and body
        const response = await sendApiRequest('/api/login', {
            method: 'POST',
            body: data
        });

        console.log('Login successful:', response);

        return {
            success: response.success,
            error: false,
            message: response.message || "Đăng nhập thành công.",
            status: 200,
            user: response.user,
        }

    } catch (error) {
        if (error.status === 401 || error.status === 400) {
            // Case 1: Login Failed - Unauthorized (401) or Bad Request (400)
            console.error("Login failed:", error);
            return {
                success: error.success,
                error: error.error,
                message: error.message || "Tên đăng nhập hoặc mật khẩu không chính xác.",
                status: error.status,
            }
        }
        // Case 2: Other Server Errors (e.g., 500 Internal Server Error)
        console.error("Server error during login:", error);
        // Return a generic server error message
        return {
            success: false,
            error: true,
            message: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.",
            status: error.status || 500,
        }
    }
}