import http from '../../services/httpService'
import { getOrgId } from '../common/utility'
const orgId = getOrgId()

const apiUrl = process.env.REACT_APP_API_URL + `/orgs/${orgId}`
const apiBaseUrl = process.env.REACT_APP_API_URL

function versionPagesUrl (versionId) {
  return `${apiUrl}/versions/${versionId}/pages`
}

function groupPagesUrl (groupId) {
  return `${apiUrl}/groups/${groupId}/pages`
}

function pageUrl (pageId) {
  return `${apiUrl}/pages/${pageId}`
}

function getAllPagesUrl (id) {
  return `${apiBaseUrl}/orgs/${id}/pages`
}
export function getAllPages (id) {
  return http.get(getAllPagesUrl(id))
}

export function getVersionPages (versionId) {
  return http.get(versionPagesUrl(versionId))
}

export function getGroupPages (groupId) {
  return http.get(groupPagesUrl(groupId))
}

export function getPage (pageId) {
  return http.get(pageUrl(pageId))
}

export function saveVersionPage (versionId, page) {
  return http.post(versionPagesUrl(versionId), page)
}

export function saveGroupPage (groupId, page) {
  return http.post(groupPagesUrl(groupId), page)
}

export function updatePage (pageId, page) {
  return http.put(`${apiUrl}/pages/${pageId}`, page)
}

export function deletePage (pageId) {
  return http.delete(`${apiUrl}/pages/${pageId}`)
}

export function duplicatePage (pageId) {
  return http.post(`${apiUrl}/duplicatePages/${pageId}`)
}

export function updatePageOrder (pagesOrder) {
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
  updatePageOrder
}
