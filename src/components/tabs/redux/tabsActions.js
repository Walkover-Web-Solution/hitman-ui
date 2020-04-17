import tabsActionTypes from "./tabsActionTypes";
import store from "../../../store/store";
import { toast } from "react-toastify";
import shortid from "shortid";
import tabStatusTypes from "../tabStatusTypes";
import indexedDbService from "../../indexedDb/indexedDbService";

export const fetchTabsFromIdb = () => {
  return async (dispatch) => {
    indexedDbService
      .getAllData("tabs")
      .then((data) =>
        dispatch({ type: tabsActionTypes.FETCH_TABS_FROM_IDB, tabsList: data })
      );

    // .getCollections())

    // .then((response) => {
    //   dispatch(onCollectionsFetched(response.data));
    // })
    // .catch((error) => {
    //   dispatch(
    //     onCollectionsFetchedError(
    //       error.response ? error.response.data : error
    //     )
    //   );
    // });
  };
};

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
    indexedDbService.addData("tabs", {
      id,
      type: "endpoint",
      status: tabStatusTypes.NEW,
      previewMode: false,
    });
  };
};

export const closeTab = (tabId, history) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.CLOSE_TAB, tabId });
    indexedDbService.deleteData("tabs", tabId);
  };
};

export const openInNewTab = (tab) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.OPEN_IN_NEW_TAB, tab });
    indexedDbService.addData("tabs", tab);
  };
};

export const updateTab = (tabId, data) => {
  return (dispatch) => {
    dispatch({ type: tabsActionTypes.UPDATE_TAB, payload: { tabId, data } });
    const tab = { ...store.getState().tabs.tabs[tabId], ...data };
    indexedDbService.updateData("tabs", tab);
  };
};

export const setActiveTabId = (tabId) => {
  return {
    type: tabsActionTypes.SET_ACTIVE_TAB_ID,
    tabId,
  };
};

export const setTabsOrder = (tabsOrder) => {
  return {
    type: tabsActionTypes.SET_TABS_ORDER,
    tabsOrder,
  };
};

// export default {
//   addNewTab,
//   closeTab,
//   openInNewTab,
//   updateTab,
//   setActiveTabId,
// };
