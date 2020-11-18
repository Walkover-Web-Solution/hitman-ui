import store from "../../../store/store";
import collectionsApiService from "../collectionsApiService";
import collectionsActionTypes from "./collectionsActionTypes";
import tabService from "../../tabs/tabService";
import openApiService from "../../openApi/openApiService";
import versionActionTypes from "../../collectionVersions/redux/collectionVersionsActionTypes";

export const fetchCollections = () => {
  return (dispatch) => {
    collectionsApiService
      .getCollections()
      .then((response) => {
        dispatch(onCollectionsFetched(response.data));
      })
      .catch((error) => {
        dispatch(
          onCollectionsFetchedError(
            error.response ? error.response.data : error
          )
        );
      });
  };
};

export const onCollectionsFetched = (collections) => {
  return {
    type: collectionsActionTypes.ON_COLLECTIONS_FETCHED,
    collections,
  };
};

export const onCollectionsFetchedError = (error) => {
  return {
    type: collectionsActionTypes.ON_COLLECTIONS_FETCHED_ERROR,
    error,
  };
};

export const fetchCollection = (collectionId) => {
  return (dispatch) => {
    collectionsApiService
      .getCollection(collectionId)
      .then((response) => {
        dispatch(onCollectionsFetched(response.data));
      })
      .catch((error) => {
        dispatch(
          onCollectionsFetchedError(
            error.response ? error.response.data : error
          )
        );
      });
  };
};

export const addCollection = (newCollection) => {
  return (dispatch) => {
    dispatch(addCollectionRequest(newCollection));
    collectionsApiService
      .saveCollection(newCollection)
      .then((response) => {
        dispatch(onCollectionAdded(response.data));
      })
      .catch((error) => {
        dispatch(
          onCollectionAddedError(
            error.response ? error.response.data : error,
            newCollection
          )
        );
      });
  };
};

export const addCollectionRequest = (newCollection) => {
  return {
    type: collectionsActionTypes.ADD_COLLECTION_REQUEST,
    newCollection,
  };
};

export const onCollectionAdded = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_ADDED,
    response,
  };
};

export const onCollectionAddedError = (error, newCollection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_ADDED_ERROR,
    newCollection,
    error,
  };
};

export const updateCollection = (editedCollection) => {
  return (dispatch) => {
    const originalCollection = store.getState().collections[
      editedCollection.id
    ];
    dispatch(updateCollectionRequest({ ...editedCollection }));
    const id = editedCollection.id;
    delete editedCollection.id;
    delete editedCollection.requestId;
    collectionsApiService
      .updateCollection(id, editedCollection)
      .then((response) => {
        dispatch(onCollectionUpdated(response.data));
      })
      .catch((error) => {
        dispatch(
          onCollectionUpdatedError(
            error.response ? error.response.data : error,
            originalCollection
          )
        );
      });
  };
};

export const updateCollectionRequest = (editedCollection) => {
  return {
    type: collectionsActionTypes.UPDATE_COLLECTION_REQUEST,
    editedCollection,
  };
};

export const onCollectionUpdated = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_UPDATED,
    response,
  };
};

export const onCollectionUpdatedError = (error, originalCollection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_UPDATED_ERROR,
    error,
    originalCollection,
  };
};

export const deleteCollection = (collection, props) => {
  return (dispatch) => {
    dispatch(deleteCollectionRequest(collection));
    collectionsApiService
      .deleteCollection(collection.id)
      .then((response) => {
        const storeData = { ...store.getState() };
        const versionIds = Object.keys(storeData.versions).filter(
          (vId) => storeData.versions[vId].collectionId === collection.id
        );
        let groupIds = [];
        let endpointIds = [];
        let pageIds = [];
        versionIds.forEach((vId) => {
          groupIds = [
            ...Object.keys(storeData.groups).filter(
              (gId) => storeData.groups[gId].versionId === vId
            ),
            ...groupIds,
          ];
          pageIds = [
            ...Object.keys(storeData.pages).filter(
              (pId) => storeData.pages[pId].versionId === vId
            ),
            ...pageIds,
          ];
        });

        groupIds.forEach(
          (gId) =>
            (endpointIds = [
              ...Object.keys(storeData.endpoints).filter(
                (eId) => storeData.endpoints[eId].groupId === gId
              ),
              ...endpointIds,
            ])
        );

        endpointIds.map((eId) => tabService.removeTab(eId, props));
        pageIds.map((pId) => tabService.removeTab(pId, props));

        dispatch(
          onCollectionDeleted({
            collection: response.data,
            versionIds,
            groupIds,
            endpointIds,
            pageIds,
          })
        );
      })
      .catch((error) => {
        dispatch(onCollectionDeletedError(error.response, collection));
      });
  };
};

export const deleteCollectionRequest = (collection) => {
  return {
    type: collectionsActionTypes.DELETE_COLLECTION_REQUEST,
    collection,
  };
};

export const onCollectionDeleted = (payload) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DELETED,
    payload,
  };
};

export const onCollectionDeletedError = (error, collection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DELETED_ERROR,
    error,
    collection,
  };
};

export const duplicateCollection = (collection) => {
  return (dispatch) => {
    collectionsApiService
      .duplicateCollection(collection.id)
      .then((response) => {
        dispatch(onCollectionDuplicated(response.data));
      })
      .catch((error) => {
        dispatch(
          onCollectionDuplicatedError(
            error.response ? error.response.data : error
          )
        );
      });
  };
};

export const onCollectionDuplicated = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED,
    response,
  };
};

export const onCollectionDuplicatedError = (error) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED_ERROR,
    error,
  };
};

export const addCustomDomain = (
  collectionId,
  domain,
  dnsTarget,
  title,
  logoUrl
) => {
  return (dispatch) => {
    let collection = { ...store.getState().collections[collectionId] };
    if (!collection.docProperties.domainsList) {
      collection.docProperties.domainsList = [];
    }
    collection.docProperties.domainsList.push({
      domain,
      dnsTarget,
      title,
      logoUrl,
    });
    dispatch(updateCollectionRequest({ ...collection }));

    const id = collection.id;
    delete collection.id;
    delete collection.teamId;
    collectionsApiService
      .updateCollection(id, collection)
      .then((response) => {
        dispatch(onCollectionUpdated(response.data));
      })
      .catch((error) => {
        dispatch(
          onCollectionUpdatedError(
            error.response ? error.response.data : error,
            collection
          )
        );
      });
  };
};

export const importApi = (openApiObject) => {
  return (dispatch) => {
    openApiService
      .importApi(openApiObject)
      .then((response) => {
        // dispatch(saveImportedCollection(response.data));
        dispatch(saveImportedVersion(response.data));
      })
      .catch((error) => {
        dispatch(
          onVersionsFetchedError(error.response ? error.response.data : error)
        );
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

export const onVersionsFetchedError = (error) => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED_ERROR,
    error,
  };
};
