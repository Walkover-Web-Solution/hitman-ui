import http from '../../services/httpService'
import { getOrgId } from '../common/utility'
const orgId = getOrgId()

const apiUrl = process.env.REACT_APP_API_URL + `/orgs/${orgId}`
const apiUrlPublic = process.env.REACT_APP_API_URL

export function fetchAll (collectionIdentifier, domain) {
  return http.get(`${apiUrlPublic}/public/${collectionIdentifier}?domain=${domain}`)
}

export function approveEndpoint (endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/approved`)
}

export function pendingEndpoint (endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/pending`)
}

export function draftEndpoint (endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/draft`)
}

export function rejectEndpoint (endpoint) {
  return http.patch(`${apiUrl}/endpoints/${endpoint.id}/reject`)
}

export default {
  fetchAll,
  approveEndpoint,
  pendingEndpoint,
  draftEndpoint,
  rejectEndpoint
}
