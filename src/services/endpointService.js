import http from "./httpService";
import { apiUrl } from "../config.json";

// function versionPagesUrl(versionId) {
//   return `${apiUrl}/versions/${versionId}/pages`;
// }

function endpointUrl(groupId) {
    return `${apiUrl}/groups/${groupId}/endpoints`;
}

export function apiTest(api, method, body) {
    console.log("oooo", api, method, body);
    return http.request({
        url: api,
        method: method,
        data: body
    });
}

// function pageUrl(pageId) {
//   return `${apiUrl}/pages/${pageId}`;
// }

export function getEndpoints(groupId) {
    return http.get(endpointUrl(groupId));
}

// export function getGroupPages(groupId) {
//   return http.get(groupPagesUrl(groupId));
// }

// export function getPage(pageId) {
//   return http.get(pageUrl(pageId));
// }

// export function saveVersionPage(versionId, page) {
//   return http.post(versionPagesUrl(versionId), page);
// }

export function saveEndpoint(groupId, endpoint) {
    return http.post(endpointUrl(groupId), endpoint);
}

export function updateEndpoint(endpointId, endpoint) {
    return http.put(`${apiUrl}/endpoints/${endpointId}`, endpoint);
}

export function deleteEndpoint(endpointId) {
    return http.delete(`${apiUrl}/endpoints/${endpointId}`);
}

export default {
    saveEndpoint,
    getEndpoints,
    deleteEndpoint,
    apiTest,
    updateEndpoint
};