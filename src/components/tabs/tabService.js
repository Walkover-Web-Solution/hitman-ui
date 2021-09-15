import store from '../../store/store'
import {
  addNewTab,
  closeAllTabs,
  closeTab,
  setActiveTabId,
  updateTab
} from '../tabs/redux/tabsActions'
import tabStatusTypes from './tabStatusTypes'
import { getCurrentUser } from '../auth/authService'

function newTab (props) {
  store.dispatch(addNewTab({ ...props.history }))
}

function removeTab (tabId, props) {
  const { tabs, tabsOrder, activeTabId } = store.getState().tabs
  if (tabs[tabId]) {
    if (activeTabId === tabId) {
      const tabsCount = Object.keys(tabs).length
      if (tabsCount === 1) {
        newTab(props)
      } else {
        const index = tabsOrder.indexOf(tabId)
        if (index > 0) {
          selectTab(props, tabsOrder[index - 1])
        } else {
          selectTab(props, tabsOrder[index + 1])
        }
      }
    }
    store.dispatch(closeTab(tabId))
  }
}

function changeRoute (props, tab) {
  if (tab.isSaved) {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/${tab.type}/${tab.id}`
    })
  } else {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/${tab.type}/new`
    })
  }
}

function removeAllTabs (props) {
  store.dispatch(closeAllTabs())
  newTab(props)
}

function selectTab (props, tabId) {
  const { tabs } = store.getState().tabs

  const tab = tabs[tabId]
  if (tab.status === 'NEW') {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/${tab.type}/new`
    })
  } else {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/${tab.type}/${tab.id}`
    })
  }
  store.dispatch(setActiveTabId(tabId))
}

function disablePreviewMode (tabId) {
  store.dispatch(updateTab(tabId, { previewMode: false }))
}

function markTabAsModified (tabId) {
  if (getCurrentUser()) {
    const tab = store.getState().tabs.tabs[tabId]
    if (!tab.isModified) {
      store.dispatch(updateTab(tabId, { previewMode: false, isModified: true }))
    }
  }
}

function unmarkTabAsModified (tabId) {
  if (getCurrentUser()) {
    const tab = store.getState().tabs.tabs[tabId]
    if (tab.isModified) {
      store.dispatch(updateTab(tabId, { previewMode: false, isModified: false }))
    }
  }
}

function markTabAsSaved (tabId) {
  store.dispatch(
    updateTab(tabId, { status: tabStatusTypes.SAVED, isModified: false })
  )
}

function markTabAsDeleted (tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.DELETED }))
}

export default {
  newTab,
  removeTab,
  changeRoute,
  removeAllTabs,
  selectTab,
  disablePreviewMode,
  markTabAsModified,
  unmarkTabAsModified,
  markTabAsSaved,
  markTabAsDeleted
}
