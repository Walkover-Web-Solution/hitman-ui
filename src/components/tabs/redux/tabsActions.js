import tabsActionTypes from "./tabsActionTypes";
import store from "../../../store/store";
import { toast } from "react-toastify";
import shortid from "shortid";
import tabStatusTypes from "../tabStatusTypes";

export const addNewTab = (history) => {
  const id = shortid.generate();

  return (dispatch) => {
    dispatch(setActiveTabId(id));
    dispatch({
      type: tabsActionTypes.ADD_NEW_TAB,
      newTab: {
        id,
        type: "endpoint",
        status: tabStatusTypes.NEW,
        previewMode: false,
      },
    });
    history.push({ pathname: `/dashboard/endpoint/new` });
  };
};

export const closeTab = (tabId, history) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_TAB, tabId });
  };
};

export const openInNewTab = (tab) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.OPEN_IN_NEW_TAB, tab });
  };
};

export const updateTab = (tabId, data) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.UPDATE_TAB, payload: { tabId, data } });
  };
};

export const setActiveTabId = (tabId) => {
  return {
    type: tabsActionTypes.SET_ACTIVE_TAB_ID,
    tabId,
  };
};

// export default {
//   addNewTab,
//   closeTab,
//   openInNewTab,
//   updateTab,
//   setActiveTabId,
// };
