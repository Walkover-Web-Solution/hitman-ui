import shortid from 'shortid'
import { store } from '../../../store/store'
// import indexedDbService from '../../indexedDb/indexedDbService'
import tabStatusTypes from '../tabStatusTypes'
import tabsActionTypes from './tabsActionTypes'
import history from '../../../history'
import { getOrgId, isElectron } from '../../common/utility'
import { openModal } from '../../modals/redux/modalsActions'
import { DESKTOP_APP_DOWNLOAD } from '../../modals/modalTypes'

export const fetchTabsFromIdb = () => {
  return async (dispatch) => {
    const state = store.getState()
    const tabsList = state.tabs.tabs
    const tabsMetadata = {
      activeTabId: state.tabs.activeTabId,
      tabsOrder: state.tabs.tabsOrder
    }

    dispatch({
      type: tabsActionTypes.FETCH_TABS_FROM_IDB,
      tabsList,
      tabsMetadata
    })
  }
}

export const addNewTab = () => {
  const id = shortid.generate()
  const tabsOrder = [...store.getState().tabs.tabsOrder]
  const showDesktopModal = !window.matchMedia('(display-mode: standalone)').matches
  if (!isElectron() && tabsOrder.length >= 7 && showDesktopModal) {
    return openModal(DESKTOP_APP_DOWNLOAD)
  }

  tabsOrder.push(id)
  const orgId = getOrgId()

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
    history.push({ pathname: `/orgs/${orgId}/dashboard/endpoint/new` })
    // await indexedDbService.addData('tabs', {
    //   id,
    //   type: 'endpoint',
    //   status: tabStatusTypes.NEW,
    //   previewMode: false,
    //   isModified: false,
    //   state: {}
    // })
    // await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const closeTab = (tabId, history) => {
  // const tabsOrder = store.getState().tabs.tabsOrder.filter((tId) => tId !== tabId)
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_TAB, tabId })
    // await indexedDbService.deleteData('tabs', tabId)
    // await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const openInNewTab = (tab) => {
  const tabsOrder = store.getState().tabs.tabsOrder
  if (!isElectron() && tabsOrder.length >= 10) {
    return openModal(DESKTOP_APP_DOWNLOAD)
  }
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.OPEN_IN_NEW_TAB, tab })
    // await indexedDbService.addData('tabs', tab)
    // indexedDbService.getValue('tabs_metadata', 'tabsOrder').then((tabsOrder) => {
    //   if (!tabsOrder.includes(tab.id)) tabsOrder.push(tab.id)

    //   indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
    // })
    dispatch(setActiveTabId(tab.id))
  }
}

export const updateTab = (tabId, data) => {
  return (dispatch) => {
    if (!store.getState().tabs.tabs[tabId]) return
    dispatch({ type: tabsActionTypes.UPDATE_TAB, payload: { tabId, data } })
    return { ...store.getState().tabs.tabs[tabId], ...data }
    // indexedDbService.updateData('tabs', tab)
  }
}

export const setActiveTabId = (tabId) => {
  return async (dispatch) => {
    dispatch({
      type: tabsActionTypes.SET_ACTIVE_TAB_ID,
      tabId
    })
    // await indexedDbService.updateData('tabs_metadata', tabId, 'activeTabId')
  }
}

export const setTabsOrder = (tabsOrder) => {
  return async (dispatch) => {
    dispatch({
      type: tabsActionTypes.SET_TABS_ORDER,
      tabsOrder
    })
    // await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const replaceTab = (oldTabId, newTab) => {
  const tabsOrder = store.getState().tabs.tabsOrder.filter((tId) => tId !== oldTabId)
  if (!isElectron() && tabsOrder.length >= 7) {
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
    // await indexedDbService.deleteData('tabs', oldTabId)
    // await indexedDbService.addData('tabs', newTab)
    // await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const closeAllTabs = () => {
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_ALL_TABS })
    // await indexedDbService.updateData('tabs_metadata', [], 'tabsOrder')
    // await indexedDbService.updateData('tabs_metadata', null, 'activeTabId')
    // await indexedDbService.clearStore('tabs')
  }
}

export const replaceTabForUntitled = (newTabId) => {
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.REPLACE_TAB_ID, payload: { newTabId } })
  }
}
