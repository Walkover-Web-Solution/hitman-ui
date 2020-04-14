import collectionVersionsApiService from "../collectionVersionsApiService";
import versionActionTypes from "./collectionVersionsActionTypes";
import store from "../../../store/store";
import { toast } from "react-toastify";

export const fetchAllVersions = () => {
  return (dispatch) => {
    collectionVersionsApiService
      .getAllCollectionVersions()
      .then((response) => {
        const versions = response.data;
        dispatch(onVersionsFetched(versions));
      })
      .catch((error) => {
        dispatch(onVersionsFetchedError(error.message));
      });
  };
};
export const fetchVersions = (collectionId) => {
  return (dispatch) => {
    collectionVersionsApiService
      .getCollectionVersions(collectionId)
      .then((response) => {
        const versions = response.data;
        dispatch(onVersionsFetched(versions));
      })
      .catch((error) => {
        dispatch(onVersionsFetchedError(error.message));
      });
  };
};

export const onVersionsFetched = (versions) => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED,
    versions,
  };
};

export const onVersionsFetchedError = (error) => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED_ERROR,
    error,
  };
};

export const updateVersion = (editedVersion) => {
  return (dispatch) => {
    const originalVersion = store.getState().versions[editedVersion.id];
    dispatch(updateVersionRequest(editedVersion));
    const { number, host, id } = editedVersion;
    collectionVersionsApiService
      .updateCollectionVersion(id, { number, host })
      .then((response) => {
        dispatch(onVersionUpdated(response.data));
      })
      .catch((error) => {
        dispatch(
          onVersionUpdatedError(
            error.response ? error.response.data : error,
            originalVersion
          )
        );
      });
  };
};

export const updateVersionRequest = (editedVersion) => {
  return {
    type: versionActionTypes.UPDATE_VERSION_REQUEST,
    editedVersion,
  };
};

export const onVersionUpdated = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_UPDATED,
    response,
  };
};

export const onVersionUpdatedError = (error, originalVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_UPDATED_ERROR,
    error,
    originalVersion,
  };
};

export const addVersion = (newVersion, collectionId) => {
  return (dispatch) => {
    dispatch(addVersionRequest(newVersion));
    collectionVersionsApiService
      .saveCollectionVersion(collectionId, newVersion)
      .then((response) => {
        dispatch(onVersionAdded(response.data));
      })
      .catch((error) => {
        dispatch(
          onVersionAddedError(
            error.response ? error.response.data : error,
            newVersion
          )
        );
      });
  };
};

export const addVersionRequest = (newVersion) => {
  return {
    type: versionActionTypes.ADD_VERSION_REQUEST,
    newVersion,
  };
};

export const onVersionAdded = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED,
    response,
  };
};

export const onVersionAddedError = (error, newVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED_ERROR,
    newVersion,
    error,
  };
};

export const deleteVersion = (version) => {
  return (dispatch) => {
    dispatch(deleteVersionRequest(version.id));
    collectionVersionsApiService
      .deleteCollectionVersion(version.id)
      .then(() => {
        const storeData = { ...store.getState() };
        let groupIds = Object.keys(storeData.groups).filter(
          (gId) => storeData.groups[gId].versionId === version.id
        );
        const pageIds = [
          ...Object.keys(storeData.pages).filter(
            (pId) => storeData.pages[pId].versionId === version.id
          ),
        ];
        let endpointIds = [];

        groupIds.map(
          (gId) =>
            (endpointIds = [
              ...Object.keys(storeData.endpoints).filter(
                (eId) => storeData.endpoints[eId].groupId === gId
              ),
              ...endpointIds,
            ])
        );

        dispatch(onVersionDeleted({ groupIds, endpointIds, pageIds }));
      })
      .catch((error) => {
        console.log(error);
        // dispatch(onVersionDeletedError(error.response, version));
      });
  };
};

export const deleteVersionRequest = (versionId) => {
  return {
    type: versionActionTypes.DELETE_VERSION_REQUEST,
    versionId,
  };
};

export const onVersionDeleted = (payload) => {
  return {
    type: versionActionTypes.ON_VERSION_DELETED,
    payload,
  };
};

export const onVersionDeletedError = (error, version) => {
  return {
    type: versionActionTypes.ON_VERSION_DELETED_ERROR,
    error,
    version,
  };
};

export const duplicateVersion = (version) => {
  return (dispatch) => {
    collectionVersionsApiService
      .duplicateVersion(version.id)
      .then((response) => {
        dispatch(onVersionDuplicated(response.data));
      })
      .catch((error) => {
        toast.error(error);
      });
  };
};

export const onVersionDuplicated = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_DUPLICATED,
    response,
  };
};
export const importVersion = (importLink, shareIdentifier, collectionId) => {
  return (dispatch) => {
    collectionVersionsApiService
      .exportCollectionVersion(importLink, shareIdentifier)
      .then((response) => {
        response.data.collectionId = collectionId;
        collectionVersionsApiService
          .importCollectionVersion(importLink, shareIdentifier, response.data)
          .then((response) => {
            dispatch(saveImportedVersion(response.data));
          });
      })
      .catch((error) => {
        dispatch(
          onVersionsFetchedError(error.response ? error.response.data : error)
        );
      });
  };
};

export const saveImportedVersion = (response) => {
  return {
    type: versionActionTypes.IMPORT_VERSION,
    response,
  };
};
