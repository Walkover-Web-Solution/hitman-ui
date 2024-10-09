import http from '@/services/httpService'
import { getOrgId } from '../common/utility'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

function getApiUrl() {
  const orgId = getOrgId()
  return process.env.NEXT_PUBLIC_API_URL + `/orgs/${orgId}`
}

function collectionPagesUrl(pageId) {
  const apiUrl = getApiUrl()
  return `${apiUrl}/pages/${pageId}`
}

function getAllPagesUrl(id) {
  return `${apiBaseUrl}/orgs/${id}/pages`
}
export function getAllPages(id) {
  return http.get(getAllPagesUrl(id))
}

export function saveCollectionPage(rootParentId, page) {
  return http.post(collectionPagesUrl(rootParentId), page)
}

export function updatePage(pageId, page) {
  const apiUrl = getApiUrl()
  return http.put(`${apiUrl}/pages/${pageId}`, page)
}

export function deletePage(pageId, page) {
  const apiUrl = getApiUrl()
  return http.delete(`${apiUrl}/pages/${pageId}`, { data: page })
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

export function dragAndDropApi(body) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/dragAndDrop`, body)
}

export function deleteFiles(path) {
  const apiUrl = getApiUrl()
  return http.delete(`${apiUrl}/delete/multipleFiles`, {
    data: { imagePath: path },
  });
}

export function uploadFiles(formData) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/upload/file`, formData);
}

export function globalSearch(searchTerm, collectionId) {
  const apiUrl = getApiUrl()
  return http.post(`${apiUrl}/global-search`, { searchTerm, collectionId })
}

export default {
  updatePage,
  deletePage,
  deleteFiles,
  uploadFiles,
  duplicatePage,
  getAllPages,
  updatePageOrder,
  saveCollectionPage,
  dragAndDropApi
}
