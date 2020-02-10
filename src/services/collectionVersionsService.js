import http from './httpService';
import { apiUrl } from '../config.json';

function collectionVersionsUrl(collectionId) {
	return `${apiUrl}/collections/${collectionId}/versions`;
}

function collectionVersionUrl(collectionId, versionId) {
	return `${collectionVersionsUrl(collectionId)}/${versionId}`;
}

export function getCollectionVersions(collectionId) {
	return http.get(collectionVersionsUrl(collectionId));
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

export default {
	getCollectionVersions,
	getCollectionVersion,
	saveCollectionVersion,
	updateCollectionVersion,
	deleteCollectionVersion
};
