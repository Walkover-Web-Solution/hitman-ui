import groupsActionTypes from "./groupsActionTypes";
import groupsService from "../groups/groupsService";
import store from "../../store/store";


export const fetchGroups = () => {
  return dispatch => {
    groupsService
      .getAllGroups()
      .then(response => {
        dispatch(fetchGroupsSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchGroupsFailure(error.response.data));
      });
  };
};

export const fetchGroupsSuccess = groups => {
  return {
    type: groupsActionTypes.FETCH_GROUPS_SUCCESS,
    groups
  };
};

export const fetchGroupsFailure = error => {
  return {
    type: groupsActionTypes.FETCH_GROUPS_FAILURE,
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
