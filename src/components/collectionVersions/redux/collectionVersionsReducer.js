import versionActionTypes from "./collectionVersionsActionTypes";
import collectionsActionTypes from "../../collections/redux/collectionsActionTypes";
import { toast } from "react-toastify";
import collectionActionTypes from "../../collections/redux/collectionsActionTypes";

const initialState = {};

function versionsReducer(state = initialState, action) {
  let versions = {};

  switch (action.type) {
    case collectionsActionTypes.ON_COLLECTION_ADDED:
      return {
        ...state,
        [action.response.version.id]: action.response.version
      };

    case versionActionTypes.ON_VERSIONS_FETCHED:
      return { ...state, ...action.versions };

    case versionActionTypes.ON_VERSIONS_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case versionActionTypes.UPDATE_VERSION_REQUEST:
      return {
        ...state,
        [action.editedVersion.id]: action.editedVersion
      };

    case versionActionTypes.ON_VERSION_UPDATED:
      return {
        ...state,
        [action.response.id]: action.response
      };

    case versionActionTypes.ON_VERSION_UPDATED_ERROR:
      toast.error(action.error);
      return {
        ...state,
        [action.originalVersion.id]: action.originalVersion
      };
    case versionActionTypes.ADD_VERSION_REQUEST:
      return {
        ...state,
        [action.newVersion.requestId]: action.newVersion
      };

    case versionActionTypes.ON_VERSION_ADDED:
      versions = { ...state };
      delete versions[action.response.requestId];
      delete action.response.requestId;
      versions[action.response.id] = action.response;
      return versions;

    case versionActionTypes.ON_VERSION_ADDED_ERROR:
      toast.error(action.error);
      versions = { ...state };
      delete versions[action.newVersion.requestId];
      return versions;

    case versionActionTypes.DELETE_VERSION_REQUEST:
      versions = { ...state };
      delete versions[action.version.id];
      return versions;

    case versionActionTypes.ON_VERSION_DELETED:
      return state;

    case versionActionTypes.ON_VERSION_DELETED_ERROR:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.version.id]: action.version
      };
    case versionActionTypes.ON_VERSION_DUPLICATED:
      versions = { ...state };
      const version = action.response.version;
      versions = { ...versions, [version.id]: version };
      return versions;

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.versions };

    default:
      return state;
  }
}

export default versionsReducer;
