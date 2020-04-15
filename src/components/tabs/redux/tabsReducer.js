import tabsActionTypes from "./tabsActionTypes";

const initialState = {
  tabs: {},
  activeTabId: null,
};

function tabsReducer(state = initialState, action) {
  let tabs = {};
  switch (action.type) {
    case tabsActionTypes.ADD_NEW_TAB:
      tabs = {
        ...state,
        tabs: { ...state.tabs, [action.newTab.id]: action.newTab },
      };
      return tabs;

    case tabsActionTypes.OPEN_IN_NEW_TAB:
      tabs = {
        activeTabId: action.tab.id,
        tabs: { ...state.tabs, [action.tab.id]: action.tab },
      };
      return tabs;

    case tabsActionTypes.CLOSE_TAB:
      tabs = {
        ...state,
      };
      delete tabs.tabs[action.tabId];
      return tabs;

    case tabsActionTypes.SET_ACTIVE_TAB_ID:
      tabs = { ...state, activeTabId: action.tabId };
      return tabs;
    default:
      return state;
  }
}

export default tabsReducer;
