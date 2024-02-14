import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiBaseUrl = process.env.REACT_APP_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}

function collectionParentPagesUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}/versions`
}

export function getAllCollectionVersions(id) {
  return http.get(`${apiBaseUrl}/orgs/${id}/versions`)
}

export function getCollectionVersion(versionId) {
  const apiUrl = getApiUrl()
  return http.get(`${apiUrl}/versions/${versionId}`)
}

export function saveParentPageVersion(pageId, collectionParentPage) {
  return http.post(collectionParentPagesUrl(pageId), collectionParentPage)
}

export function updateCollectionVersion(versionId, collectionVersion) {
  const apiUrl = getApiUrl()
  return http.put(`${apiUrl}/versions/${versionId}`, collectionVersion)
}

export function deleteCollectionVersion(versionId) {
  const apiUrl = getApiUrl()
  return http.delete(`${apiUrl}/versions/${versionId}`)
}

export function duplicateVersion(versionId) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/duplicateVersions/${versionId}`)
}
export function exportCollectionVersion(importLink, shareIdentifier) {
  return http.get(`${importLink}`)
}

export function importCollectionVersion(importLink, shareIdentifier, data) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/share/${shareIdentifier}/import`, data)
}

export default {
  getCollectionVersion,
  updateCollectionVersion,
  deleteCollectionVersion,
  duplicateVersion,
  importCollectionVersion,
  exportCollectionVersion,
  getAllCollectionVersions,
  saveParentPageVersion
}
