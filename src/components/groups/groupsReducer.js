import groupsActionTypes from "./groupsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  groups: {}
};

function groupsReducer(state = initialState, action) {
  let groups = {};
  switch (action.type) {
    case groupsActionTypes.FETCH_GROUPS_SUCCESS:
      return {
        groups: { ...action.groups }
      };

    case groupsActionTypes.FETCH_GROUPS_FAILURE:
      toast.error(action.error);
      return state;

    // case collectionsActionTypes.ADD_COLLECTION_REQUEST:
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.newCollection.requestId]: action.newCollection
    //     }
    //   };

    // case collectionsActionTypes.ADD_COLLECTION_SUCCESS:
    //   collections = { ...state.collections };
    //   delete collections[action.response.requestId];
    //   collections[action.response.id] = action.response;
    //   return {
    //     collections
    //   };

    // case collectionsActionTypes.ADD_COLLECTION_FAILURE:
    //   toast.error(action.error);
    //   collections = { ...state.collections };
    //   delete collections[action.newCollection.requestId];
    //   return {
    //     collections
    //   };

    // case collectionsActionTypes.UPDATE_COLLECTION_REQUEST:
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.editedCollection.id]: action.editedCollection
    //     }
    //   };

    // case collectionsActionTypes.UPDATE_COLLECTION_SUCCESS:
    //   return state;

    // case collectionsActionTypes.UPDATE_COLLECTION_FAILURE:
    //   toast.error(action.error);
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.originalCollection.id]: action.originalCollection
    //     }
    //   };

    // case collectionsActionTypes.DELETE_COLLECTION_REQUEST:
    //   collections = { ...state.collections };
    //   delete collections[action.collection.id];
    //   return {
    //     collections
    //   };

    // case collectionsActionTypes.DELETE_COLLECTION_SUCCESS:
    //   return state;

    // case collectionsActionTypes.DELETE_COLLECTION_FAILURE:
    //   toast.error(action.error.data);
    //   if (action.error.status === 404) return state;
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.collection.id]: action.collection
    //     }
    //   };

    default:
      return state;
  }
}

export default groupsReducer;
