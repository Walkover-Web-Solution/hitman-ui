import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

export function fetchAll(collectionIdentifier) {
  return http.get(`${apiUrl}/public/${collectionIdentifier}`);
}

export function approveEndpoint(endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/approved`);
}

export function pendingEndpoint(endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/pending`);
}

export function draftEndpoint(endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/draft`);
}

export function rejectEndpoint(endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/reject`);
}

export default {
  fetchAll,
  approveEndpoint,
  pendingEndpoint,
  draftEndpoint,
  rejectEndpoint,
};
