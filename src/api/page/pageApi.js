import apiRequest from "../main";


export function getAllPages(id) {
    return apiRequest.get(`/${id}/page`);
}

export function saveCollectionPage(rootParentId, page) {
    return apiRequest.post(`/pages/${rootParentId}`, page);
}

export function updatePage(pageId, page) {
    return apiRequest.put(`/pages/${pageId}`, page);
}

export function deletePage(pageId, page) {
    return apiRequest.delete(`/pages/${pageId}`, { data: page });
}

export function dragAndDropApi(body) {
    return apiRequest.post(`/dragAndDrop`, body);
}

export function getPublishedContentByPath(queryParamsString = '') {
    return apiRequest.get(`/getPublishedDataByPath${queryParamsString}`,)
}

export async function getPublishedContentByIdAndType(id, type) {
    const data = await apiRequest.get(`/pages/${id}/getPublishedData?type=${type}`)
    return type == 4 ? data?.data?.publishedContent || '' : data?.data?.publishedContent?.contents || ''
}

export default {
    updatePage,
    deletePage,
    getAllPages,
    saveCollectionPage,
    dragAndDropApi,
    getPublishedContentByIdAndType
};
