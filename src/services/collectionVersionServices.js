import http from "./httpService";
import axios from "axios";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/versions";

function collectionVersionUrl(collectionVersionId) {
    return `${apiEndpoint}/${collectionVersionId}`;
}

export function setcollectionId(collectionId) {
    axios.defaults.headers.common["collectionId"] = collectionId;
}

export function getCollectionVersions() {
    return http.get(apiEndpoint);
}

export function getCollectionVersion(collectionVersionId) {
    return http.get(collectionVersionUrl(collectionVersionId));
}

export function saveCollectionVersion(collectionVersion) {
    console.log(apiEndpoint, collectionVersion);
    return http.post(apiEndpoint, collectionVersion);
}

export function updateCollectionVersion(
    collectionVersionId,
    collectionVersion
) {
    console.log(collectionVersionUrl(collectionVersionId));
    return http.put(collectionVersionUrl(collectionVersionId), collectionVersion);
}

export function deleteCollectionVersion(collectionVersionId) {
    return http.delete(collectionVersionUrl(collectionVersionId));
}

export default {
    getCollectionVersions,
    getCollectionVersion,
    saveCollectionVersion,
    updateCollectionVersion,
    deleteCollectionVersion,
    setcollectionId
};