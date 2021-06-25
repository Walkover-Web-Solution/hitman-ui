import http from '../../services/httpService'
import { getOrgId } from '../common/utility'
const orgId = getOrgId()

const apiUrl = process.env.REACT_APP_API_URL + `/orgs/${orgId}`

export function bulkPublish (collectionId, requestData) {
  return http.patch(`${apiUrl}/collection/${collectionId}/bulkPendingRequest`, requestData)
}

export default {
  bulkPublish
}
