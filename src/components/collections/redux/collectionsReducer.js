import collectionsActionTypes from "./collectionsActionTypes";
import { toast } from "react-toastify";

const initialState = {};

function collectionsReducer(state = initialState, action) {
  let collections = {};
  switch (action.type) {
    case collectionsActionTypes.ON_COLLECTIONS_FETCHED:
      return { ...action.collections };

    case collectionsActionTypes.ON_COLLECTIONS_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case collectionsActionTypes.ADD_COLLECTION_REQUEST:
      return {
        ...state,
        [action.newCollection.requestId]: action.newCollection
      };

    case collectionsActionTypes.ON_COLLECTION_ADDED:
      collections = { ...state };
      delete collections[action.response.requestId];
      collections[action.response.id] = action.response;
      return collections;

    case collectionsActionTypes.ON_COLLECTION_ADDED_ERROR:
      toast.error(action.error);
      collections = { ...state };
      delete collections[action.newCollection.requestId];
      return collections;

    case collectionsActionTypes.UPDATE_COLLECTION_REQUEST:
      return {
        ...state,
        [action.editedCollection.id]: action.editedCollection
      };

    case collectionsActionTypes.ON_COLLECTION_UPDATED:
      return state;

    case collectionsActionTypes.ON_COLLECTION_UPDATED_ERROR:
      toast.error(action.error);
      return {
        ...state,
        [action.originalCollection.id]: action.originalCollection
      };

    case collectionsActionTypes.DELETE_COLLECTION_REQUEST:
      collections = { ...state };
      delete collections[action.collection.id];
      return collections;

    case collectionsActionTypes.ON_COLLECTION_DELETED:
      return state;

    case collectionsActionTypes.ON_COLLECTION_DELETED_ERROR:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.collection.id]: action.collection
      };

    case collectionsActionTypes.ON_COLLECTION_DUPLICATED:
      collections = { ...state };
      const collection = action.response.collection;
      collections = { ...collections, [collection.id]: collection };
      return collections;

    case collectionsActionTypes.ON_COLLECTION_DUPLICATED_ERROR:
      toast.error(action.error);

    default:
      return state;
  }
}

export default collectionsReducer;
