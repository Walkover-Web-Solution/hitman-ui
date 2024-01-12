import http from './httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getCollectionsAndPages(orgId) {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData`)
}

export default {
  getCollectionsAndPages
}
