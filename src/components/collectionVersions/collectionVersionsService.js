import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

function collectionVersionsUrl(collectionId) {
    return `${apiUrl}/collections/${collectionId}/versions`;
}

function collectionVersionUrl(collectionId, versionId) {
    return `${collectionVersionsUrl(collectionId)}/${versionId}`;
}

export function getCollectionVersions(collectionId) {
    return http.get(collectionVersionsUrl(collectionId));
}

export function getAllCollectionVersions() {
    return http.get(`${apiUrl}/versions`);
}

export function getCollectionVersion(versionId) {
    return http.get(`${apiUrl}/versions/${versionId}`);
}

export function saveCollectionVersion(collectionId, collectionVersion) {
    return http.post(collectionVersionsUrl(collectionId), collectionVersion);
}

export function updateCollectionVersion(versionId, collectionVersion) {
    return http.put(`${apiUrl}/versions/${versionId}`, collectionVersion);
}

export function deleteCollectionVersion(versionId) {
    return http.delete(`${apiUrl}/versions/${versionId}`);
}

export function duplicateVersion(versionId) {
    return http.post(`${apiUrl}/duplicateVersions/${versionId}`);
}
export function exportCollectionVersion(importLink, shareIdentifier) {
    return http.get(`${importLink}`);
}
export function importCollectionVersion(importLink, shareIdentifier, data) {
    return http.post(`${apiUrl}/share/${shareIdentifier}/import`, data);
}

export default {
    getCollectionVersions,
    getCollectionVersion,
    saveCollectionVersion,
    updateCollectionVersion,
    deleteCollectionVersion,
    duplicateVersion,
    importCollectionVersion,
    exportCollectionVersion,
    getAllCollectionVersions
};