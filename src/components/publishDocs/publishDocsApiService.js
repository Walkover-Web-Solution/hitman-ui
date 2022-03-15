import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getFeedbacks (collectionId) {
  return http.get(apiUrl + `/collections/${collectionId}/feedbacks`)
}

export function postFeedback (collectionId, review) {
  return http.post(apiUrl + `collections/${collectionId}/feedbacks`, review)
}

export default { getFeedbacks, postFeedback }
