import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}

export function importApi(openApiObject, defaultView) {
  const apiUrl = getApiUrl();
  return http.post(`${apiUrl}/importCollection?defaultView=${defaultView}`, openApiObject);
}

export default {
  importApi
}
