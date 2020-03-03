import versionActionTypes from "./collectionVersionsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  versions: {}
};

function versionsReducer(state = initialState, action) {
  let versions = {};
  // let versions = {};
  switch (action.type) {
    case versionActionTypes.FETCH_VERSIONS_SUCCESS:
      return {
        versions: { ...action.versions }
      };
    case versionActionTypes.FETCH_VERSIONS_FAILURE:
      toast.error(action.error);
      return state;

    case versionActionTypes.UPDATE_VERSION_REQUEST:
      return {
        versions: {
          ...state.versions,
          [action.editedVersion.id]: action.editedVersion
        }
      };

    case versionActionTypes.UPDATE_VERSION_SUCCESS:
      return state;

    case versionActionTypes.UPDATE_VERSION_FAILURE:
      toast.error(action.error);
      return {
        versions: {
          ...state.versions,
          [action.originalVersion.id]: action.originalVersion
        }
      };
    case versionActionTypes.ADD_VERSION_REQUEST:
      return {
        versions: {
          ...state.versions,
          [action.newVersion.requestId]: action.newVersion
        }
      };

    case versionActionTypes.ADD_VERSION_SUCCESS:
      versions = { ...state.versions };
      delete versions[action.response.requestId];
      versions[action.response.id] = action.response;
      return {
        versions
      };

    case versionActionTypes.ADD_VERSION_FAILURE:
      toast.error(action.error);
      versions = { ...state.versions };
      delete versions[action.newVersion.requestId];
      return {
        versions
      };
    default:
      return state;
  }
}

export default versionsReducer;
