import http from './httpService'

const apiUrl = process.env.REACT_APP_API_URL

export function getCollectionsAndPages(orgId, queryParamsString = '') {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData${queryParamsString}`)
}

export function getPublishedContent(queryParamsString = ''){
  return http.get(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
}

export async function getPublishedContentByIdAndType(id, type){
  const data = await  http.get(apiUrl + `/pages/${id}/getPublishedData?type=${type}`)
  return (type == 4) ? (data?.data?.publishedContent || {} ) :  (data?.data?.publishedContent?.contents || {})
}

export default {
  getCollectionsAndPages,
  getPublishedContent,
  getPublishedContentByIdAndType
}
