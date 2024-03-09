import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return apiBaseUrl + `/orgs/${orgId}`
}

function collectionParentPagesUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}/versions`
}

export function saveParentPageVersion(pageId, collectionParentPage) {
  return http.post(collectionParentPagesUrl(pageId), collectionParentPage)
}

export function updateCollectionVersion(versionId, collectionVersion) {
  const apiUrl = getApiUrl()
  return http.put(`${apiUrl}/versions/${versionId}`, collectionVersion)
}

export function duplicateVersion(versionId) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/duplicateVersions/${versionId}`)
}

export default {
  updateCollectionVersion,
  duplicateVersion,
  saveParentPageVersion
}
