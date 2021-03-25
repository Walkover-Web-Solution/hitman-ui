import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function bulkPublish (collectionId, requestData) {
  return http.patch(`${apiUrl}/collection/${collectionId}/bulkPendingRequest`, requestData)
}

export default {
  bulkPublish
}
