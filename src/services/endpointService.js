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