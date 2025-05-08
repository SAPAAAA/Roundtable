import {sendApiRequest} from "#utils/apiClient";

class HomeService {
    async getHomeData() {
        // Sử dụng URL đầy đủ thay vì đường dẫn tương đối
        const baseUrl = "/api/home/posts";
        
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        
        if (!response.success) {
            throw new Error(`Không thể lấy dữ liệu trang chủ: ${response.status} ${response.statusText}`);
        }
        
        return response.data;
    }    
}

export default new HomeService();