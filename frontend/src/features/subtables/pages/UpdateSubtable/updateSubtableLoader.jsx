

import subtableService from "#services/subtableService.jsx";

export default async function subtableViewLoader({ params }) {
    const { subtableName } = params;
    try {
        const detailsResponse = await subtableService.getSubtableDetails(subtableName);
        const iconResponse = await subtableService.getSubtableMedia(detailsResponse.data.icon, subtableName); // Use the correct function
        const bannerResponse = await subtableService.getSubtableMedia(detailsResponse.data.banner, subtableName); // Use the correct function
        let detailsData = null;
        let iconData = null;
        let bannerData = null;
        // Process details response
        if (detailsResponse.success && detailsResponse.data) {
            // Assuming details are nested like this based on previous component structure
            detailsData = detailsResponse.data;
            console.log("Details Data:", detailsData);
        } else {
            console.warn(`Loader Warning: Could not fetch valid details for subtable "${subtableName}".`, detailsResponse);
            loaderError = (loaderError ? loaderError + '\n' : '') + (detailsResponse.message || `Failed to load details for ${subtableName}.`);
        }
        // Process icon and banner responses
        if (iconResponse.success && iconResponse.data) {
            iconData = iconResponse.data.url;
        } else {
            console.warn(`Loader Warning: Could not fetch valid icon for subtable "${subtableName}".`, iconResponse);
            loaderError = (loaderError ? loaderError + '\n' : '') + (iconResponse.message || `Failed to load icon for ${subtableName}.`);
        }
        if (bannerResponse.success && bannerResponse.data) {
            bannerData = bannerResponse.data.url;
        } else {
            console.warn(`Loader Warning: Could not fetch valid banner for subtable "${subtableName}".`, bannerResponse);
            loaderError = (loaderError ? loaderError + '\n' : '') + (bannerResponse.message || `Failed to load banner for ${subtableName}.`);
        }
        // console.log("detailsDatakkkk:", detailsData);
        // console.log("iconDatakkk:", iconData);
        // console.log("bannerDatakkk:", bannerData);
        return {
            detailsData, // Should contain { name, icon, banner, ... }
            iconData,    // URL or data for the icon
            bannerData,  // URL or data for the banner
        };
    }
    catch (error) {
        console.error("Error fetching subtable details:", error);
        throw new Response(JSON.stringify({ message: "Failed to load subtable details" }), {
            status: 500,
            statusText: "Internal Server Error"
        });
    }
}
