import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiUrl = process.env.REACT_APP_API_URL

export function deleteMappedUrl(id) {
  const orgId = getOrgId()
  return http.delete(apiUrl + `/orgs/${orgId}/urlMappings/${id}`)
}

export function addUrlWithAdditionalPath(pageId, collectionId, oldUrl) {
  const orgId = getOrgId()
  const body = { pageId, collectionId, oldUrl };
  return http.post(apiUrl + `/orgs/${orgId}/urlMappings`, body)
}