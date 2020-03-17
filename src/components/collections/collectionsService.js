import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

const apiEndpoint = apiUrl + "/collections";

function collectionUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getCollections() {
  return http.get(apiEndpoint);
}

export function getCollection(collectionId) {
  return http.get(collectionUrl(collectionId));
}

export function shareCollection(sharedCollection) {
  return http.post(apiUrl + "/teams", sharedCollection);
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

export default {
  getCollections,
  getCollection,
  saveCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  shareCollection
};
