import http from '../../services/httpService'
import { getOrgId } from '../common/utility'

const apiBaseUrl = process.env.REACT_APP_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.REACT_APP_API_URL + `/orgs/${orgId}`
}

function versionPagesUrl(versionId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/versions/${versionId}/pages`
}
function collectionPagesUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}`
}

function groupPagesUrl(groupId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/groups/${groupId}/pages`
}

function pageUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}`
}

function getAllPagesUrl(id) {
  return `${apiBaseUrl}/orgs/${id}/pages`
}
export function getAllPages(id) {
  return http.get(getAllPagesUrl(id))
}

export function getVersionPages(versionId) {
  return http.get(versionPagesUrl(versionId))
}

export function getGroupPages(groupId) {
  return http.get(groupPagesUrl(groupId))
}

export function getPage(pageId) {
  return http.get(pageUrl(pageId))
}

export function saveVersionPage(versionId, page) {
  return http.post(versionPagesUrl(versionId), page)
}
export function saveCollectionPage(rootParentId, page) {
  return http.post(collectionPagesUrl(rootParentId), page)
}

export function saveGroupPage(groupId, page) {
  return http.post(groupPagesUrl(groupId), page)
}

export function updatePage(pageId, page) {
  const apiUrl = getApiUrl()
  return http.put(`${apiUrl}/pages/${pageId}`, page)
}

export function deletePage(pageId) {
  const pageid = pageId.id? pageId.id : pageId
  const apiUrl = getApiUrl()
  return http.delete(`${apiUrl}/pages/${pageId}`)
}

export function duplicatePage(pageId) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/duplicatePages/${pageId}`)
}

export function updatePageOrder(pagesOrder) {
  const apiUrl = getApiUrl()
  return http.patch(`${apiUrl}/updatePagesOrder`, {
    pagesOrder: pagesOrder
  })
}

export default {
  getVersionPages,
  getGroupPages,
  getPage,
  saveVersionPage,
  saveGroupPage,
  updatePage,
  deletePage,
  duplicatePage,
  getAllPages,
  updatePageOrder,
  saveCollectionPage
}
