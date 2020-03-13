import collectionVersionsService from "./collectionVersionsService";
import versionActionTypes from "./collectionVersionsActionTypes";
import store from "../../store/store";
import groupsActions from "../groups/groupsActions";
import endpointsActions from "../endpoints/endpointsActions";
import pagesActions from "../pages/pagesActions";

export const fetchAllVersions = () => {
  return dispatch => {
    collectionVersionsService
      .getAllCollectionVersions()
      .then(response => {
        const versions = response.data;
        dispatch(onVersionsFetched(versions));
      })
      .catch(error => {
        dispatch(onVersionsFetchedError(error.message));
      });
  };
};
export const fetchVersions = collectionId => {
  return dispatch => {
    collectionVersionsService
      .getCollectionVersions(collectionId)
      .then(response => {
        const versions = response.data;
        dispatch(onVersionsFetched(versions));
      })
      .catch(error => {
        dispatch(onVersionsFetchedError(error.message));
      });
  };
};

export const onVersionsFetched = versions => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED,
    versions
  };
};

export const onVersionsFetchedError = error => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED_ERROR,
    error
  };
};

export const updateVersion = editedVersion => {
  return dispatch => {
    const originalVersion = store.getState().versions[editedVersion.id];
    dispatch(updateVersionRequest(editedVersion));
    const { number, host, id } = editedVersion;
    collectionVersionsService
      .updateCollectionVersion(id, { number, host })
      .then(response => {
        dispatch(onVersionUpdated(response.data));
      })
      .catch(error => {
        dispatch(onVersionUpdatedError(error.response.data, originalVersion));
      });
  };
};

export const updateVersionRequest = editedVersion => {
  return {
    type: versionActionTypes.UPDATE_VERSION_REQUEST,
    editedVersion
  };
};

export const onVersionUpdated = response => {
  return {
    type: versionActionTypes.ON_VERSION_UPDATED,
    response
  };
};

export const onVersionUpdatedError = (error, originalVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_UPDATED_ERROR,
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
        dispatch(onVersionAdded(response.data));
      })
      .catch(error => {
        dispatch(onVersionAddedError(error.response.data, newVersion));
      });
  };
};

export const addVersionRequest = newVersion => {
  return {
    type: versionActionTypes.ADD_VERSION_REQUEST,
    newVersion
  };
};

export const onVersionAdded = response => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED,
    response
  };
};

export const onVersionAddedError = (error, newVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED_ERROR,
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
        dispatch(onVersionDeleted());
      })
      .catch(error => {
        dispatch(onVersionDeletedError(error.response, version));
      });
  };
};

export const deleteVersionRequest = version => {
  return {
    type: versionActionTypes.DELETE_VERSION_REQUEST,
    version
  };
};

export const onVersionDeleted = () => {
  return {
    type: versionActionTypes.ON_VERSION_DELETED
  };
};

export const onVersionDeletedError = (error, version) => {
  return {
    type: versionActionTypes.ON_VERSION_DELETED_ERROR,
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
        dispatch(onVersionDuplicated(response.data));
      })
      .catch(error => {
        dispatch(onVersionDuplicatedError(error.response, version));
      });
  };
};

export const onVersionDuplicated = response => {
  return {
    type: versionActionTypes.ON_VERSION_DUPLICATED,
    response
  };
};

export const onVersionDuplicatedError = (error, version) => {
  return {
    type: versionActionTypes.ON_VERSION_DUPLICATED_ERROR,
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
