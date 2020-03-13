import versionActionTypes from "./collectionVersionsActionTypes";
import { toast } from "react-toastify";

const initialState = {};

function versionsReducer(state = initialState, action) {
  let versions = {};

  switch (action.type) {
    case versionActionTypes.FETCH_VERSIONS_SUCCESS:
      return { ...action.versions };

    case versionActionTypes.FETCH_VERSIONS_FAILURE:
      toast.error(action.error);
      return state;

    case versionActionTypes.UPDATE_VERSION_REQUEST:
      return {
        ...state,
        [action.editedVersion.id]: action.editedVersion
      };

    case versionActionTypes.UPDATE_VERSION_SUCCESS:
      return {
        ...state,
        [action.response.id]: action.response
      };

    case versionActionTypes.UPDATE_VERSION_FAILURE:
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

    case versionActionTypes.ADD_VERSION_SUCCESS:
      versions = { ...state };
      delete versions[action.response.requestId];
      delete action.response.requestId;
      versions[action.response.id] = action.response;
      return versions;

    case versionActionTypes.ADD_VERSION_FAILURE:
      toast.error(action.error);
      versions = { ...state };
      delete versions[action.newVersion.requestId];
      return versions;

    case versionActionTypes.DELETE_VERSION_REQUEST:
      versions = { ...state };
      delete versions[action.version.id];
      return versions;

    case versionActionTypes.DELETE_VERSION_SUCCESS:
      return state;

    case versionActionTypes.DELETE_VERSION_FAILURE:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.version.id]: action.version
      };
    case versionActionTypes.DUPLICATE_VERSION_SUCCESS:
      versions = { ...state };
      const version = action.response.version;
      versions = { ...versions, [version.id]: version };
      return versions;

    case versionActionTypes.DUPLICATE_VERSION_FAILURE:
      toast.error(action.error);
      return state;

    case versionActionTypes.UPDATE_STATE_SUCCESS:
      versions = { ...state };
      const newVersions = { ...action.versions };
      const newVersionIds = Object.keys(newVersions);
      for (let i = 0; i < newVersionIds.length; i++) {
        versions = {
          ...versions,
          [newVersionIds[i]]: newVersions[newVersionIds[i]]
        };
      }
      return versions;

    case versionActionTypes.UPDATE_STATE_FAILURE:
      toast.error(action.error);
      versions = { ...state };
      return versions;

    default:
      return state;
  }
}

export default versionsReducer;
