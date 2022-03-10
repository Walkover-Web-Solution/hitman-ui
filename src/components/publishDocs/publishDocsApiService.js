import http from '../../services/httpService'
// import httpService from '../../services/httpService'
// import { getOrgId } from '../common/utility'

const apiUrl = process.env.REACT_APP_API_URL

export function getFeedbacks (orgId, collectionId) {
  return http.get(apiUrl + `/orgs/${orgId}/collections/${collectionId}/feedbacks`)
}

export default { getFeedbacks }
