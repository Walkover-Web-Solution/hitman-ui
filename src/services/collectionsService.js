import http from './httpService';
import { apiUrl } from '../config.json';
import { getcollections, saveCollection } from './collectionsService';

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
	if (collection._id) {
		const body = { ...collection };
		delete body._id;
		return http.put(collectionUrl(collection._id), body);
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
