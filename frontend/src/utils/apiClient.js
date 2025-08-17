// src/utils/apiClient.js (Create this new file or add to an existing utility file)

/**
 * Sends an API request.
 * @param {string} url - The endpoint URL.
 * @param {object} options - Fetch options.
 * @param {string} [options.method='GET'] - HTTP method.
 * @param {object|null} [options.body=null] - Request body (will be JSON stringified).
 * @param {object} [options.headers={}] - Additional headers.
 * @returns {Promise<object>} - The JSON response data.
 * @throws {Error} - Throws an error with status and data on failure.
 */
export async function sendApiRequest(url, options = {}) {
    const {method = 'GET', body = null, headers = {}} = options;

    try {
        const response = await fetch(url, {
            method,
            body: body ? JSON.stringify(body) : null,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            credentials: 'include',
        });

        // Try to parse JSON body even for errors, as it might contain details
        const responseData = await response.json();
        console.log("responseData", responseData);

        if (!response.ok) {
            // Create a custom error object including status and response data
            const error = new Error(responseData.message || `Request failed with status ${response.status}`);
            error.status = response.status;
            error.data = responseData; // Attach the parsed error response body
            throw error;
        }

        // Return the parsed data on success
        return {
            status: response.status,
            ...responseData
        }

    } catch (err) {
        console.error(`API Request Error to ${url}:`, err);
        // Ensure the error has a status if possible, default to 500
        if (!err.status) {
            err.status = 500;
        }
        // Re-throw the error so the calling function (e.g., router action) can handle it
        throw err;
    }
}