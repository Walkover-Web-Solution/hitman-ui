import http from '../../services/httpService'
import { getOrgId } from '../common/utility'
const orgId = getOrgId()

const apiUrl = process.env.REACT_APP_API_URL + `/orgs/${orgId}`
const apiBaseUrl = process.env.REACT_APP_API_URL

function GroupsUrl (versionId) {
  return `${apiUrl}/versions/${versionId}/groups`
}

function GroupUrl (GroupId) {
  return `${apiUrl}/groups/${GroupId}`
}

export function getGroups (versionId) {
  return http.get(GroupsUrl(versionId))
}

export function getGroup (versionId, GroupId) {
  return http.get(GroupUrl(versionId, GroupId))
}

export function saveGroup (versionId, Group) {
  return http.post(GroupsUrl(versionId), Group)
}

export function updateGroup (GroupId, Group) {
  return http.put(`${GroupUrl(GroupId)}`, Group)
}

export function deleteGroup (GroupId) {
  return http.delete(`${GroupUrl(GroupId)}`)
}

export function getAllGroups (id) {
  return http.get(`${apiBaseUrl}/orgs/${id}/groups`)
}

export function duplicateGroup (groupId) {
  return http.post(`${apiUrl}/duplicateGroups/${groupId}`)
}

export function updateGroupOrder (groupsOrder) {
  return http.patch(`${apiUrl}/updateGroupsOrder`, {
    groupsOrder: groupsOrder
  })
}

export default {
  getGroups,
  getGroup,
  saveGroup,
  updateGroup,
  deleteGroup,
  duplicateGroup,
  getAllGroups,
  updateGroupOrder
}
