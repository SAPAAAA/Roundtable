import {sendApiRequest} from "#utils/apiClient";
class SubtableService {
    async getSubtableDetails(subtableName) {
        const baseUrl = `/api/s/${subtableName}`;
        //console.log(baseUrl+"Dmmmm thuận")
       
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        //console.log("xin chao", response)
        if (!response.success) throw new Error(`Failed to fetch subtable details for ${subtableName}: ${response.status} ${response.statusText}`);
        return response.data;
    }
    async getSubtables(subtableName){
        console.log("subtableName", subtableName)
        const baseUrl = `/api/s/${subtableName}/submit`;
        const response = await sendApiRequest(baseUrl, {method: 'GET'});
        if (!response.success) throw new Error(`Failed to fetch subtable details for ${subtableName}: ${response.status} ${response.statusText}`);
        return response.data;
    }
    
}
export default new SubtableService();