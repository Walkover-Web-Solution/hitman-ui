import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiUrlPublic = process.env.NEXT_PUBLIC_API_URL
// 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
function getApiUrl() {
  const orgId = getOrgId()
  return process.env.NEXT_PUBLIC_API_URL + `/orgs/${orgId}`
}
export function fetchAll(collectionIdentifier, domain) {
  return http.get(`${apiUrlPublic}/public/${collectionIdentifier}?domain=${domain}`)
}

export function approveEndpoint(endpointId) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpointId}/approved`)
}

export function pendingEndpoint(endpoint) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/pending`)
}

export function draftEndpoint(endpoint) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/draft`)
}

export function rejectEndpoint(endpoint) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/reject`)
}

export default {
  fetchAll,
  approveEndpoint,
  pendingEndpoint,
  draftEndpoint,
  rejectEndpoint
}
