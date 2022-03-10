import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getFeedbacks (collectionId) {
  return http.get(apiUrl + `/collections/${collectionId}/feedbacks`)
}

export default { getFeedbacks }
