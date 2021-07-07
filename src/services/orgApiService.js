import http from './httpService'
const apiBaseUrl = process.env.REACT_APP_API_URL

export function getOrgUpdatedAt (orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
}

export default {
  getOrgUpdatedAt
}
