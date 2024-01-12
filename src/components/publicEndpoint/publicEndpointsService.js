import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiUrlPublic = process.env.REACT_APP_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}
export function fetchAll(collectionIdentifier, domain) {
  return http.get(`${apiUrlPublic}/public/${collectionIdentifier}?domain=${domain}`)
}

export function approveEndpoint(endpoint) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/approved`)
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
