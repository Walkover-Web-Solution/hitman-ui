import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.NEXT_PUBLIC_API_URL + `/orgs/${orgId}`
}

export function approvePage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/approved`)
}

export function pendingPage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/pending`)
}

export function draftPage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/draft`)
}

export function rejectPage(page) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/pages/${page.id}/reject`)
}

export default {
  approvePage,
  pendingPage,
  draftPage,
  rejectPage
}
