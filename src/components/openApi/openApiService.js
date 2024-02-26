import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}

export function importApi(openApiObject, defaultView) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/import/openApi?view=${defaultView}`, openApiObject)
}

export function importPostmanCollection(collection, website, defaultView, uniqueTabId) {
  const apiUrl = getApiUrl();
  return http.post(`${apiUrl}/import/postman?website=${website}&view=${defaultView}&uniqueTabId=${uniqueTabId} `, collection);
}

export default {
  importApi,
  importPostmanCollection
}
