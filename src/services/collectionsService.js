import http from './httpService';
import { apiUrl } from '../config.json';

const apiEndpoint = apiUrl + '/collections';

function collectionUrl(id) {
	return `${apiEndpoint}/${id}`;
}

export function getcollections() {
	return http.get(apiEndpoint);
}

export function getcollection(collectionId) {
	return http.get(collectionUrl(collectionId));
}

export function savecollection(collection) {
	if (collection._id) {
		const body = { ...collection };
		delete body._id;
		return http.put(collectionUrl(collection._id), body);
	}

	return http.post(apiEndpoint, collection);
}

export function deletecollection(collectionId) {
	return http.delete(collectionUrl(collectionId));
}
