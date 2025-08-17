import subtableService from "#services/subtableService.jsx";

export default async function updateSubtableAction({request,params})
{
    const formData = await request.formData();
    const subtableName = params.subtableName;
    const name = formData.get('name');
    const description = formData.get('description');
    const icon = formData.get('iconFile');
    const banner = formData.get('bannerFile');
    const iconId = formData.get('iconId');
    const bannerId = formData.get('bannerId');
    // console.log("name update:", name);
    // console.log("description update:", description);  
    // console.log("icon update:", icon);
    // console.log("banner update:", banner);
    // console.log("iconId update:", iconId);
    // console.log("bannerId update:", bannerId);

    try {
        const response = await subtableService.updateSubtable(subtableName, formData);
        if (response.success) {
            return {
                status: 'success',
                redirect: `/s/${name}`,
                message: 'Cập nhật cộng đồng thành công!'
            };
        }
        return {
            status: 'error',
            message: response.message || 'Cập nhật thất bại, vui lòng thử lại.'
        };
        //return response;
    } catch (error) {
        console.error("Error updating subtable:", error);
        throw new Error("Failed to update subtable");
    }
}