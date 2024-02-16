import { toast } from 'react-toastify'
import { store } from '../../../store/store'
import pageApiService from '../pageApiService'
import pagesActionTypes from './pagesActionTypes'
import { getOrgId, focusSelectedEntity, operationsAfterDeletion, deleteAllPagesAndTabsAndReactQueryData } from '../../common/utility'
import collectionVersionsActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import endpointApiService from '../../endpoints/endpointApiService'
import endpointsActionTypes from '../../endpoints/redux/endpointsActionTypes'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

export const updateEndpoint = (editedEndpoint, stopSaveLoader) => {
  return (dispatch) => {
    // const originalEndpoint = store.getState().pages[editedEndpoint.id]
    // dispatch(updateEndpointRequest(editedEndpoint))
    const id = editedEndpoint.id
    const updatedEndpoint = editedEndpoint
    delete updatedEndpoint.id
    // delete updatedEndpoint.groupId
    endpointApiService
      .updateEndpoint(id, updatedEndpoint)
      .then((response) => {
        dispatch(onEndpointUpdated(response.data))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
      .catch((error) => {
        // dispatch(onEndpointUpdatedError(error.response ? error.response.data : error, originalEndpoint))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
  }
}

export const onEndpointUpdatedError = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR,
    error,
    originalEndpoint
  }
}

export const updatePage = (history, editedPage, publishDocs = false) => {
  return (dispatch) => {
    const orgId = getOrgId()
    const dataToSend = {
      name: editedPage.name,
      contents: editedPage?.contents || null,
      state: editedPage.state
    }
    dispatch(updatePageRequest(dataToSend))
    pageApiService
      .updatePage(editedPage.id, dataToSend)
      .then((response) => {
        dispatch(onPageUpdated(response.data))
        if (!publishDocs) {
          history.push(`/orgs/${orgId}/dashboard/page/${response.data.id}`)
        }
        return response.data
      })
      .catch((error) => {
        dispatch(onPageUpdatedError(error.response ? error.response.data : error, editedPage))
      })
  }
}

export const updateContent = async ({ pageData, id }) => {
  delete pageData.id
  delete pageData.versionId
  delete pageData.groupId
  try {
    const data = await pageApiService.updatePage(id, pageData)
    return data.data
  } catch (error) {
    console.error(error)
  }
}

export const updatePageRequest = (editedPage) => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_REQUEST,
    editedPage
  }
}

export const onPageUpdated = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED,
    response
  }
}

export const onPageUpdatedError = (error, originalPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED_ERROR,
    error,
    originalPage
  }
}
export const updateEndpointRequest = (editedEndpoint) => {
  return {
    type: pagesActionTypes.UPDATE_ENDPOINT_REQUEST,
    editedEndpoint
  }
}

export const onEndpointUpdated = (response) => {
  return {
    type: pagesActionTypes.ON_ENDPOINT_UPDATED,
    response
  }
}

export const addPage1 = (history, rootParentId, newPage) => {
  const orgId = getOrgId()
  return (dispatch) => {
    dispatch(addPageRequestInCollection(rootParentId, newPage))
    pageApiService
      .saveCollectionPage(rootParentId, newPage)
      .then((response) => {
        const data = response.data.page
        response.data.page.requestId = newPage.requestId
        dispatch(onParentPageAdded(response.data))
        history.push(`/orgs/${orgId}/dashboard/page/${data.id}/edit`)
      })
      .catch((error) => {
        dispatch(onPageAddedError(error.response ? error.response.data : error, newPage))
      })
  }
}

export const addPageRequestInCollection = (rootParentId, newPage) => {
  return {
    type: pagesActionTypes.ADD_PARENT_PAGE_REQUEST,
    rootParentId,
    newPage
  }
}

export const onParentPageAdded = (response) => {
  return {
    type: pagesActionTypes.ON_PARENT_PAGE_ADDED,
    page: response.page,
    version: response.version
  }
}
export const onParentPageVersionAdded = (response) => {
  return {
    type: collectionVersionsActionTypes.ON_PARENTPAGE_VERSION_ADDED,
    response
  }
}

export const onPageAddedError = (error, newPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_ADDED_ERROR,
    newPage,
    error
  }
}

export const deletePage = (page) => {
  const tabs = store.getState().tabs
  return (dispatch) => {
    pageApiService
      .deletePage(page?.id)
      .then((res) => {
        deleteAllPagesAndTabsAndReactQueryData(page.id)
          .then((data) => {
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data.pages })
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })

            // after deletion operation
            operationsAfterDeletion(data)
          })
          .catch((error) => {
            console.errro(error)
          })
      })
      .catch((error) => {
        dispatch(onPageDeletedError(error.response, page))
      })
  }
}

const deletePageAndChildren = (pageId, tabs, pageIds = []) => {
  const pages = store.getState().pages
  if (pages[pageId]) {
    pages[pageId].child.forEach((childPageId) => {
      const newPageIds = [...pageIds, childPageId]
      deletePageAndChildren(childPageId, tabs, newPageIds)
    })
    delete pages[pageId]
  }
  // tabsDataDelete(pageIds, tabs);
  return pages
}

export const deletePageRequest = (page) => {
  return {
    type: pagesActionTypes.DELETE_PAGE_REQUEST,
    page
  }
}

export const onPageDeleted = (page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED,
    page
  }
}

export const onPageDeletedError = (error, page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED_ERROR,
    error,
    page
  }
}

export const duplicatePage = (page) => {
  return (dispatch) => {
    pageApiService
      .duplicatePage(page.id)
      .then((response) => {
        dispatch(onPageDuplicated(response.data))
      })
      .catch((error) => {
        toast.error(error)
      })
  }
}

export const onPageDuplicated = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_DUPLICATED,
    response
  }
}

export const updatePageOrder = (pagesOrder) => {
  return (dispatch) => {
    const originalPages = JSON.parse(JSON.stringify(store.getState().pages))
    dispatch(updatePageOrderRequest({ ...store.getState().pages }, pagesOrder))
    pageApiService
      .updatePageOrder(pagesOrder)
      .then((response) => {
        toast.success(response.data)
      })
      .catch((error) => {
        dispatch(onPageOrderUpdatedError(error.response ? error.response.data : error, originalPages))
      })
  }
}

export const updatePageOrderRequest = (pages, pagesOrder) => {
  for (let i = 0; i < pagesOrder.length; i++) {
    pages[pagesOrder[i]].position = i
  }
  return {
    type: pagesActionTypes.ON_PAGES_ORDER_UPDATED,
    pages
  }
}

export const onPageOrderUpdatedError = (error, pages) => {
  return {
    type: pagesActionTypes.ON_PAGES_ORDER_UPDATED_ERROR,
    pages,
    error
  }
}

export const updatePageContentData = (payload) => {
  return {
    type: pagesActionTypes.UPDATE_CONTENT_OF_PAGE,
    payload
  }
}

export const updatePageData = (payload) => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_DATA,
    payload: {
      pageId: payload.pageId,
      data: payload.data
    }
  }
}

export const addChildInParent = (payload) => {
  return {
    type: pagesActionTypes.ADD_CHILD_IN_PARENT,
    payload
  }
}

export const updateNameOfPages = (payload) => {
  return {
    type: pagesActionTypes.UPDATE_NAME_OF_PAGE,
    payload
  }
}
