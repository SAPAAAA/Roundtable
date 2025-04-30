// src/features/auth/pages/Register/registerAction.jsx
import authService from '#services/authService'; // Import the auth service

export default async function registerAction({request}) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // --- Get the method from the request object ---
    const httpMethod = request.method;

    // Basic validation (optional, can also be done in the service)
    if (!data.email || !data.password || !data.username) { // Add other required fields
        const errorData = {message: 'Missing required registration fields.'};
        throw new Response(JSON.stringify(errorData), {
            status: 400, // Bad Request
            headers: {'Content-Type': 'application/json'}
        });
    }

    try {
        // Call the register method from the authService
        const response = await authService.register(data, httpMethod);

        console.log('Registration action successful, response from service:', response);
        return response;

    } catch (error) {
        // Handle errors thrown by the authService
        console.error("Register action failed:", error.message);

        // Extract error details provided by the service/API call
        const errorData = error.data || {message: error.message || 'Registration failed due to an unexpected error.'};
        const status = error.status || 500;

        // Throw a Response object, which React Router can handle via errorElement
        throw new Response(JSON.stringify(errorData), {
            status: status,
            headers: {'Content-Type': 'application/json'}
        });
    }
}