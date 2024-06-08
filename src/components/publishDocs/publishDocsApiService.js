import http from '../../services/httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getFeedbacks(collectionId) {
  return http.get(apiUrl + `/feedback/${collectionId}`)  
}

export function setDefaultVersion(orgId, versionData) {
  return http.put(apiUrl + `/orgs/${orgId}/defaultVersion`, versionData)
}

export default { getFeedbacks, setDefaultVersion }
