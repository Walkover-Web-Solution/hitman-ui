import { store } from '../../store/store'
import {
  addNewTab,
  closeAllTabs,
  closeTab,
  replaceTabForUntitled,
  setActiveTabId,
  updateTab,
  updateTabDraft
} from '../tabs/redux/tabsActions'
import tabStatusTypes from './tabStatusTypes'
import { getCurrentUser } from '../auth/authServiceV2'
import { getOrgId } from '../common/utility'
import { navigateTo, getParams } from '../../navigationService'

function newTab() {
  store.dispatch(addNewTab())
}

function removeTab(tabId, props) {
  const { tabs, tabsOrder, activeTabId } = store.getState().tabs
  if (tabs[tabId]) {
    if (activeTabId === tabId) {
      const tabsCount = Object.keys(tabs).length
      if (tabsCount === 1) {
        newTab()
      } else {
        const index = tabsOrder.indexOf(tabId)
        if (index > 0) {
          selectTab(tabsOrder[index - 1])
        } else {
          selectTab(tabsOrder[index + 1])
        }
      }
    }
    store.dispatch(closeTab(tabId))
    if (localStorage.getItem(tabId)) {
      localStorage.removeItem(tabId)
    }
  }
}

function removeAllTabs(props) {
  store.dispatch(closeAllTabs())
  newTab(props)
}

function selectTab(tabId) {
  const { orgId } = getParams()
  const { tabs } = store.getState().tabs
  const tab = tabs[tabId]
  if (tab?.status === 'NEW') navigateTo(`/orgs/${orgId}/dashboard/${tab.type}/new`)
    if (tab?.type === 'collection') {
      if (tab?.state?.pageType === 'SETTINGS') navigateTo(`/orgs/${orgId}/dashboard/collection/${tab.id}/settings`);
      else if (tab?.state?.pageType === 'RUNS') navigateTo(`/orgs/${orgId}/dashboard/collection/${tab.id}/runs`);
      navigateTo(`/orgs/${orgId}/dashboard/collection/${tab.id}/feedback`);
  } else {
    if (!(tab?.type && tab?.id)) return navigateTo(`/orgs/${getOrgId()}/dashboard/endpoint/new`)
    return navigateTo(`/orgs/${orgId}/dashboard/${tab?.type}/${tab?.id}${(tab.isModified) ? '/edit' : ''}`)
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

function updateDraftData(pageId, data) {
  store.dispatch(updateTabDraft(pageId, data))
}

export default {
  newTab,
  removeTab,
  removeAllTabs,
  selectTab,
  disablePreviewMode,
  markTabAsModified,
  unmarkTabAsModified,
  markTabAsSaved,
  markTabAsDeleted,
  replaceTabWithNew,
  updateDraftData
}
