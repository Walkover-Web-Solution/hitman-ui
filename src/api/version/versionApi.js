import apiRequest from "../main";

export function saveParentPageVersion(pageId, collectionParentPage) {
    return apiRequest.post(`/pages/${pageId}/versions`, collectionParentPage)
}

export function setDefaultVersion(versionData) {
    return apiRequest.put(`/defaultVersion`, versionData)
}