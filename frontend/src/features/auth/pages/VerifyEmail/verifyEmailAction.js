import {sendApiRequest} from "@hooks/apiClient.jsx";

export default async function verifyEmailAction({request}) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries()); // Adjust data extraction if needed

    try {
        const responseData = await sendApiRequest('/api/verify-email', {
            method: 'POST', // Adjust method if needed
            body: data
        });
        console.log('Email verification successful:', responseData);
        return responseData;
    } catch (error) {
        console.error("Verify email action failed:", error);
        const errorData = error.data || {message: error.message || 'Email verification failed.'};
        const status = error.status || 500;
        throw new Response(JSON.stringify(errorData), {
            status: status,
            headers: {'Content-Type': 'application/json'}
        });
    }
}