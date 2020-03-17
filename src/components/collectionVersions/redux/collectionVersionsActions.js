import collectionVersionsService from "../collectionVersionsService";
import versionActionTypes from "./collectionVersionsActionTypes";
import store from "../../../store/store";
import { toast } from "react-toastify";

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
        dispatch(
          onVersionUpdatedError(
            error.response ? error.response.data : error,
            originalVersion
          )
        );
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
        dispatch(
          onVersionAddedError(
            error.response ? error.response.data : error,
            newVersion
          )
        );
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
        dispatch(onVersionDuplicated(response.data));
      })
      .catch(error => {
        toast.error(error);
      });
  };
};

export const onVersionDuplicated = response => {
  return {
    type: versionActionTypes.ON_VERSION_DUPLICATED,
    response
  };
};
export const importVersion = (importLink, shareIdentifier, collectionId) => {
  return dispatch => {
    collectionVersionsService.exportCollectionVersion(
      importLink,
      shareIdentifier
    ).then((response)=>{
      response.data.collectionId = collectionId;
      collectionVersionsService.importCollectionVersion(
      importLink,
      shareIdentifier,
      response.data
    ).then(response=>{
      // console.log(response)
        dispatch(saveImportedVersion(response.data));
      })})
      .catch(error => {
        dispatch(
          onVersionsFetchedError(
            error.response ? error.response.data : error
          )
        );
      });
  };
};

export const saveImportedVersion = response =>{
  return {
    type: versionActionTypes.IMPORT_VERSION,
    response
  }
}
