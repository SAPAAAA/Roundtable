import {sendApiRequest} from "#utils/apiClient";

class UserService {
    async getUserProfileByUsername(username) {
        const baseUrl = `/api/users/${username}`;

        const response = await sendApiRequest(baseUrl, {
            method: 'GET'
        });

        if (!response.success) {
            throw new Error(`Failed to fetch user profile: ${response.message}`);
        }

        return response;
    }
}

export default new UserService();