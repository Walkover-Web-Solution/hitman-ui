import shortId from "shortid";
import { dispatch } from "react-redux";
import {
  addNewTab,
  closeTab,
  openInNewTab,
  updateTab,
  setActiveTabId,
} from "../tabs/redux/tabsActions";
import store from "../../store/store";
import tabStatusTypes from "./tabStatusTypes";

function newTab(props) {
  store.dispatch(addNewTab({ ...props.history }));
}

function removeTab(tabId, props) {
  const { tabs, tabsOrder, activeTabId } = store.getState().tabs;
  if (tabs[tabId]) {
    if (activeTabId === tabId) {
      const tabsCount = Object.keys(tabs).length;
      console.log(1, tabsCount);
      if (tabsCount === 1) {
        newTab(props);
      } else {
        const index = tabsOrder.indexOf(tabId);
        console.log(2, index);
        selectTab(props, tabsOrder[index - 1]);
      }
    }
    store.dispatch(closeTab(tabId));
  }
}

function changeRoute(props, tab) {
  if (tab.isSaved) {
    props.history.push({
      pathname: `/dashboard/${tab.type}/${tab.id}`,
    });
  } else {
    props.history.push({
      pathname: `/dashboard/${tab.type}/new`,
    });
  }
}

function closeAllTabs(props) {
  // const id = shortId.generate();
  // const tabs = [{ id, type: "endpoint", isSaved: false }];
  // props.set_tabs(tabs, 0);
  // props.history.push({ pathname: `/dashboard/endpoint/new` });
}

function selectTab(props, tabId) {
  const { tabs, tabsOrder, activeTabId } = store.getState().tabs;

  const tab = tabs[tabId];
  store.dispatch(setActiveTabId(tabId));
  console.log(tabId);
  if (tab.status === "NEW") {
    props.history.push({
      pathname: `/dashboard/${tab.type}/new`,
    });
  } else {
    props.history.push({
      pathname: `/dashboard/${tab.type}/${tab.id}`,
    });
  }
}

function disablePreviewMode(tabId) {
  store.dispatch(updateTab(tabId, { previewMode: false }));
}

function markTabAsModified(tabId) {
  const tab = store.getState().tabs.tabs[tabId];
  if (!tab.isModified) {
    store.dispatch(updateTab(tabId, { previewMode: false, isModified: true }));
  }
}

function markTabAsSaved(tabId) {
  store.dispatch(
    updateTab(tabId, { status: tabStatusTypes.SAVED, isModified: false })
  );
}

function markTabAsDeleted(tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.DELETED }));
}

export default {
  newTab,
  removeTab,
  changeRoute,
  closeAllTabs,
  selectTab,
  disablePreviewMode,
  markTabAsModified,
  markTabAsSaved,
  markTabAsDeleted,
};
