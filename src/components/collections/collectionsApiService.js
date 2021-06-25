import http from '../../services/httpService'
import httpService from '../../services/endpointHttpService'
import { getOrgId } from '../common/utility'

const orgId = getOrgId()
const apiEndpoint = process.env.REACT_APP_API_URL + `/orgs/${orgId}/collections`

const apiUrl = process.env.REACT_APP_API_URL

function collectionUrl (id) {
  return `${apiEndpoint}/${id}`
}

export function getCollections (id) {
  return http.get(apiUrl + `/orgs/${id}/collections`)
}

export function getAllPublicCollections () {
  return httpService.get(apiEndpoint, { params: { public: 'true' } })
}

export function getCollectionsByCustomDomain (domain) {
  return httpService.get(apiEndpoint, { params: { custom_domain: domain } })
}

export function getCollection (collectionId) {
  return http.get(collectionUrl(collectionId))
}

export function saveCollection (collection) {
  return http.post(apiEndpoint, collection)
}

export function updateCollection (collectionId, collection) {
  return http.put(collectionUrl(collectionId), collection)
}

export function deleteCollection (collectionId) {
  return http.delete(collectionUrl(collectionId))
}

export function duplicateCollection (collectionId) {
  return http.post(`${apiUrl}/orgs/${orgId}/duplicateCollections/${collectionId}`)
}

export function importCollection (collectionId) {
  return http.post(`${apiUrl}/orgs/${orgId}/marketplace/collections/${collectionId}`)
}

export function removePublicCollection (collectionId) {
  return http.delete(`${apiUrl}/orgs/${orgId}/marketplace/collections/${collectionId}`)
}

export default {
  getCollections,
  getCollection,
  saveCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  getAllPublicCollections,
  getCollectionsByCustomDomain,
  importCollection,
  removePublicCollection
}
