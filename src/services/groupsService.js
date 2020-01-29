import http from './httpService';
import { apiUrl } from '../config.json';

function GroupsUrl(versionId) {
	return `${apiUrl}/versions/${versionId}/groups`;
}

function GroupUrl(versionId, GroupId) {
	// return `${GroupsUrl(versionId)}/${GroupId}`;
}

export function getGroups(versionId) {
	return http.get(GroupsUrl(versionId));
}

export function getGroup(versionId, GroupId) {
	// return http.get(GroupUrl(versionId, GroupId));
}

export function saveGroup(versionId, Group) {
	return http.post(GroupsUrl(versionId), Group);
}

export function updateGroup(GroupId, Group) {
	return http.put(`${apiUrl}/groups/${GroupId}`, Group);
}

export function deleteGroup(GroupId) {
	return http.delete(`${apiUrl}/groups/${GroupId}`);
}

export default {
	getGroups,
	getGroup,
	saveGroup,
	updateGroup,
	deleteGroup
};
