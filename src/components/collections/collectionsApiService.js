import http from "../../services/httpService";
import httpService from "../../services/endpointHttpService";

import { apiUrl } from "../../config.json";

const apiEndpoint = apiUrl + "/collections";

function collectionUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getCollections() {
  return http.get(apiEndpoint);
}

export function getAllPublicCollections() {
  return httpService.get(apiEndpoint, { params: { public: "true" } });
}

export function getCollection(collectionId) {
  return http.get(collectionUrl(collectionId));
}

export function saveCollection(collection) {
  return http.post(apiEndpoint, collection);
}

export function updateCollection(collectionId, collection) {
  return http.put(collectionUrl(collectionId), collection);
}

export function deleteCollection(collectionId) {
  return http.delete(collectionUrl(collectionId));
}

export function duplicateCollection(collectionId) {
  return http.post(`${apiUrl}/duplicateCollections/${collectionId}`);
}
export function fetchAllUsersOfTeam(teamIdentifier) {
  return http.get(`${apiUrl}/teams/${teamIdentifier}/teamUsers`);
}

export function shareCollection(teamMemberData) {
  return http.patch(apiUrl + "/teamUsers", teamMemberData);
}

export function fetchAllTeamsOfUser() {
  return http.get(apiUrl + "/teams");
}

export default {
  getCollections,
  getCollection,
  saveCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  fetchAllUsersOfTeam,
  shareCollection,
  fetchAllTeamsOfUser,
  getAllPublicCollections,
};
