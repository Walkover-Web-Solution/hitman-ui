import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

function getApiUrl () {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}

export function importApi (openApiObject) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/import/openApi`, openApiObject)
}

export function importPostmanCollection (collection, website) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/import/postman?website=${website}`, collection)
}

export default {
  importApi,
  importPostmanCollection
}
