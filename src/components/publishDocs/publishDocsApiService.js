import http from '../../services/httpService'
// import httpService from '../../services/httpService'
// import { getOrgId } from '../common/utility'

// const apiUrl = process.env.REACT_APP_API_URL

export function getFeedbacks (orgId) {
  // return http.get(apiUrl + `/orgs/${orgId}/feedbacks/`).
  return http.get('https://jsonplaceholder.typicode.com/todos/1')
}

export default { getFeedbacks }
