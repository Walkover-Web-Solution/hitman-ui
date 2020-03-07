import endpointsActionTypes from "./endpointsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  endpoints: {}
};

function endpointsReducer(state = initialState, action) {
  let endpoints = {};
  switch (action.type) {
    case endpointsActionTypes.FETCH_ENDPOINTS_SUCCESS:
      return { ...action.endpoints };

    case endpointsActionTypes.FETCH_ENDPOINTS_FAILURE:
      toast.error(action.error);
      return state;

    case endpointsActionTypes.ADD_ENDPOINT_REQUEST:
      return {
        ...state,
        [action.newEndpoint.requestId]: action.newEndpoint
      };

    case endpointsActionTypes.ADD_ENDPOINT_SUCCESS:
      endpoints = { ...state };
      delete endpoints[action.response.requestId];
      endpoints[action.response.id] = action.response;
      return endpoints;

    case endpointsActionTypes.ADD_ENDPOINT_FAILURE:
      toast.error(action.error);
      endpoints = { ...state };
      delete endpoints[action.newEndpoint.requestId];
      return endpoints;

    case endpointsActionTypes.UPDATE_ENDPOINT_REQUEST:
      return {
        ...state,
        [action.editedEndpoint.id]: action.editedEndpoint
      };

    case endpointsActionTypes.UPDATE_ENDPOINT_SUCCESS:
      return {
        ...state,
        [action.response.id]: action.response
      };

    case endpointsActionTypes.UPDATE_ENDPOINT_FAILURE:
      toast.error(action.error);
      return {
        ...state,
        [action.originalEndpoint.id]: action.originalEndpoint
      };

    case endpointsActionTypes.DELETE_ENDPOINT_REQUEST:
      endpoints = { ...state };
      delete endpoints[action.endpoint.id];
      return endpoints;

    case endpointsActionTypes.DELETE_ENDPOINT_SUCCESS:
      return state;

    case endpointsActionTypes.DELETE_ENDPOINT_FAILURE:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.endpoint.id]: action.endpoint
      };

    case endpointsActionTypes.DUPLICATE_ENDPOINT_SUCCESS:
      endpoints = { ...state };
      endpoints[action.response.id] = action.response;
      return endpoints;

    case endpointsActionTypes.DUPLICATE_ENDPOINT_FAILURE:
      toast.error(action.error);
      endpoints = { ...state };
      return endpoints;

    default:
      return state;
  }
}

export default endpointsReducer;
