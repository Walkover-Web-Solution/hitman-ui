import http from './httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getCollectionsAndPages(orgId, queryParamsString = '') {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData${queryParamsString}`)
}

export function getPublishedContentByPath(queryParamsString = ''){
  return http.get(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
}

export async function getPublishedContentByIdAndType(id, type){
  return  await  http.get(apiUrl + `/pages/${id}/getPublishedData?type=${type}`)
}

export default {
  getCollectionsAndPages,
  getPublishedContentByPath,
  getPublishedContentByIdAndType
}
