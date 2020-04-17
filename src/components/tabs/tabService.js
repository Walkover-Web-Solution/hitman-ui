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
  props.closeTab(tabId);
  if (props.tabs.activeTabId === tabId) {
    const tabsCount = Object.keys(props.tabs.tabs).length;
    if (tabsCount === 0) {
      newTab(props);
    } else {
      props.setActiveTabId(Object.keys(props.tabs.tabs)[0]);
      changeRoute(props, props.tabs.tabs[Object.keys(props.tabs.tabs)[0]]);
    }
  }
}

function changeRoute(props, tab) {
  // if (tab.type === "endpoint") {
  if (tab.isSaved) {
    props.history.push({
      pathname: `/dashboard/${tab.type}/${tab.id}`,
    });
  } else {
    props.history.push({
      pathname: `/dashboard/${tab.type}/new`,
    });
  }
  // }
}

function closeAllTabs(props) {
  const id = shortId.generate();
  const tabs = [{ id, type: "endpoint", isSaved: false }];
  props.set_tabs(tabs, 0);
  props.history.push({ pathname: `/dashboard/endpoint/new` });
}

function selectTab(props, tabId) {
  // props.set_tabs(null, index);
  const tab = props.tabs.tabs[tabId];
  props.setActiveTabId(tabId);
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
  if (tab.status !== tabStatusTypes.MODIFIED) {
    store.dispatch(
      updateTab(tabId, { previewMode: false, status: tabStatusTypes.MODIFIED })
    );
  }
}

function markTabAsSaved(tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.SAVED }));
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
};
