import { toast } from 'react-toastify'
import { store } from '../../../store/store'
import pageApiService from '../pageApiService'
import pagesActionTypes from './pagesActionTypes'
import { getOrgId, focusSelectedEntity } from '../../common/utility'

export const fetchPages = (orgId) => {
  return (dispatch) => {
    pageApiService
      .getAllPages(orgId)
      .then((response) => {
        const pages = response.data
        dispatch(onPagesFetched(pages))
      })
      .catch((error) => {
        dispatch(onPagesFetchedError(error.message))
      })
  }
}

export const fetchPage = (pageId) => {
  return (dispatch) => {
    pageApiService
      .getPage(pageId)
      .then((response) => {
        const page = response.data
        dispatch(onPageFetched(page))
      })
      .catch((error) => {
        dispatch(onPageFetchedError(error.message))
      })
  }
}

export const onPageFetched = (page) => {
  return {
    type: pagesActionTypes.ON_PAGE_FETCHED,
    page
  }
}

export const onPageFetchedError = (error) => {
  return {
    type: pagesActionTypes.ON_PAGE_FETCHED_ERROR,
    error
  }
}

export const onPagesFetched = (pages) => {
  return {
    type: pagesActionTypes.ON_PAGES_FETCHED,
    pages
  }
}

export const onPagesFetchedError = (error) => {
  return {
    type: pagesActionTypes.ON_PAGES_FETCHED_ERROR,
    error
  }
}
export const updatePage = (history, editedPage, publishDocs = false) => {
  const newPage = { ...editedPage }
  const orgId = getOrgId()
  delete newPage.id
  delete newPage.versionId
  delete newPage.groupId
  const originalPage = store.getState().pages[editedPage.id]
  store.dispatch(updatePageRequest(editedPage))
  pageApiService
    .updatePage(editedPage.id, newPage)
    .then((response) => {
      store.dispatch(onPageUpdated(response.data))
      if (!publishDocs) {
        history.push(`/orgs/${orgId}/dashboard/page/${response.data.id}`)
      }
      return response.data
    })
    .catch((error) => {
      store.dispatch(onPageUpdatedError(error.response ? error.response.data : error, originalPage))
    })
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

export const addPage1 = (history, rootParentId, newPage) => {
  const orgId = getOrgId()
  return (dispatch) => {
    dispatch(addPageRequestInCollection(rootParentId, newPage))
    pageApiService
      .saveCollectionPage(rootParentId, newPage)
      .then((response) => {
        const data = response.data.page
        dispatch(onParentPageAdded(data))
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
  return (dispatch) => {
    dispatch(deletePageRequest(page))
    pageApiService
      .deletePage(page.id)
      .then((res) => {
        dispatch(onPageDeleted(res.data))
      })
      .catch((error) => {
        dispatch(onPageDeletedError(error.response, page))
      })
  }
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
