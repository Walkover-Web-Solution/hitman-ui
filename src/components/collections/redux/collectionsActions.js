import collectionsApiService from "../collectionsApiService";
import collectionsActionTypes from "./collectionsActionTypes";
import store from "../../../store/store";
import { toast } from "react-toastify";

export const fetchCollections = () => {
  return dispatch => {
    collectionsApiService
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
    collectionsApiService
      .saveCollection(newCollection)
      .then(response => {
        dispatch(onCollectionAdded(response.data));
      })
      .catch(error => {
        dispatch(
          onCollectionAddedError(
            error.response ? error.response.data : error,
            newCollection
          )
        );
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
    dispatch(updateCollectionRequest({ ...editedCollection }));
    const id = editedCollection.id;
    delete editedCollection.id;
    collectionsApiService
      .updateCollection(id, editedCollection)
      .then(() => {
        dispatch(onCollectionUpdated());
      })
      .catch(error => {
        dispatch(
          onCollectionUpdatedError(
            error.response ? error.response.data : error,
            originalCollection
          )
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
    collectionsApiService
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
    collectionsApiService
      .duplicateCollection(collection.id)
      .then(response => {
        dispatch(onCollectionDuplicated(response.data));
      })
      .catch(error => {
        toast.error(error);
      });
  };
};

export const onCollectionDuplicated = response => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED,
    response
  };
};
