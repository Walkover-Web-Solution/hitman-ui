import collectionVersionsService from "./collectionVersionsService";
import versionActionTypes from "./collectionVersionsActionTypes";
import store from "../../store/store";

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
    payload: versions
  };
};

export const fetchVersionsFailure = error => {
  return {
    type: versionActionTypes.FETCH_VERSIONS_FAILURE,
    payload: error
  };
};
export const updateVersion = editedVersion => {
  return dispatch => {
    //   const originalVersion = store.getState().versions.versions[
    //     editedVersion.id
    // ];
    const originalVersion = store.getState().versions[editedVersion.id];
    dispatch(updateVersionRequest(editedVersion));
    const id = editedVersion.id;
    delete editedVersion.id;
    // editedVersion
    collectionVersionsService
      .updateCollectionVersion(id, editedVersion)
      .then(() => {
        dispatch(updateVersionSuccess());
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

export const updateVersionSuccess = () => {
  return {
    type: versionActionTypes.UPDATE_VERSION_SUCCESS
  };
};

export const updateVersionFailure = (error, originalVersion) => {
  return {
    type: versionActionTypes.UPDATE_VERSION_FAILURE,
    error,
    originalVersion
  };
};

export const addVersion = newVersion => {
  return dispatch => {
    dispatch(addVersionRequest(newVersion));
    collectionVersionsService
      .saveCollectionVersion(newVersion.collectionId, newVersion)
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
