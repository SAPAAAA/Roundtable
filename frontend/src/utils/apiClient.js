/**
 * Sends an API request.
 * @param {string} url - The endpoint URL.
 * @param {object} options - Fetch options.
 * @param {string} [options.method='GET'] - HTTP method.
 * @param {object|FormData|null} [options.body=null] - Request body. If FormData, Content-Type is omitted. Otherwise, JSON stringified.
 * @param {object} [options.headers={}] - Additional headers.
 * @returns {Promise<object>} - The JSON response data.
 * @throws {Error} - Throws an error with status and data on failure.
 */
export async function sendApiRequest(url, options = {}) {
    const {method = 'GET', body = null, headers: customHeaders = {}} = options;

    let requestBody = body;
    // Start with custom headers provided, or an empty object if none.
    let effectiveHeaders = {...customHeaders};

    if (body) {
        if (body instanceof FormData) {
            // If body is FormData, browser sets Content-Type automatically with boundary.
            // So, remove any Content-Type header that might have been manually set.
            delete effectiveHeaders['Content-Type'];
        } else {
            // For non-FormData bodies, assume JSON unless Content-Type is set otherwise.
            // Stringify the body.
            requestBody = JSON.stringify(body);
            // Set Content-Type to application/json if not already set to something else.
            if (!effectiveHeaders['Content-Type']) {
                effectiveHeaders['Content-Type'] = 'application/json';
            }
        }
    }

    try {
        const response = await fetch(url, {
            method,
            body: requestBody,
            headers: effectiveHeaders,
            credentials: 'include',
        });

        let responseJson;
        const responseContentType = response.headers.get('content-type');

        if (responseContentType && responseContentType.includes('application/json')) {
            responseJson = await response.json();
        } else {
            // Handle non-JSON responses (e.g., text, or empty for 204)
            // For empty responses (like 204 No Content), .text() is fine and returns empty string.
            const textData = await response.text();
            responseJson = textData ? {message: textData, success: response.ok} : {success: response.ok};
            if (response.status === 204 && !textData) { // Specifically handle 204 if you expect it
                responseJson = {success: true, status: 204, message: "Operation successful (No Content)"};
            }
        }
        console.log("responseData from apiClient:", responseJson);


        if (!response.ok) {
            const error = new Error(responseJson.message || `Request failed with status ${response.status}`);
            error.status = response.status;
            error.data = responseJson || null;
            throw error;
        }

        return {
            status: response.status, // Add original status to success response
            ...responseJson
        };

    } catch (err) {
        console.error(`API Request Error to ${url}:`, err.message, err.data || err);
        // Ensure the error has a status if possible, default to 500 if not an HTTP error from fetch
        if (!err.status) {
            err.status = 500;
        }
        throw err; // Re-throw the error
    }
}