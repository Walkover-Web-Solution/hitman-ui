import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

function GroupsUrl(versionId) {
  return `${apiUrl}/versions/${versionId}/groups`;
}

function GroupUrl(GroupId) {
  return `${apiUrl}/groups/${GroupId}`;
}

export function getGroups(versionId) {
  return http.get(GroupsUrl(versionId));
}

export function getGroup(versionId, GroupId) {
  return http.get(GroupUrl(versionId, GroupId));
}

export function saveGroup(versionId, Group) {
  return http.post(GroupsUrl(versionId), Group);
}

export function updateGroup(GroupId, Group) {
  return http.put(`${GroupUrl(GroupId)}`, Group);
}

export function deleteGroup(GroupId) {
  return http.delete(`${GroupUrl(GroupId)}`);
}

export function getAllGroups() {
  return http.get(`${apiUrl}/groups`);
}

export function duplicateGroup(groupId) {
  return http.post(`${apiUrl}/duplicateGroups/${groupId}`);
}

export default {
  getGroups,
  getGroup,
  saveGroup,
  updateGroup,
  deleteGroup,
  duplicateGroup,
  getAllGroups
};
