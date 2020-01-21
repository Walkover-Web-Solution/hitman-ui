import http from './httpService';
import { apiUrl } from '../config.json';

const apiEndpoint = apiUrl + '/collections/:collectionId/collectionVersions';

function collectionVersionsUrl(collectionId) {
	return `${apiUrl}/collections/${collectionId}/versions`;
}

function collectionVersionUrl(collectionId, collectionVersionNumber) {
	return `${collectionVersionsUrl(collectionId)}/v${collectionVersionNumber}`;
}

export function getCollectionVersions(collectionId) {
	return http.get(collectionVersionsUrl(collectionId));
}

export function getCollectionVersion(collectionId, collectionVersionNumber) {
	return http.get(collectionVersionUrl(collectionId, collectionVersionNumber));
}

export function saveCollectionVersion(collectionId, collectionVersion) {
	// if (collectionVersion._id) {
	// 	const body = { ...collectionVersion };
	// 	delete body._id;
	// 	return http.put(collectionVersionUrl(collectionVersion._id), body);
	// }
	return http.post(collectionVersionsUrl(collectionId), collectionVersion);
}

export function deleteCollectionVersion(collectionId, collectionVersionId) {
	return http.delete(collectionVersionUrl(collectionId, collectionVersionId));
}

export default {
	getCollectionVersions,
	getCollectionVersion,
	saveCollectionVersion,
	deleteCollectionVersion
};
