import http from './httpService';
import { apiUrl } from '../config.json';

function collectionVersionsUrl(collectionId) {
	return `${apiUrl}/collections/${collectionId}/versions`;
}

function collectionVersionUrl(collectionId, collectionVersionNumber) {
	return `${collectionVersionsUrl(collectionId)}/${collectionVersionNumber}`;
}

export function getCollectionVersions(collectionId) {
	return http.get(collectionVersionsUrl(collectionId));
}

export function getCollectionVersion(collectionId, collectionVersionNumber) {
	return http.get(collectionVersionUrl(collectionId, collectionVersionNumber));
}

export function saveCollectionVersion(collectionId, collectionVersion) {
	return http.post(collectionVersionsUrl(collectionId), collectionVersion);
}

export function updateCollectionVersion(collectionVersionNumber, collectionVersion) {
	return http.put(`${apiUrl}/versions/${collectionVersionNumber}`, collectionVersion);
}

export function deleteCollectionVersion(collectionVersionNumber) {
	return http.delete(`${apiUrl}/versions/${collectionVersionNumber}`);
}

export default {
	getCollectionVersions,
	getCollectionVersion,
	saveCollectionVersion,
	updateCollectionVersion,
	deleteCollectionVersion
};
