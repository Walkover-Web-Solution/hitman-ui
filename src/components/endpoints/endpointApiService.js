import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

function endpointUrl(groupId) {
  return `${apiUrl}/groups/${groupId}/endpoints`;
}

export function apiTest(api, method, body, headers) {
  let formData = new FormData();
  formData.set("customFile", " this.state.image_file");
  headers = {
    ...headers,
    "Content-Type": "multipart/form-data",
    "Content-Length": "269",
    Authorization: "eyJh",
  };
  body =
    '------WebKitFormBoundary1yLsrvN0HArzpnJF\r\nContent-Disposition: form-data; name="customFile"\r\n\r\n this.state.image_file\r\n------WebKitFormBoundary1yLsrvN0HArzpnJF--\r\n';

  console.log(body);
  return http.request({
    url: api,
    method: method,
    data: formData,
    headers: {
      "Content-type": "multipart/form-data",
    },
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
  return http.patch(`${apiUrl}/endpoints/${endpointId}`, body);
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
};
