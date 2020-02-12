import http from "./httpService";
import { apiUrl } from "../config.json";

function endpointUrl(groupId) {
    return `${apiUrl}/groups/${groupId}/endpoints`;
}

export function apiTest(api, method, body) {
    return http.request({
        url: api,
        method: method,
        data: body
    });
}

export function getEndpoints(groupId) {
    return http.get(endpointUrl(groupId));
}

export function getEndpoint(endpointId) {
    return http.get(`${apiUrl}/endpoints/${endpointId}`);
}


export function saveEndpoint(groupId, endpoint) {
    return http.post(endpointUrl(groupId), endpoint);
}
// export function updateEndpointName(groupId, editedEndpoint) {
//     return http.put(`${apiUrl}/endpoints/${endpointId}`, editedEndpoint);
// }
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
    updateEndpoint,
    getEndpoint
    // updateEndpointName
};