import apiRequest from "../main";

export function deleteMappedUrl(id) {
    try {
        return apiRequest.delete(`/urlMappings/${id}`);
    } catch (error) {
        throw error
    }
}

export function addUrlWithAdditionalPath(pageId, collectionId, oldUrl) {
    try {
        return apiRequest.delete(`/urlMappings`, { pageId, collectionId, oldUrl });
    } catch (error) {
        throw error
    }
}

