import http from './httpService';
import { apiUrl } from '../config.json';

const apiEndpoint = apiUrl + '/collections/:collectionId/collectionVersions';

function collectionVersionUrl(id) {
	return `${apiEndpoint}/${id}`;
}

export function getCollectionVersions() {
	return http.get(apiEndpoint);
}

export function getCollectionVersion(collectionVersionId) {
	return http.get(collectionUrl(collectionVersionId));
}

export function saveCollectionVersion(collectionVersion) {
	if (collectionVersion._id) {
		const body = { ...collectionVersion };
		delete body._id;
		return http.put(collectionVersionUrl(collectionVersion._id), body);
	}

	return http.post(apiEndpoint, collectionVersion);
}

export function deleteCollectionVersion(collectionVersionId) {
	return http.delete(collectionVersionUrl(collectionVersionId));
}

export default {
	getCollectionVersions,
	getCollectionVersion,
	saveCollectionVersion,
	deleteCollectionVersion
};
