import http from "../../services/httpService";
import httpService from "../../services/endpointHttpService";

const apiEndpoint = process.env.REACT_APP_API_URL + "/collections";

const apiUrl = process.env.REACT_APP_API_URL;

function collectionUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getCollections() {
  return http.get(apiEndpoint);
}

export function getAllPublicCollections() {
  return httpService.get(apiEndpoint, { params: { public: "true" } });
}

export function getCollectionsByCustomDomain(domain) {
  return httpService.get(apiEndpoint, { params: { custom_domain: domain } });
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

export default {
  getCollections,
  getCollection,
  saveCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  getAllPublicCollections,
  getCollectionsByCustomDomain
};
