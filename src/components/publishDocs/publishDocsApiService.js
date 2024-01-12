import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getFeedbacks(collectionId, orgId) {
  return http.get(apiUrl + `/orgs/${orgId}/collections/${collectionId}/feedbacks`)
}

export default { getFeedbacks }
