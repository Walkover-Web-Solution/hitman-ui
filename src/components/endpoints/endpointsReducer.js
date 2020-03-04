import endpointsActionTypes from "./endpointsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  endpoints: {}
};

function endpointsReducer(state = initialState, action) {
  console.log("reducer", state, action);
  let endpoints = {};
  switch (action.type) {
    case endpointsActionTypes.FETCH_ENDPOINTS_SUCCESS:
      return { ...action.endpoints };

    case endpointsActionTypes.FETCH_ENDPOINTS_FAILURE:
      toast.error(action.error);
      return state;

    // case endpointsActionTypes.ADD_ENDPOINT_REQUEST:
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.newCollection.requestId]: action.newCollection
    //     }
    //   };

    // case endpointsActionTypes.ADD_ENDPOINT_SUCCESS:
    //   collections = { ...state.collections };
    //   delete collections[action.response.requestId];
    //   collections[action.response.id] = action.response;
    //   return {
    //     collections
    //   };

    // case endpointsActionTypes.ADD_ENDPOINT_FAILURE:
    //   toast.error(action.error);
    //   collections = { ...state.collections };
    //   delete collections[action.newCollection.requestId];
    //   return {
    //     collections
    //   };

    // case endpointsActionTypes.UPDATE_ENDPOINT_REQUEST:
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.editedCollection.id]: action.editedCollection
    //     }
    //   };

    // case endpointsActionTypes.UPDATE_ENDPOINT_SUCCESS:
    //   return state;

    // case endpointsActionTypes.UPDATE_ENDPOINT_FAILURE:
    //   toast.error(action.error);
    //   return {
    //     collections: {
    //       ...state.collections,
    //       [action.originalCollection.id]: action.originalCollection
    //     }
    //   };

    // case endpointsActionTypes.DELETE_ENDPOINT_REQUEST:
    //   collections = { ...state.collections };
    //   delete collections[action.collection.id];
    //   return {
    //     collections
    //   };

    // case endpointsActionTypes.DELETE_ENDPOINT_SUCCESS:
    //   return state;

    // case endpointsActionTypes.DELETE_ENDPOINT_FAILURE:
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

export default endpointsReducer;
