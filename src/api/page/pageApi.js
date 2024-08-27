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

export default {
    updatePage,
    deletePage,
    getAllPages,
    saveCollectionPage,
    dragAndDropApi,
};
