import collectionVersionsService from "./collectionVersionsService";
import versionActionTypes from "./collectionVersionsActionTypes";
import store from "../../store/store";
import groupsActions from "../groups/groupsActions";
import endpointsActions from "../endpoints/endpointsActions";
import pagesActions from "../pages/pagesActions";

export const fetchVersions = () => {
  return dispatch => {
    collectionVersionsService
      .getAllCollectionVersions()
      .then(response => {
        const versions = response.data;
        dispatch(fetchVersionsSuccess(versions));
      })
      .catch(error => {
        dispatch(fetchVersionsFailure(error.message));
      });
  };
};

export const fetchVersionsSuccess = versions => {
  return {
    type: versionActionTypes.FETCH_VERSIONS_SUCCESS,
    versions
  };
};

export const fetchVersionsFailure = error => {
  return {
    type: versionActionTypes.FETCH_VERSIONS_FAILURE,
    error
  };
};
export const updateVersion = editedVersion => {
  return dispatch => {
    const originalVersion = store.getState().versions[editedVersion.id];
    dispatch(updateVersionRequest(editedVersion));
    const id = editedVersion.id;
    delete editedVersion.id;
    delete editedVersion.collectionId;
    collectionVersionsService
      .updateCollectionVersion(id, editedVersion)
      .then(response => {
        dispatch(updateVersionSuccess(response.data));
      })
      .catch(error => {
        dispatch(updateVersionFailure(error.response.data, originalVersion));
      });
  };
};

export const updateVersionRequest = editedVersion => {
  return {
    type: versionActionTypes.UPDATE_VERSION_REQUEST,
    editedVersion
  };
};

export const updateVersionSuccess = response => {
  return {
    type: versionActionTypes.UPDATE_VERSION_SUCCESS,
    response
  };
};

export const updateVersionFailure = (error, originalVersion) => {
  return {
    type: versionActionTypes.UPDATE_VERSION_FAILURE,
    error,
    originalVersion
  };
};

export const addVersion = (newVersion, collectionId) => {
  return dispatch => {
    dispatch(addVersionRequest(newVersion));
    collectionVersionsService
      .saveCollectionVersion(collectionId, newVersion)
      .then(response => {
        dispatch(addVersionSuccess(response.data));
      })
      .catch(error => {
        dispatch(addVersionFailure(error.response.data, newVersion));
      });
  };
};

export const addVersionRequest = newVersion => {
  return {
    type: versionActionTypes.ADD_VERSION_REQUEST,
    newVersion
  };
};

export const addVersionSuccess = response => {
  return {
    type: versionActionTypes.ADD_VERSION_SUCCESS,
    response
  };
};

export const addVersionFailure = (error, newVersion) => {
  return {
    type: versionActionTypes.ADD_VERSION_FAILURE,
    newVersion,
    error
  };
};

export const deleteVersion = version => {
  return dispatch => {
    dispatch(deleteVersionRequest(version));
    collectionVersionsService
      .deleteCollectionVersion(version.id)
      .then(() => {
        dispatch(deleteVersionSuccess());
      })
      .catch(error => {
        dispatch(deleteVersionFailure(error.response, version));
      });
  };
};

export const deleteVersionRequest = version => {
  return {
    type: versionActionTypes.DELETE_VERSION_REQUEST,
    version
  };
};

export const deleteVersionSuccess = () => {
  return {
    type: versionActionTypes.DELETE_VERSION_SUCCESS
  };
};

export const deleteVersionFailure = (error, version) => {
  return {
    type: versionActionTypes.DELETE_VERSION_FAILURE,
    error,
    version
  };
};

export const duplicateVersion = version => {
  return dispatch => {
    collectionVersionsService
      .duplicateVersion(version.id)
      .then(response => {
        const endpoints = response.data.endpoints;
        const pages = response.data.pages;
        const groups = response.data.groups;
        dispatch(groupsActions.updateState(groups));
        dispatch(endpointsActions.updateState(endpoints));
        dispatch(pagesActions.updateState(pages));
        dispatch(duplicateVersionSuccess(response.data));
      })
      .catch(error => {
        dispatch(duplicateVersionFailure(error.response, version));
      });
  };
};

export const duplicateVersionSuccess = response => {
  return {
    type: versionActionTypes.DUPLICATE_VERSION_SUCCESS,
    response
  };
};

export const duplicateVersionFailure = (error, version) => {
  return {
    type: versionActionTypes.DUPLICATE_VERSION_FAILURE,
    error,
    version
  };
};

export const updateState = versions => {
  return dispatch => {
    try {
      dispatch(updateStateSuccess(versions));
    } catch (error) {
      dispatch(updateStateFailure(error));
    }
  };
};

export const updateStateSuccess = versions => {
  return {
    type: versionActionTypes.UPDATE_STATE_SUCCESS,
    versions
  };
};

export const updateStateFailure = error => {
  return {
    type: versionActionTypes.UPDATE_STATE_FAILURE,
    error
  };
};

export default {
  updateState
};
