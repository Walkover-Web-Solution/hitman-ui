import shortid from 'shortid'
import store from '../../../store/store'
import indexedDbService from '../../indexedDb/indexedDbService'
import tabStatusTypes from '../tabStatusTypes'
import tabsActionTypes from './tabsActionTypes'
import history from '../../../history'
import { getOrgId, isElectron } from '../../common/utility'
import { openModal } from '../../modals/redux/modalsActions'
import { DESKTOP_APP_DOWNLOAD } from '../../modals/modalTypes'

export const fetchTabsFromIdb = (props) => {
  return async (dispatch) => {
    indexedDbService.getAllData('tabs').then((tabsList) => {
      indexedDbService.getAllData('tabs_metadata').then((tabsMetadata) => {
        if (!(tabsList && Object.keys(tabsList).length)) {
          if (props.location.pathname.split('/')[4] === 'endpoint') {
            let newTab = null

            if (props.location.pathname.split('/')[5] === 'new') {
              const id = shortid.generate()
              newTab = {
                id,
                type: 'endpoint',
                status: tabStatusTypes.NEW,
                previewMode: false,
                isModified: false,
                state: {}
              }
            } else if (props.location.pathname.split('/')[5]) {
              const endpointId = props.location.pathname.split('/')[5]
              newTab = {
                id: endpointId,
                type: 'endpoint',
                status: tabStatusTypes.SAVED,
                previewMode: false,
                isModified: false,
                state: {}
              }
            }

            tabsList[newTab.id] = newTab
            if (!tabsMetadata.tabsOrder.includes(newTab.id)) {
              tabsMetadata.tabsOrder.push(newTab.id)
            }
            tabsMetadata.activeTabId = newTab.id
            indexedDbService.addData('tabs', newTab)
            indexedDbService.updateData(
              'tabs_metadata',
              tabsMetadata.activeTabId,
              'activeTabId'
            )
            indexedDbService.updateData(
              'tabs_metadata',
              tabsMetadata.tabsOrder,
              'tabsOrder'
            )
          }
        } else if (
          props.location.pathname.split('/')[4] === 'endpoint' &&
          props.location.pathname.split('/')[5] === 'new' &&
          tabsList[tabsMetadata.activeTabId] &&
          tabsList[tabsMetadata.activeTabId].status !== 'NEW'
        ) {
          const id = shortid.generate()
          const newTab = {
            id,
            type: 'endpoint',
            status: tabStatusTypes.NEW,
            previewMode: false,
            isModified: false,
            state: {}
          }
          tabsList[newTab.id] = newTab
          tabsMetadata.tabsOrder.push(newTab.id)
          tabsMetadata.activeTabId = newTab.id
          indexedDbService.addData('tabs', newTab)
          indexedDbService.updateData(
            'tabs_metadata',
            tabsMetadata.activeTabId,
            'activeTabId'
          )
          indexedDbService.updateData(
            'tabs_metadata',
            tabsMetadata.tabsOrder,
            'tabsOrder'
          )
        }

        dispatch({
          type: tabsActionTypes.FETCH_TABS_FROM_IDB,
          tabsList,
          tabsMetadata
        })
      })
    })
  }
}

export const addNewTab = () => {
  const id = shortid.generate()
  const tabsOrder = [...store.getState().tabs.tabsOrder]

  if (!isElectron() && tabsOrder.length >= 5) {
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
    await indexedDbService.addData('tabs', {
      id,
      type: 'endpoint',
      status: tabStatusTypes.NEW,
      previewMode: false,
      isModified: false,
      state: {}
    })
    await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const closeTab = (tabId, history) => {
  const tabsOrder = store
    .getState()
    .tabs.tabsOrder.filter((tId) => tId !== tabId)
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_TAB, tabId })
    await indexedDbService.deleteData('tabs', tabId)
    await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const openInNewTab = (tab) => {
  const tabsOrder = store.getState().tabs.tabsOrder
  if (!isElectron() && tabsOrder.length >= 5) {
    return openModal(DESKTOP_APP_DOWNLOAD)
  }
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.OPEN_IN_NEW_TAB, tab })
    await indexedDbService.addData('tabs', tab)
    indexedDbService
      .getValue('tabs_metadata', 'tabsOrder')
      .then((tabsOrder) => {
        if (!tabsOrder.includes(tab.id)) tabsOrder.push(tab.id)

        indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
      })
    dispatch(setActiveTabId(tab.id))
  }
}

export const updateTab = (tabId, data) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.UPDATE_TAB, payload: { tabId, data } })
    const tab = { ...store.getState().tabs.tabs[tabId], ...data }
    indexedDbService.updateData('tabs', tab)
  }
}

export const setActiveTabId = (tabId) => {
  return (dispatch) => {
    dispatch({
      type: tabsActionTypes.SET_ACTIVE_TAB_ID,
      tabId
    })
    indexedDbService.updateData('tabs_metadata', tabId, 'activeTabId')
  }
}

export const setTabsOrder = (tabsOrder) => {
  return (dispatch) => {
    dispatch({
      type: tabsActionTypes.SET_TABS_ORDER,
      tabsOrder
    })
    indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const replaceTab = (oldTabId, newTab) => {
  const tabsOrder = store
    .getState()
    .tabs.tabsOrder.filter((tId) => tId !== oldTabId)
  if (!isElectron() && tabsOrder.length >= 5) {
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
    await indexedDbService.deleteData('tabs', oldTabId)
    await indexedDbService.addData('tabs', newTab)
    await indexedDbService.updateData('tabs_metadata', tabsOrder, 'tabsOrder')
  }
}

export const closeAllTabs = () => {
  return async (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_ALL_TABS })
    await indexedDbService.updateData('tabs_metadata', [], 'tabsOrder')
    await indexedDbService.updateData('tabs_metadata', null, 'activeTabId')
    await indexedDbService.clearStore('tabs')
  }
}
