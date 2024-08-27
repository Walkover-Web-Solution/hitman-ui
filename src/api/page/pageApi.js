import apiRequest from "../main";


const ENTITY_STATUS = {
    PENDING: 0,
    DRAFT: 1,
    APPROVED: 2,
    REJECT: 3
};

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

export function approvePage(page) {
    return apiRequest.patch(`/pages/${page.id}/state`, { state: ENTITY_STATUS.APPROVED })
}

export function pendingPage(page) {
    return apiRequest.patch(`/pages/${page.id}/state`, { state: ENTITY_STATUS.PENDING })
}

export function draftPage(page) {
    return apiRequest.patch(`/pages/${page.id}/state`, { state: ENTITY_STATUS.DRAFT })
}

export function rejectPage(page) {
    return apiRequest.patch(`/pages/${page.id}/state`, { state: ENTITY_STATUS.REJECT })
}

export const getPageContent = async (pageId) => {
    const data = await apiRequest.get(`/pages/${pageId}/content`)
    return data?.data?.contents || ''
}

export default {
    updatePage,
    deletePage,
    getAllPages,
    saveCollectionPage,
    dragAndDropApi,
    getPublishedContentByIdAndType,
    approvePage,
    pendingPage,
    draftPage,
    rejectPage
};
