import http from './httpService';
import { apiUrl } from '../config.json';

function GroupsUrl(versionId) {
	return `${apiUrl}/versions/${versionId}/groups`;
}

function GroupUrl(versionId, GroupNumber) {
	// return `${GroupsUrl(versionId)}/${GroupNumber}`;
}

export function getGroups(versionId) {
	return http.get(GroupsUrl(versionId));
}

export function getGroup(versionId, GroupNumber) {
	// return http.get(GroupUrl(versionId, GroupNumber));
}

export function saveGroup(versionId, Group) {
	return http.post(GroupsUrl(versionId), Group);
}

export function updateGroup(GroupNumber, Group) {
	// return http.put(`${apiUrl}/versions/${GroupNumber}`, Group);
}

export function deleteGroup(GroupNumber) {
	// return http.delete(`${apiUrl}/versions/${GroupNumber}`);
}

export default {
	getGroups,
	getGroup,
	saveGroup,
	updateGroup,
	deleteGroup
};
