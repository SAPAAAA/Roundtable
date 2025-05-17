// src/features/subtables/pages/SubtableView/subtableViewLoader.jsx
import subtableService from "#services/subtableService.jsx";

export default async function subtableViewLoader({params}) {
    const {subtableName} = params;
    let loaderError = null;

    if (!subtableName) {
        loaderError = "Subtable name is missing.";
        throw new Response(JSON.stringify({message: loaderError}), {
            status: 400,
            statusText: "Bad Request"
        });
    }

    try {
        // Fetch details and posts concurrently
        console.log("Fetching details and posts for subtable:", subtableName);
        const subtableDetailsResponse = await subtableService.getSubtableDetailsByName(subtableName);
        const subtablePostsResponse = await subtableService.getSubtablePosts(subtableName); // Use the correct function

        let subtableDetailsData = null;
        let subtablePostsData = [];

        // Process details response
        if (subtableDetailsResponse.success && subtableDetailsResponse.data) {
            // Assuming details are nested like this based on previous component structure
            subtableDetailsData = subtableDetailsResponse.data;
        } else {
            console.warn(`Loader Warning: Could not fetch valid details for subtable "${subtableName}".`, subtableDetailsResponse);
            loaderError = (loaderError ? loaderError + '\n' : '') + (subtableDetailsResponse.message || `Failed to load details for ${subtableName}.`);
        }

        // Process posts response
        if (subtablePostsResponse.success && Array.isArray(subtablePostsResponse.data)) {
            subtablePostsData = subtablePostsResponse.data;
        } else {
            console.warn(`Loader Warning: Could not fetch valid posts for subtable "${subtableName}".`, subtablePostsResponse);
            loaderError = (loaderError ? loaderError + '\n' : '') + (subtablePostsResponse.message || `Failed to load posts for ${subtableName}.`);
        }

        // Return fetched data and any accumulated errors
        return {
            subtableDetailsData, // Should contain { name, icon, banner, ... }
            subtablePostsData,   // Should be an array like [{ post: {...}, author: {...} }, ...] or similar
            loaderError
        };

    } catch (error) {
        console.error("Loader Error fetching subtable data:", error);
        // Throwing a Response is often better for errorElement handling
        throw new Response(JSON.stringify({message: error.message || "Failed to fetch subtable data."}), {
            status: 500,
            statusText: "Internal Server Error"
        });
    }
}