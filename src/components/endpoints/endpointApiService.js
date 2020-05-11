import http from "../../services/httpService";
import httpService from "../../services/endpointHttpService";

import { apiUrl } from "../../config.json";
import qs from "qs";

function endpointUrl(groupId) {
  return `${apiUrl}/groups/${groupId}/endpoints`;
}

export function apiTest(api, method, body, headers, bodyType) {
  return httpService.request({
    url: api,
    method: method,
    data: bodyType === "urlEncoded" ? qs.stringify({ body }) : body,
    headers: headers,
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

export function moveEndpoint(endpointId, body) {
  console.log("body", body);
  return http.patch(`${apiUrl}/endpoints/${endpointId}/move`, body);
}

export function authorize(requestApi) {
  console.log("requestApi", requestApi);
  window.open(requestApi, "_top");
}

export function setAuthorizationData(versionId, data) {
  return http.patch(`${apiUrl}/versions/${versionId}/authorizationData`, data);
}

export function setAuthorizationResponse(versionId, data) {
  return http.patch(
    `${apiUrl}/versions/${versionId}/authorizationResponse`,
    data
  );
}

export function setAuthorizationType(endpointId, data) {
  return http.patch(
    `${apiUrl}/endpoints/${endpointId}/authorizationType`,
    data
  );
}

export default {
  saveEndpoint,
  getEndpoints,
  deleteEndpoint,
  apiTest,
  updateEndpoint,
  getEndpoint,
  getAllEndpoints,
  duplicateEndpoint,
  moveEndpoint,
  authorize,
  setAuthorizationData,
  setAuthorizationResponse,
  setAuthorizationType,
};
