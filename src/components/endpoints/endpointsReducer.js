import endpointsActionTypes from "./endpointsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  endpoints: {}
};

function endpointsReducer(state = initialState, action) {
  let endpoints = {};
  switch (action.type) {
    case endpointsActionTypes.ON_ENDPOINTS_FETCHED:
      return { ...action.endpoints };

    case endpointsActionTypes.ON_ENDPOINTS_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case endpointsActionTypes.ADD_ENDPOINT_REQUEST:
      return {
        ...state,
        [action.newEndpoint.requestId]: action.newEndpoint
      };

    case endpointsActionTypes.ON_ENDPOINT_ADDED:
      endpoints = { ...state };
      delete endpoints[action.response.requestId];
      endpoints[action.response.id] = action.response;
      return endpoints;

    case endpointsActionTypes.ON_ENDPOINT_ADDED_ERROR:
      toast.error(action.error);
      endpoints = { ...state };
      delete endpoints[action.newEndpoint.requestId];
      return endpoints;

    case endpointsActionTypes.UPDATE_ENDPOINT_REQUEST:
      return {
        ...state,
        [action.editedEndpoint.id]: action.editedEndpoint
      };

    case endpointsActionTypes.ON_ENDPOINT_UPDATED:
      return {
        ...state,
        [action.response.id]: action.response
      };

    case endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR:
      toast.error(action.error);
      return {
        ...state,
        [action.originalEndpoint.id]: action.originalEndpoint
      };

    case endpointsActionTypes.DELETE_ENDPOINT_REQUEST:
      endpoints = { ...state };
      delete endpoints[action.endpoint.id];
      return endpoints;

    case endpointsActionTypes.ON_ENDPOINT_DELETED:
      return state;

    case endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.endpoint.id]: action.endpoint
      };

    case endpointsActionTypes.ON_ENDPOINT_DUPLICATED:
      endpoints = { ...state };
      endpoints[action.response.id] = action.response;
      return endpoints;

    case endpointsActionTypes.ON_ENDPOINT_DUPLICATED_ERROR:
      toast.error(action.error);
      endpoints = { ...state };
      return endpoints;

    case endpointsActionTypes.UPDATE_STATE_SUCCESS:
      endpoints = { ...state };
      const newEndpoints = { ...action.endpoints };
      const newEndpointIds = Object.keys(newEndpoints);
      for (let i = 0; i < newEndpointIds.length; i++) {
        endpoints = {
          ...endpoints,
          [newEndpointIds[i]]: newEndpoints[newEndpointIds[i]]
        };
      }
      return endpoints;

    case endpointsActionTypes.UPDATE_STATE_FAILURE:
      toast.error(action.error);
      endpoints = { ...state };
      return endpoints;

    default:
      return state;
  }
}

export default endpointsReducer;
