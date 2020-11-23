import http from '../../services/httpService'
const apiUrl = process.env.REACT_APP_API_URL

function collectionVersionsUrl (collectionId) {
  return `${apiUrl}/collections/${collectionId}/versions`
}

export function getCollectionVersions (collectionId) {
  return http.get(collectionVersionsUrl(collectionId))
}

export function getAllCollectionVersions () {
  return http.get(`${apiUrl}/versions`)
}

export function getCollectionVersion (versionId) {
  return http.get(`${apiUrl}/versions/${versionId}`)
}

export function saveCollectionVersion (collectionId, collectionVersion) {
  return http.post(collectionVersionsUrl(collectionId), collectionVersion)
}

export function updateCollectionVersion (versionId, collectionVersion) {
  return http.put(`${apiUrl}/versions/${versionId}`, collectionVersion)
}

export function deleteCollectionVersion (versionId) {
  return http.delete(`${apiUrl}/versions/${versionId}`)
}

export function duplicateVersion (versionId) {
  return http.post(`${apiUrl}/duplicateVersions/${versionId}`)
}
export function exportCollectionVersion (importLink, shareIdentifier) {
  return http.get(`${importLink}`)
}

export function importCollectionVersion (importLink, shareIdentifier, data) {
  return http.post(`${apiUrl}/share/${shareIdentifier}/import`, data)
}

export function setAuthorizationData (versionId, data) {
  return http.patch(`${apiUrl}/versions/${versionId}/authorizationData`, data)
}

export function setAuthorizationResponse (versionId, authorizationResponse) {
  return http.patch(
    `${apiUrl}/versions/${versionId}/authorizationResponse`,
    authorizationResponse
  )
}

export default {
  getCollectionVersions,
  getCollectionVersion,
  saveCollectionVersion,
  updateCollectionVersion,
  deleteCollectionVersion,
  duplicateVersion,
  importCollectionVersion,
  exportCollectionVersion,
  getAllCollectionVersions,
  setAuthorizationResponse,
  setAuthorizationData
}
