import tabsActionTypes from './tabsActionTypes'

const initialState = {
  tabs: {},
  activeTabId: null,
  tabsOrder: []
}

function tabsReducer (state = initialState, action) {
  let tabs = {}
  switch (action.type) {
    case tabsActionTypes.ADD_NEW_TAB:
      tabs = {
        ...state,
        tabs: { ...state.tabs, [action.newTab.id]: action.newTab },
        tabsOrder: [...state.tabsOrder, action.newTab.id]
      }

      return tabs

    case tabsActionTypes.OPEN_IN_NEW_TAB:
      tabs = {}
      tabs.tabs = { ...state.tabs, [action.tab.id]: action.tab }
      tabs.tabsOrder = state.tabsOrder.includes(action.tab.id) ? [...state.tabsOrder] : [...state.tabsOrder, action.tab.id]
      return tabs

    case tabsActionTypes.CLOSE_TAB:
      tabs = {
        ...state
      }
      delete tabs.tabs[action.tabId]
      tabs.tabsOrder = tabs.tabsOrder.filter((t) => t !== action.tabId)
      return tabs

    case tabsActionTypes.UPDATE_TAB:
      tabs = {
        ...state
      }
      tabs.tabs[action.payload.tabId] = {
        ...tabs.tabs[action.payload.tabId],
        ...action.payload.data
      }
      return tabs

    case tabsActionTypes.SET_ACTIVE_TAB_ID:
      tabs = { ...state, activeTabId: action.tabId }
      return tabs

    case tabsActionTypes.FETCH_TABS_FROM_IDB:
      tabs = {
        tabs: { ...state.tabs, ...action.tabsList },
        tabsOrder: [...state.tabsOrder],
        activeTabId: action.tabsMetadata.activeTabId
      }
      action.tabsMetadata.tabsOrder.forEach(t => {
        if (!tabs.tabsOrder.includes(t)) {
          tabs.tabsOrder.push(t)
        }
      })
      return tabs

    case tabsActionTypes.REPLACE_TAB: {
      tabs = {
        ...state
      }
      delete tabs.tabs[action.oldTabId]
      tabs.tabs[action.newTab.id] = action.newTab
      const index = tabs.tabsOrder.findIndex((t) => t === action.oldTabId)
      tabs.tabsOrder[index] = action.newTab.id
      return tabs
    }

    case tabsActionTypes.CLOSE_ALL_TABS:
      return initialState

    case tabsActionTypes.SET_TABS_ORDER:
      tabs = { ...state, tabsOrder: action.tabsOrder }
      return tabs

    default:
      return state
  }
}

export default tabsReducer
