import pagesActionTypes from "./pagesActionTypes";
import { toast } from "react-toastify";
import groupsActionTypes from "../groups/groupsActionTypes";
import versionActionTypes from "../collectionVersions/collectionVersionsActionTypes";
import collectionActionTypes from "../collections/collectionsActionTypes";

const initialState = {};

function pagesReducer(state = initialState, action) {
  let pages = {};

  switch (action.type) {
    case pagesActionTypes.ON_PAGES_FETCHED:
      return { ...action.pages };

    case pagesActionTypes.ON_PAGES_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case pagesActionTypes.ADD_PAGE_REQUEST:
      action.newPage.groupId = null;
      action.newPage.versionId = action.versionId;
      return {
        ...state,
        [action.newPage.requestId]: action.newPage
      };
    case pagesActionTypes.ON_PAGE_ADDED:
      pages = { ...state };
      delete pages[action.response.requestId];
      delete action.response.requestId;
      pages[action.response.id] = action.response;
      return pages;

    case pagesActionTypes.ON_PAGE_ADDED_ERROR:
      toast.error(action.error);
      pages = { ...state };
      delete pages[action.newPage.requestId];
      return pages;

    case pagesActionTypes.ADD_GROUP_PAGE_REQUEST:
      action.newPage.groupId = action.groupId;
      action.newPage.versionId = action.versionId;

      return {
        ...state,
        [action.newPage.requestId]: action.newPage
      };
    case pagesActionTypes.ON_GROUP_PAGE_ADDED:
      pages = { ...state };
      delete pages[action.response.requestId];
      delete action.response.requestId;
      pages[action.response.id] = action.response;
      return pages;

    case pagesActionTypes.ON_GROUP_PAGE_ADDED_ERROR:
      toast.error(action.error);
      pages = { ...state };
      delete pages[action.newPage.requestId];
      return pages;

    case pagesActionTypes.UPDATE_PAGE_REQUEST:
      return {
        ...state,
        [action.editedPage.id]: action.editedPage
      };
    case pagesActionTypes.ON_PAGE_UPDATED:
      return state;

    case pagesActionTypes.ON_PAGE_UPDATED_ERROR:
      toast.error(action.error);
      return {
        ...state,
        [action.originalPage.id]: action.originalPage
      };

    case pagesActionTypes.DELETE_PAGE_REQUEST:
      pages = { ...state };
      delete pages[action.page.id];
      return pages;

    case pagesActionTypes.ON_PAGE_DELETED:
      return state;

    case pagesActionTypes.ON_PAGE_DELETED_ERROR:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.page.id]: action.page
      };

    case pagesActionTypes.ON_PAGE_DUPLICATED:
      pages = { ...state };
      pages[action.response.id] = action.response;
      return pages;

    case groupsActionTypes.ON_GROUP_DUPLICATED:
      return { ...state, ...action.response.pages };

    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.pages };

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.pages };

    default:
      return state;
  }
}

export default pagesReducer;

export const selectPageOfId = (state, id) => state[id];
