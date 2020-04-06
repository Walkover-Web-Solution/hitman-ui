import React, { Component } from "react";
import shortId from "shortid";

function addNewTab(props) {
  let tabs = [...props.tabs];
  const id = shortId.generate();
  props.set_tabs(
    [...tabs, { id, type: "endpoint", isSaved: false }],
    tabs.length
  );
  props.history.push({ pathname: `/dashboard/endpoint/new/${id}` });
}

function closeTab(props, index) {
  let tabs = [...props.tabs];
  tabs.splice(index, 1);
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

        props.set_tabs(tabs, tabs.length - 1);
        props.history.push({
          pathname: `/dashboard/endpoint/new/${newTabId}`,
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
  props.history.push({ pathname: `/dashboard/endpoint/new/${id}` });
}

function selectTab(props, tab, index) {
  {
    props.set_tabs(null, index);
    if (tab.isSaved) {
      props.history.push({
        pathname: `/dashboard/${tab.type}/${tab.id}`,
      });
    } else {
      props.history.push({
        pathname: `/dashboard/${tab.type}/new/${tab.id}`,
      });
    }
  }
}

export default {
  addNewTab,
  closeTab,
  changeRoute,
  closeAllTabs,
  selectTab,
};
