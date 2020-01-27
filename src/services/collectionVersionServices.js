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

export function updateCollectionVersion(collectionId, collectionVersion) {
	return http.put(collectionVersionUrl(collectionId, collectionVersion.id), collectionVersion);
}

export function deleteCollectionVersion(collectionId, collectionVersionNumber) {
	return http.delete(collectionVersionUrl(collectionId, collectionVersionNumber));
}

export default {
	getCollectionVersions,
	getCollectionVersion,
	saveCollectionVersion,
	updateCollectionVersion,
	deleteCollectionVersion
};
