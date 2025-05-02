import {sendApiRequest} from "#utils/apiClient";

class HomeService {
    async getHomeData(options = {}) {
        // Sử dụng URL đầy đủ thay vì đường dẫn tương đối
        const baseUrl = "/api/home/posts";
        
        //console.log("Gọi API home (service frontend):", baseUrl);
       
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        
        if (!response.success) {
            throw new Error(`Không thể lấy dữ liệu trang chủ: ${response.status} ${response.statusText}`);
        }
        
        //console.log("Dữ liệu trang chủ từ API:", response.data);
        return response.data;
    }    
}

export default new HomeService();