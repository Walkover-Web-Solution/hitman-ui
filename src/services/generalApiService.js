import http from "./httpService"

const apiUrl = process.env.REACT_APP_API_URL

export function getCollectionsAndPages(orgId, queryParamsString = "") {
  return http.get(apiUrl + `/orgs/${orgId}/getSideBarData${queryParamsString}`)
}

export async function moveCollectionsAndPages(moveToOrgId, collection) {
  const { id, orgId, name } = collection
  return http.put(apiUrl + `/orgs/${orgId}/collections/${id}`, { orgId: moveToOrgId, name })
}

export function getPublishedContentByPath(queryParamsString = "") {
  return http.get(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
}

export async function getPublishedContentByIdAndType(id, type) {
  let data = await http.get(apiUrl + `/pages/${id}/getPublishedData?type=${type}`)
  return type == 4 ? data?.data?.publishedContent || {} : data?.data?.publishedContent?.contents || {}
}

export default {
  getCollectionsAndPages,
  getPublishedContentByPath,
  getPublishedContentByIdAndType,
  moveCollectionsAndPages,
}
