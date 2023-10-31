import http from '../../services/httpService'
import httpService from '../../services/endpointHttpService'
import { getOrgId } from '../common/utility'

const apiUrl = process.env.REACT_APP_API_URL

function getApiEndpoint () {
  const orgId = getOrgId()
  return `${apiUrl}/orgs/${orgId}/collections`
}

function collectionUrl (id) {
  const orgId = getOrgId()
  const apiEndpoint = getApiEndpoint(orgId)
  return `${apiEndpoint}/${id}`
}

export function getCollections (orgId) {
  return http.get(apiUrl + `/orgs/${orgId}/collections`)
}

export function getAllPublicCollections () {
  const orgId = getOrgId()
  const apiEndpoint = getApiEndpoint(orgId)
  return httpService.get(apiEndpoint, { params: { public: 'true' } })
}

export function getCollectionsByCustomDomain (domain) {
  const orgId = getOrgId()
  const apiEndpoint = getApiEndpoint(orgId)
  return httpService.get(apiEndpoint, { params: { custom_domain: domain } })
}

export function getCollection (collectionId) {
  return http.get(collectionUrl(collectionId))
}

export function saveCollection (collection) {
  const orgId = getOrgId()
  const apiEndpoint = getApiEndpoint(orgId)
  return http.post(apiEndpoint, collection)
}

export function updateCollection (collectionId, collection) {
  return http.put(collectionUrl(collectionId), collection)
}

export function deleteCollection (collectionId) {
  return http.delete(collectionUrl(collectionId))
}

export function duplicateCollection (collectionId) {
  const orgId = getOrgId()
  return http.post(`${apiUrl}/orgs/${orgId}/duplicateCollections/${collectionId}`)
}

export function importCollection (collectionId) {
  const orgId = getOrgId()
  return http.post(`${apiUrl}/orgs/${orgId}/marketplace/collections/${collectionId}`)
}

export function removePublicCollection (collectionId) {
  const orgId = getOrgId()
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
