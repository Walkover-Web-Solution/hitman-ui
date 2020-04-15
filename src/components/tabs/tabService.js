import shortId from "shortid";
import indexedDbService from "../indexedDb/indexedDbService";
import { dispatch } from "react-redux";
import {
  addNewTab,
  closeTab,
  openInNewTab,
  updateTab,
  setActiveTabId,
} from "../tabs/redux/tabsActions";
import store from "../../store/store";

function newTab(props) {
  // let tabs = {...props.tabs};
  // const id = shortId.generate();
  // tabs.push({ id, type: "endpoint", isSaved: false });
  // props.set_tabs([...tabs], tabs.length - 1);
  // indexedDbService.addData("tabs", { id, type: "endpoint", isSaved: false });
  store.dispatch(addNewTab({ ...props.history }));
  // props.history.push({ pathname: `/dashboard/endpoint/new` });
}

function removeTab(props, index) {
  let tabs = [...props.tabs];
  tabs.splice(index, 1);
  indexedDbService.deleteDataByIndex("tabs", index);
  if (props.default_tab_index === index) {
    if (index !== 0) {
      const newIndex = props.default_tab_index - 1;
      props.set_tabs(tabs, newIndex);
      changeRoute(props, tabs[newIndex], "update endpoint");
    } else {
      if (tabs.length > 0) {
        const newIndex = index;
        props.set_tabs(tabs, newIndex);
        changeRoute(props, tabs[newIndex], "update endpoint");
      } else {
        const newTabId = shortId.generate();
        tabs = [...tabs, { id: newTabId, type: "endpoint", isSaved: false }];
        // indexedDbService.addData("tabs", {
        //   id: newTabId,
        //   type: "endpoint",
        //   isSaved: false,
        // });
        props.set_tabs(tabs, tabs.length - 1);
        props.history.push({
          pathname: `/dashboard/endpoint/new`,
        });
      }
    }
  } else {
    if (index < props.default_tab_index) {
      props.set_tabs(tabs, props.default_tab_index - 1);
    } else props.set_tabs(tabs);
  }
}

function changeRoute(props, tab, title) {
  // if (tab.type === "endpoint") {
  if (tab.isSaved) {
    props.history.push({
      pathname: `/dashboard/${tab.type}/${tab.id}`,
      title,
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

export default {
  newTab,
  removeTab,
  changeRoute,
  closeAllTabs,
  selectTab,
};
