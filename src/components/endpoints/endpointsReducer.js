import collectionsActionTypes from "./collectionsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  collections: {}
};

function collectionsReducer(state = initialState, action) {
  let collections = {};
  switch (action.type) {
    case collectionsActionTypes.FETCH_COLLECTIONS_SUCCESS:
      return {
        collections: { ...action.collections }
      };

    case collectionsActionTypes.FETCH_COLLECTIONS_FAILURE:
      toast.error(action.error);
      return state;

    case collectionsActionTypes.ADD_COLLECTION_REQUEST:
      return {
        collections: {
          ...state.collections,
          [action.newCollection.requestId]: action.newCollection
        }
      };

    case collectionsActionTypes.ADD_COLLECTION_SUCCESS:
      collections = { ...state.collections };
      delete collections[action.response.requestId];
      collections[action.response.id] = action.response;
      return {
        collections
      };

    case collectionsActionTypes.ADD_COLLECTION_FAILURE:
      toast.error(action.error);
      collections = { ...state.collections };
      delete collections[action.newCollection.requestId];
      return {
        collections
      };

    case collectionsActionTypes.UPDATE_COLLECTION_REQUEST:
      return {
        collections: {
          ...state.collections,
          [action.editedCollection.id]: action.editedCollection
        }
      };

    case collectionsActionTypes.UPDATE_COLLECTION_SUCCESS:
      return state;

    case collectionsActionTypes.UPDATE_COLLECTION_FAILURE:
      toast.error(action.error);
      return {
        collections: {
          ...state.collections,
          [action.originalCollection.id]: action.originalCollection
        }
      };

    case collectionsActionTypes.DELETE_COLLECTION_REQUEST:
      collections = { ...state.collections };
      delete collections[action.collection.id];
      return {
        collections
      };

    case collectionsActionTypes.DELETE_COLLECTION_SUCCESS:
      return state;

    case collectionsActionTypes.DELETE_COLLECTION_FAILURE:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        collections: {
          ...state.collections,
          [action.collection.id]: action.collection
        }
      };

    default:
      return state;
  }
}

export default collectionsReducer;
