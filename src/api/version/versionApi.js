import apiRequest from "../main";

export function saveParentPageVersion(pageId, collectionParentPage) {
    return apiRequest.post(`/pages/${pageId}/versions`, collectionParentPage)
}

export function setDefaultVersion(versionData) {
    const apiUrl = getApiUrl()
    return apiRequest.put(`/defaultVersion`, versionData)
}