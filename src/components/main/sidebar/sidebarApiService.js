import http from "../../../services/httpService"

const apiUrl = process.env.REACT_APP_API_URL

export function getCollectionsAndPagesForSidebar (orgId) {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData`)
}

export default {
  getCollectionsAndPagesForSidebar,
}
