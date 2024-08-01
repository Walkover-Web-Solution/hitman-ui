import shortid from 'shortid'
import { store } from '../../../store/store'
import tabStatusTypes from '../tabStatusTypes'
import tabsActionTypes from './tabsActionTypes'
import { navigateTo } from '../../../navigationService'
import { getOrgId, isElectron } from '../../common/utility'
import { openModal } from '../../modals/redux/modalsActions'
import { DESKTOP_APP_DOWNLOAD } from '../../modals/modalTypes'
import { getPageContent } from '../../../services/pageServices'
import { toast } from 'react-toastify'

export const fetchTabsFromRedux = () => {
  return async (dispatch) => {
    const state = store.getState()
    const tabsList = state.tabs.tabs
    const tabsMetadata = {
      activeTabId: state.tabs.activeTabId,
      tabsOrder: state.tabs.tabsOrder
    }
    dispatch({
      type: tabsActionTypes.FETCH_TABS_FROM_REDUX,
      tabsList,
      tabsMetadata
    })
  }
}

export const fetchTabContent = (tabId) => {
  return async (dispatch) => {
    const orgId = getOrgId()
    try {
      const response = await getPageContent(orgId, tabId)
      const payloadData = { id: tabId, data: response }
      dispatch({
        type: tabsActionTypes.FETCH_PAGE_CONTENT_SUCCESS,
        payload: payloadData
      })
      return response.data
    } catch (error) {
      toast.error('Failed to fetch page content')
      throw error
    }
  }
}

export const addNewTab = () => {
  const state = store.getState()
  const id = shortid.generate()
  const tabsOrder = [...store.getState().tabs.tabsOrder]
  const isDesktopModalOpen = store.getState().modals.activeModal === DESKTOP_APP_DOWNLOAD
  if (!isElectron() && tabsOrder.length >= 10 && !isDesktopModalOpen) {
    return openModal(DESKTOP_APP_DOWNLOAD)
  }

  tabsOrder.push(id)
  const orgId = getOrgId()
  if (state.organizations?.currentOrg?.meta?.type === 0) {
    return async (dispatch) => {
      dispatch({
        type: tabsActionTypes.ADD_NEW_TAB,
        newTab: {
          id,
          type: 'page',
          status: tabStatusTypes.NEW,
          previewMode: false,
          isModified: false,
          name:'untitled'
        }
      })
      dispatch(setActiveTabId(id))
      navigateTo(`/orgs/${orgId}/dashboard/page/new/edit`)
    }
  } else {
    return async (dispatch) => {
      dispatch({
        type: tabsActionTypes.ADD_NEW_TAB,
        newTab: {
          id,
          type: 'endpoint',
          status: tabStatusTypes.NEW,
          previewMode: false,
          isModified: false,
          state: {}
        }
      })
      dispatch(setActiveTabId(id))
      navigateTo(`/orgs/${orgId}/dashboard/endpoint/new`)
    }
  }
}

export const closeTab = (tabId, history) => {
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_TAB, tabId })
  }
}

export const openInNewTab = (tab) => {
  const tabsOrder = store.getState().tabs.tabsOrder
  const isDesktopModalOpen = store.getState().modals.activeModal === DESKTOP_APP_DOWNLOAD
  if (!isElectron() && tabsOrder.length >= 10 && !isDesktopModalOpen) {
    return openModal(DESKTOP_APP_DOWNLOAD)
  }
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.OPEN_IN_NEW_TAB, tab })
    dispatch(setActiveTabId(tab.id))
  }
}

export const updateTab = (tabId, data) => {
  return (dispatch) => {
    if (!store.getState().tabs.tabs[tabId]) return
    dispatch({ type: tabsActionTypes.UPDATE_TAB, payload: { tabId, data } })
    return { ...store.getState().tabs.tabs[tabId], ...data }
  }
}

export const updateTabDraft = (tabId, draft) => {
  return (dispatch) => {
    if (!store.getState().tabs.tabs[tabId]) return
    dispatch({ type: tabsActionTypes.UPDATE_TAB_DRAFT, payload: { tabId, draft } })
  }
}

export const updatePostPreScriptExecutedData = (tabId, executedData) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.UPDATE_PRE_POST_SCRIPT, payload: { tabId, executedData } })
  }
}

export const setActiveTabId = (tabId) => {
  return async (dispatch) => {
    dispatch({
      type: tabsActionTypes.SET_ACTIVE_TAB_ID,
      tabId
    })
  }
}

export const setTabsOrder = (tabsOrder) => {
  return async (dispatch) => {
    dispatch({
      type: tabsActionTypes.SET_TABS_ORDER,
      tabsOrder
    })
  }
}

export const replaceTab = (oldTabId, newTab) => {
  const tabsOrder = store.getState().tabs.tabsOrder.filter((tId) => tId !== oldTabId)
  const isDesktopModalOpen = store.getState().modals.activeModal === DESKTOP_APP_DOWNLOAD
  if (!isElectron() && tabsOrder.length >= 10 && !isDesktopModalOpen) {
    return openModal(DESKTOP_APP_DOWNLOAD)
  }
  tabsOrder.push(newTab.id)
  return async (dispatch) => {
    dispatch({
      type: tabsActionTypes.REPLACE_TAB,
      oldTabId,
      newTab
    })
    dispatch({
      type: tabsActionTypes.SET_TABS_ORDER,
      tabsOrder
    })
  }
}

export const closeAllTabs = () => {
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_ALL_TABS })
  }
}

export const replaceTabForUntitled = (newTabId, currentActiveTabId) => {
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.REPLACE_TAB_ID, payload: { newTabId, currentActiveTabId } })
  }
}

export const setIntrospectionSchema = (tabId, schemaData) => {
  return { type: tabsActionTypes.SET_INTROSPECTION_SCHEMA, payload: { schemaData, tabId } }
}

export const setPageType = (tabId, pageType) => {
  return {
    type: tabsActionTypes.SET_PAGE_TYPE,
    payload: { tabId, pageType }
  }
}