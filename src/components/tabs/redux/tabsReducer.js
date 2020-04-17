import tabsActionTypes from "./tabsActionTypes";

const initialState = {
  tabs: {},
  activeTabId: null,
  tabsOrder: [],
};

function tabsReducer(state = initialState, action) {
  let tabs = {};
  switch (action.type) {
    case tabsActionTypes.ADD_NEW_TAB:
      tabs = {
        ...state,
        tabs: { ...state.tabs, [action.newTab.id]: action.newTab },
        tabsOrder: [...state.tabsOrder, action.newTab.id],
      };

      return tabs;

    case tabsActionTypes.OPEN_IN_NEW_TAB:
      tabs = {
        activeTabId: action.tab.id,
        tabs: { ...state.tabs, [action.tab.id]: action.tab },
        tabsOrder: [...state.tabsOrder, action.tab.id],
      };
      return tabs;

    case tabsActionTypes.CLOSE_TAB:
      tabs = {
        ...state,
      };
      delete tabs.tabs[action.tabId];
      tabs.tabsOrder = tabs.tabsOrder.filter((t) => t != action.tabId);
      console.log(tabs);
      return tabs;

    case tabsActionTypes.UPDATE_TAB:
      tabs = {
        ...state,
      };
      tabs.tabs[action.payload.tabId] = {
        ...tabs.tabs[action.payload.tabId],
        ...action.payload.data,
      };
      return tabs;

    case tabsActionTypes.SET_ACTIVE_TAB_ID:
      tabs = { ...state, activeTabId: action.tabId };
      return tabs;
    default:
      return state;

    case tabsActionTypes.FETCH_TABS_FROM_IDB:
      tabs = {
        ...state,
        tabs: { ...state.tabs, ...action.tabsList },
        tabsOrder: [...state.tabsOrder, ...Object.keys(action.tabsList)],
      };

      return tabs;

    case tabsActionTypes.SET_TABS_ORDER:
      tabs = { ...state, tabsOrder: action.tabsOrder };
      return tabs;
  }
}

export default tabsReducer;
