import http from './httpService';
import { apiUrl } from '../config.json';

const apiEndpoint = apiUrl + '/collections';

function collectionUrl(id) {
	return `${apiEndpoint}/${id}`;
}

export function getCollections() {
	return http.get(apiEndpoint);
}

export function getCollection(collectionId) {
	return http.get(collectionUrl(collectionId));
}

export function saveCollection(collection) {
	if (collection.identifier) {
		const body = { ...collection };
		delete body.identifier;
		return http.put(collectionUrl(collection.identifier), body);
	}

	return http.post(apiEndpoint, collection);
}

export function deleteCollection(collectionId) {
	return http.delete(collectionUrl(collectionId));
}

export default {
	getCollections,
	getCollection,
	saveCollection,
	deleteCollection
};
