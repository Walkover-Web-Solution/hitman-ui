import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const orgId = getOrgId()
const apiUrl = process.env.REACT_APP_API_URL + `/orgs/${orgId}`

export function approvePage (page) {
  return http.patch(`${apiUrl}/pages/${page.id}/approved`)
}

export function pendingPage (page) {
  return http.patch(`${apiUrl}/pages/${page.id}/pending`)
}

export function draftPage (page) {
  return http.patch(`${apiUrl}/pages/${page.id}/draft`)
}

export function rejectPage (page) {
  return http.patch(`${apiUrl}/pages/${page.id}/reject`)
}

export default {
  approvePage,
  pendingPage,
  draftPage,
  rejectPage
}
