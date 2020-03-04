import endpointService from "../endpoints/endpointService";
import endpointsActionTypes from "./endpointsActionTypes";
import store from "../../store/store";

export const fetchEndpoints = () => {
  console.log("called");
  return dispatch => {
    endpointService
      .getAllEndpoints()
      .then(response => {
        dispatch(fetchEndpointsSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchEndpointsFailure(error.response.data));
      });
  };
};

export const fetchEndpointsSuccess = endpoints => {
  return {
    type: endpointsActionTypes.FETCH_ENDPOINTS_SUCCESS,
    endpoints
  };
};

export const fetchEndpointsFailure = error => {
  return {
    type: endpointsActionTypes.FETCH_ENDPOINTS_FAILURE,
    error
  };
};

// export const addCollection = newCollection => {
//   return dispatch => {
//     dispatch(addCollectionRequest(newCollection));
//     collectionsService
//       .saveCollection(newCollection)
//       .then(response => {
//         dispatch(addCollectionSuccess(response.data, newCollection));
//       })
//       .catch(error => {
//         dispatch(addCollectionFailure(error.response.data, newCollection));
//       });
//   };
// };

// export const addCollectionRequest = newCollection => {
//   return {
//     type: collectionsActionTypes.ADD_COLLECTION_REQUEST,
//     newCollection
//   };
// };

// export const addCollectionSuccess = response => {
//   return {
//     type: collectionsActionTypes.ADD_COLLECTION_SUCCESS,
//     response
//   };
// };

// export const addCollectionFailure = (error, newCollection) => {
//   return {
//     type: collectionsActionTypes.ADD_COLLECTION_FAILURE,
//     newCollection,
//     error
//   };
// };

// export const updateCollection = editedCollection => {
//   return dispatch => {
//     const originalCollection = store.getState().collections[
//       editedCollection.id
//     ];
//     dispatch(updateCollectionRequest(editedCollection));
//     const id = editedCollection.id;
//     delete editedCollection.id;
//     collectionsService
//       .updateCollection(id, editedCollection)
//       .then(() => {
//         dispatch(updateCollectionSuccess());
//       })
//       .catch(error => {
//         dispatch(
//           updateCollectionFailure(error.response.data, originalCollection)
//         );
//       });
//   };
// };

// export const updateCollectionRequest = editedCollection => {
//   return {
//     type: collectionsActionTypes.UPDATE_COLLECTION_REQUEST,
//     editedCollection
//   };
// };

// export const updateCollectionSuccess = () => {
//   return {
//     type: collectionsActionTypes.UPDATE_COLLECTION_SUCCESS
//   };
// };

// export const updateCollectionFailure = (error, originalCollection) => {
//   return {
//     type: collectionsActionTypes.UPDATE_COLLECTION_FAILURE,
//     error,
//     originalCollection
//   };
// };

// export const deleteCollection = collection => {
//   return dispatch => {
//     dispatch(deleteCollectionRequest(collection));
//     collectionsService
//       .deleteCollection(collection.id)
//       .then(() => {
//         dispatch(deleteCollectionSuccess());
//       })
//       .catch(error => {
//         dispatch(deleteCollectionFailure(error.response, collection));
//       });
//   };
// };

// export const deleteCollectionRequest = collection => {
//   return {
//     type: collectionsActionTypes.DELETE_COLLECTION_REQUEST,
//     collection
//   };
// };

// export const deleteCollectionSuccess = () => {
//   return {
//     type: collectionsActionTypes.DELETE_COLLECTION_SUCCESS
//   };
// };

// export const deleteCollectionFailure = (error, collection) => {
//   return {
//     type: collectionsActionTypes.DELETE_COLLECTION_FAILURE,
//     error,
//     collection
//   };
// };
