import { store } from '../../store/store'
import { addNewTab, closeAllTabs, closeTab, replaceTabForUntitled, setActiveTabId, updateTab } from '../tabs/redux/tabsActions'
import {   closeBulkTab } from '../tabs/redux/tabsActions'
import tabStatusTypes from './tabStatusTypes'
import { getCurrentUser } from '../auth/authServiceV2'

function newTab() {
  store.dispatch(addNewTab())
}

function removeTab(tabId, props) {
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
    if (localStorage.getItem(tabId)) {
      localStorage.removeItem(tabId)
    }
  }
}
function bulkRemoveTab(tabIds, tabs) {
  console.log("inside bulk remove tabs", tabIds);
  let filter
  const tabsData = tabs.tabs;
  // const activeTabId = tabs.activeTabId;
  // const tabsOrder = tabs.tabsOrder;

  for (let i = 0; i < tabIds.length; i++) {
    filter = Object.keys(tabsData).filter((id) => tabIds.includes(id));
    console.log(filter, "filtered data");
    }
    store.dispatch(closeBulkTab(filter))
}


function changeRoute(props, tab) {
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

function removeAllTabs(props) {
  store.dispatch(closeAllTabs())
  newTab(props)
}

function selectTab(props, tabId) {
  const { tabs } = store.getState().tabs

  const tab = tabs[tabId]
  if (tab.status === 'NEW') {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/${tab.type}/new`
    })
  } else if (tab.type === 'collection') {
    tab.state.pageType === 'SETTINGS' && props.history.push(`/orgs/${props.match.params.orgId}/dashboard/collection/${tab.id}/settings`)
    // : props.history.push(`/orgs/${props.match.params.orgId}/dashboard/collection/${tab.id}/feedback`)
  } else {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/${tab.type}/${tab.id}`
    })
  }
  store.dispatch(setActiveTabId(tabId))
}

function disablePreviewMode(tabId) {
  store.dispatch(updateTab(tabId, { previewMode: false }))
}

function markTabAsModified(tabId) {
  if (getCurrentUser()) {
    const tab = store.getState().tabs.tabs[tabId]
    if (!tab.isModified) {
      store.dispatch(updateTab(tabId, { previewMode: false, isModified: true }))
    }
  }
}

function unmarkTabAsModified(tabId) {
  if (getCurrentUser()) {
    const tab = store.getState().tabs.tabs[tabId]
    if (tab.isModified) {
      store.dispatch(updateTab(tabId, { previewMode: false, isModified: false }))
    }
  }
}

function markTabAsSaved(tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.SAVED, isModified: false }))
}

function markTabAsDeleted(tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.DELETED }))
}

function replaceTabWithNew(newTabId) {
  store.dispatch(replaceTabForUntitled(newTabId))
}

export default {
  newTab,
  removeTab,
  bulkRemoveTab,
  changeRoute,
  removeAllTabs,
  selectTab,
  disablePreviewMode,
  markTabAsModified,
  unmarkTabAsModified,
  markTabAsSaved,
  markTabAsDeleted,
  replaceTabWithNew
}
