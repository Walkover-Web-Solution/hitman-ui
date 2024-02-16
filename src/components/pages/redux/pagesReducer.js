import pagesActionTypes from './pagesActionTypes'
import { toast } from 'react-toastify'
import versionActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import collectionActionTypes from '../../collections/redux/collectionsActionTypes'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'
import generalActionsTypes from '../../redux/generalActionTypes'

const initialState = {}

function pagesReducer(state = initialState, action) {
  let pages = {}

  switch (action.type) {
    case pagesActionTypes.ON_PAGES_FETCHED:
      return { ...state, ...action.pages }

    case pagesActionTypes.ON_PAGES_FETCHED_ERROR:
      return state

    case pagesActionTypes.ON_PAGE_FETCHED:
      return { [action.page.id]: { ...action.page } }

    case pagesActionTypes.ON_PAGE_FETCHED_ERROR:
      return state

    // case pagesActionTypes.ADD_PAGE_REQUEST:
    //   action.newPage.groupId = null
    //   action.newPage.versionId = action.versionId
    //   return {
    //     ...state,
    //     [action.newPage.requestId]: action.newPage
    //   }
    case pagesActionTypes.ADD_PARENT_PAGE_REQUEST:
      action.newPage.parentId = action.parentId
      return {
        ...state,
        [action.newPage.requestId]: action.newPage
      }

    case publicEndpointsActionTypes.ON_ENDPOINT_STATE_SUCCESS:
      state[action.data.id].state = action.data.state
      state[action.data.id].isPublished = action.data.isPublished
      return {
        ...state
      }
    case publicEndpointsActionTypes.UPDATE_ENDPOINT_REQUEST:
      return {
        ...state,
        [action.editedEndpoint.id]: action.editedEndpoint
      }
    case pagesActionTypes.ON_PARENT_PAGE_ADDED: {
      pages = { ...state }

      let pageData = { ...action.page }
      if (pageData.type === 0) {
        pages[action.page.id] = pageData
      }
      delete pages[action.page.requestId]
      delete pageData.requestId
      pages[action.page.id] = pageData

      if (action.page.type === 1) {
        const versionData = { ...action.version }
        delete versionData.requestId
        pages[action.version.id] = versionData
      }

      if (action.page.parentId) {
        const parentId = action.page.parentId
        if (!pages[parentId].child) {
          pages[parentId].child = []
        }
        pages[parentId].child.push(action.page.id)
      }
      return pages
    }
    case pagesActionTypes.ADD_VERSION_REQUEST:
      return {
        ...state,
        [action.newVersion.requestId]: action.newVersion
      }

    case pagesActionTypes.ON_PAGE_ADDED_ERROR:
      toast.error(action.error)
      pages = { ...state }
      delete pages[action.newPage.requestId]
      return pages

    case pagesActionTypes.ADD_VERSION_REQUEST:
      return {
        ...state,
        [action.newVersion.requestId]: action.newVersion
      }

    case pagesActionTypes.ON_PARENTPAGE_VERSION_ADDED:
      pages = { ...state }
      delete pages[action.response.requestId]
      const versionData = { ...action.response }
      delete versionData.requestId
      pages[action.response.id] = versionData
      if (action.response.parentId) {
        const parentId = action.response.parentId
        if (!pages[parentId].child) {
          pages[parentId].child = []
        }
        pages[parentId].child.push(action.response.id)
      }
      return pages

    case pagesActionTypes.ON_GROUP_PAGE_ADDED_ERROR:
      toast.error(action.error)
      pages = { ...state }
      delete pages[action.newPage.requestId]
      return pages

    case pagesActionTypes.UPDATE_PAGE_REQUEST:
      return {
        ...state,
        [action.editedPage.id]: action.editedPage
      }

    case pagesActionTypes.ON_PAGE_UPDATED:
      return {
        ...state,
        [action.response.id]: action.response
      }

    case pagesActionTypes.ON_PAGE_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalPage.id]: action.originalPage
      }

    case pagesActionTypes.DELETE_PAGE_REQUEST:
      pages = { ...state }
      delete pages[action.page.id]
      return pages

    case pagesActionTypes.ON_PAGE_DELETED:
      return state

    case pagesActionTypes.ON_PAGE_DELETED_ERROR:
      toast.error(action.error.data)
      if (action.error.status === 404) return state
      return {
        ...state,
        [action.page.id]: action.page
      }

    case pagesActionTypes.ON_PAGE_DUPLICATED:
      pages = { ...state }
      pages[action.response.id] = action.response
      return pages

    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.pages }

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.pages }

    case versionActionTypes.IMPORT_VERSION:
      return { ...state, ...action.response.pages }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...state, ...action.data.pages }

    case publicEndpointsActionTypes.ON_PAGE_STATE_SUCCESS:
      return {
        ...state,
        [action.data.id]: action.data
      }

    case publicEndpointsActionTypes.ON_PAGE_STATE_ERROR:
      toast.error(action.error)
      return { ...state }

    case pagesActionTypes.ON_PAGES_ORDER_UPDATED:
      pages = { ...action.pages }
      return pages

    case pagesActionTypes.ON_PAGES_ORDER_UPDATED_ERROR:
      toast.error(action.error)
      pages = { ...action.pages }
      return pages

    case bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION:
      pages = { ...action.data.updatedPages }
      return pages

    case bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES:
      return { ...action.data }

    case bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_ERROR:
      pages = { ...action.originalData.originalPages }
      return pages

    case collectionActionTypes.ON_COLLECTION_IMPORTED:
      pages = { ...state, ...action.pages }
      return pages

    case generalActionsTypes.ADD_PAGES:
      return { ...action.data }

    case pagesActionTypes.UPDATE_CONTENT_OF_PAGE:
      if (state[action.payload.pageId]) {
        state[action.payload.pageId] = { ...state[action.payload.pageId], ...action.payload.data }
      }
      return { ...state }

    case pagesActionTypes.UPDATE_PAGE_DATA:
      if (state[action.payload.pageId]) {
        state[action.payload.pageId] = { ...state[action.payload.pageId], ...action.payload.data }
      }
      return { ...state }

    case pagesActionTypes.UPDATE_PAGE_DATA:
      if (state[action.payload.pageId]) {
        state[action.payload.pageId] = { ...state[action.payload.pageId], ...action.payload.data }
      }
      return { ...state }

    case pagesActionTypes.ADD_CHILD_IN_PARENT:
      if (state[action.payload.parentId]) {
        state[action.payload.parentId].child.push(action.payload.id)
        state[action.payload.id] = action.payload
      }
      return { ...state }

    case pagesActionTypes.UPDATE_NAME_OF_PAGE:
      if (state[action.payload.id]) {
        state[action.payload.id].name = action.payload.name
      }
      return { ...state }

    case pagesActionTypes.DELETE_ENDPOINT_REQUEST:
      pages = { ...state }
      delete pages[action.endpoint.id]
      return { ...pages }

    case pagesActionTypes.ON_ENDPOINT_DELETED:
      const updatedEndpoint = { ...state }
      const parentId = action?.response?.data?.ParentPage?.id
      updatedEndpoint[parentId].child = action.response.data.ParentPage.child
      toast.success(' Endpoint deleted succesfully')
      return updatedEndpoint

    case pagesActionTypes.ON_ENDPOINT_DELETED_ERROR:
      toast.error(action?.error?.data)
      if (action?.error?.status === 404) return state
      return {
        ...state,
        [action.endpoint.id]: action.endpoint
      }

    case pagesActionTypes.ON_ENDPOINT_UPDATED:
      return {
        ...state,
        [action.response.id]: { ...state[action.response.id], requestType: action.response.requestType, name: action.response.name }
      }

    default:
      return state
  }
}

export default pagesReducer

export const selectPageOfId = (state, id) => state[id]
