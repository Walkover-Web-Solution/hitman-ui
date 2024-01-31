import http from './httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getCollectionsAndPages(orgId, queryParamsString = '') {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData${queryParamsString}`)
}

export function getPublishedContent(queryParamsString = ''){``
  return http.get(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
}

export default {
  getCollectionsAndPages,
  getPublishedContent
}
