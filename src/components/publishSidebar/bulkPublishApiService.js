import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

function getApiUrl () {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}

export function bulkPublish (collectionId, requestData) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/collection/${collectionId}/bulkPendingRequest`, requestData)
}

export default {
  bulkPublish
}
