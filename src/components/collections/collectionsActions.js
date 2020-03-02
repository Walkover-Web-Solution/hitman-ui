import collectionsService from "./collectionsService";

export const fetchCollections = () => {
  return dispatch => {
    console.log("fetchCollections");
    dispatch(fetchCollectionsRequest());
    collectionsService
      .getCollections()
      .then(response => {
        const collections = response.data;
        dispatch(fetchCollectionsSuccess(collections));
      })
      .catch(error => {
        dispatch(fetchCollectionsFailure(error.message));
      });
  };
};

export const fetchCollectionsRequest = () => {
  return {
    type: "FETCH_COLLECTIONS_REQUEST"
  };
};

export const fetchCollectionsSuccess = collections => {
  return {
    type: "FETCH_COLLECTIONS_SUCCESS",
    payload: collections
  };
};

export const fetchCollectionsFailure = error => {
  return {
    type: "FETCH_COLLECTIONS_FAILURE",
    payload: error
  };
};

export const addCollection = collection => {
  return dispatch => {
    dispatch(addCollectionRequest());
    collectionsService
      .saveCollection(collection)
      .then(response => {
        const collection = response.data;
        dispatch(addCollectionSuccess(collection));
      })
      .catch(error => {
        dispatch(addCollectionFailure(error.message));
      });
  };
};

export const addCollectionRequest = () => {
  return {
    type: " ADD_COLLECTION_REQUEST"
  };
};

export const addCollectionSuccess = collection => {
  return {
    type: "ADD_COLLECTION_SUCCESS",
    payload: collection
  };
};

export const addCollectionFailure = error => {
  return {
    type: "ADD_COLLECTION_FAILURE",
    payload: error
  };
};

export const updateCollection = editedCollection => {
  return dispatch => {
    const { id, name, website, description, keyword } = editedCollection;
    const data = { name, website, description, keyword };
    dispatch(updateCollectionRequest());
    collectionsService
      .updateCollection(id, data)
      .then(response => {
        const collection = response.data;
        dispatch(updateCollectionSuccess(collection));
      })
      .catch(error => {
        dispatch(updateCollectionFailure(error.message));
      });
  };
};

export const updateCollectionRequest = () => {
  return {
    type: " UPDATE_COLLECTION_REQUEST"
  };
};

export const updateCollectionSuccess = collection => {
  return {
    type: "UPDATE_COLLECTION_SUCCESS",
    payload: collection
  };
};

export const updateCollectionFailure = error => {
  return {
    type: "UPDATE_COLLECTION_FAILURE",
    payload: error
  };
};

// export function updateCollectionAction(editedCollection) {
//   return { type: "EDIT_COLLECTION", editedCollection };
// }
