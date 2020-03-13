import collectionsService from "../collections/collectionsService";
import collectionsActionTypes from "./collectionsActionTypes";
import store from "../../store/store";
import { fetchVersions } from "../collectionVersions/collectionVersionsActions";
import groupsActions from "../groups/groupsActions";
import endpointsActions from "../endpoints/endpointsActions";
import pagesActions from "../pages/pagesActions";
import versionsActions from "../collectionVersions/collectionVersionsActions";

export const fetchCollections = () => {
  return dispatch => {
    collectionsService
      .getCollections()
      .then(response => {
        dispatch(onCollectionsFetched(response.data));
      })
      .catch(error => {
        dispatch(
          onCollectionsFetchedError(
            error.response ? error.response.data : error
          )
        );
      });
  };
};

export const onCollectionsFetched = collections => {
  return {
    type: collectionsActionTypes.ON_COLLECTIONS_FETCHED,
    collections
  };
};

export const onCollectionsFetchedError = error => {
  return {
    type: collectionsActionTypes.ON_COLLECTIONS_FETCHED_ERROR,
    error
  };
};

export const addCollection = newCollection => {
  return dispatch => {
    dispatch(addCollectionRequest(newCollection));
    collectionsService
      .saveCollection(newCollection)
      .then(response => {
        dispatch(onCollectionAdded(response.data));
        dispatch(fetchVersions(response.data.id));
      })
      .catch(error => {
        dispatch(onCollectionAddedError(error.response.data, newCollection));
      });
  };
};

export const addCollectionRequest = newCollection => {
  return {
    type: collectionsActionTypes.ADD_COLLECTION_REQUEST,
    newCollection
  };
};

export const onCollectionAdded = response => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_ADDED,
    response
  };
};

export const onCollectionAddedError = (error, newCollection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_ADDED_ERROR,
    newCollection,
    error
  };
};

export const updateCollection = editedCollection => {
  return dispatch => {
    const originalCollection = store.getState().collections[
      editedCollection.id
    ];
    dispatch(updateCollectionRequest(editedCollection));
    const id = editedCollection.id;
    delete editedCollection.id;
    collectionsService
      .updateCollection(id, editedCollection)
      .then(() => {
        dispatch(onCollectionUpdated());
      })
      .catch(error => {
        dispatch(
          onCollectionUpdatedError(error.response.data, originalCollection)
        );
      });
  };
};

export const updateCollectionRequest = editedCollection => {
  return {
    type: collectionsActionTypes.UPDATE_COLLECTION_REQUEST,
    editedCollection
  };
};

export const onCollectionUpdated = () => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_UPDATED
  };
};

export const onCollectionUpdatedError = (error, originalCollection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_UPDATED_ERROR,
    error,
    originalCollection
  };
};

export const deleteCollection = collection => {
  return dispatch => {
    dispatch(deleteCollectionRequest(collection));
    collectionsService
      .deleteCollection(collection.id)
      .then(() => {
        dispatch(onCollectionDeleted());
      })
      .catch(error => {
        dispatch(onCollectionDeletedError(error.response, collection));
      });
  };
};

export const deleteCollectionRequest = collection => {
  return {
    type: collectionsActionTypes.DELETE_COLLECTION_REQUEST,
    collection
  };
};

export const onCollectionDeleted = () => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DELETED
  };
};

export const onCollectionDeletedError = (error, collection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DELETED_ERROR,
    error,
    collection
  };
};

export const duplicateCollection = collection => {
  return dispatch => {
    collectionsService
      .duplicateCollection(collection.id)
      .then(response => {
        const endpoints = response.data.endpoints;
        const pages = response.data.pages;
        const groups = response.data.groups;
        const versions = response.data.versions;
        dispatch(versionsActions.updateState(versions));
        dispatch(groupsActions.updateState(groups));
        dispatch(endpointsActions.updateState(endpoints));
        dispatch(pagesActions.updateState(pages));
        dispatch(onCollectionDuplicated(response.data));
      })
      .catch(error => {
        dispatch(onCollectionDuplicatedError(error.response, collection));
      });
  };
};

export const onCollectionDuplicated = response => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED,
    response
  };
};

export const onCollectionDuplicatedError = (error, collection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED_ERROR,
    error,
    collection
  };
};
