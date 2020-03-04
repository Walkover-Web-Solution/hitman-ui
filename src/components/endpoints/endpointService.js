import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

function endpointUrl(groupId) {
  return `${apiUrl}/groups/${groupId}/endpoints`;
}

export function apiTest(api, method, body, headers) {
  return http.request({
    url: api,
    method: method,
    data: body,
    headers: headers
  });
}

export function getAllEndpoints() {
  return http.get(`${apiUrl}/endpoints`);
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

export function updateEndpoint(endpointId, endpoint) {
  return http.put(`${apiUrl}/endpoints/${endpointId}`, endpoint);
}

export function deleteEndpoint(endpointId) {
  return http.delete(`${apiUrl}/endpoints/${endpointId}`);
}

export function duplicateEndpoint(endpointId) {
  return http.post(`${apiUrl}/duplicateEndpoints/${endpointId}`);
}

export default {
  saveEndpoint,
  getEndpoints,
  deleteEndpoint,
  apiTest,
  updateEndpoint,
  getEndpoint,
  getAllEndpoints,
  duplicateEndpoint
};
