import apiRequest from "../main"

export function getCollections() {
  return apiRequest.get(`/collection`)
}

export function getAllDeletedCollections() {
  return apiRequest.get(`/deletedCollections`)
}

export function restoreCollection(data, collectionId) {
  return apiRequest.put(`/restore/${collectionId}`, { data })
}

export function getCollectionsByCustomDomain(domain) {
  return apiRequest.get(`/collections`, { params: { custom_domain: domain } })
}

export function getCollection(collectionId) {
  return apiRequest.get(`/collection/${collectionId}`)
}

export function saveCollection(collection) {
  return apiRequest.post(`/collections`, collection)
}

export function updateCollection(collectionId, collection) {
  return apiRequest.put(`/collections/${collectionId}`, collection)
}

export function deleteCollection(collectionId, collection) {
  return apiRequest.delete(`/collections/${collectionId}`)
}

export function duplicateCollection(collectionId) {
  return apiRequest.post(`/duplicateCollections/${collectionId}`)
}

export function importCollectionService(openApiObject, uniqueTabId, defaultView) {
  return apiRequest.post(`/importCollection?defaultView=${defaultView}&uniqueTabId=${uniqueTabId}`, openApiObject);
}

export function getCollectionsAndPages(queryParamsString = '') {
  return apiRequest.get(`/getSideBarData${queryParamsString}`)
}

export function bulkPublishSelectedData(publishData) {
  return apiRequest.patch(`/bulkPublish`, publishData)
}

export function moveCollectionsAndPages(moveToOrgId, collection) {
  const { id, orgId, name } = collection
  return apiRequest.post(`/collections/${id}`, { orgId: moveToOrgId, name, collectionMoved: true })
}

export function exportCollectionApi(collectionId, type) {
  const response = apiRequest.post(`/exportCollection`, { collectionId, type })
  return response.data
}

export default {
  getCollections,
  getCollection,
  getAllDeletedCollections,
  saveCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  getCollectionsByCustomDomain,
  restoreCollection,
  importCollectionService,
  exportCollectionApi
}
