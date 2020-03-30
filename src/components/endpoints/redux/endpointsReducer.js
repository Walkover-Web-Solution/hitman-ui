import endpointsActionTypes from "./endpointsActionTypes";
import { toast } from "react-toastify";
import groupsActionTypes from "../../groups/redux/groupsActionTypes";
import versionActionTypes from "../../collectionVersions/redux/collectionVersionsActionTypes";
import collectionActionTypes from "../../collections/redux/collectionsActionTypes";
import publicEndpointsActionTypes from "../../publicEndpoint/redux/publicEndpointsActionTypes";

const initialState = {};

function endpointsReducer(state = initialState, action) {
  let endpoints = {};
  switch (action.type) {
    case endpointsActionTypes.MOVE_ENDPOINT_REQUEST:
      endpoints = { ...state };
      endpoints[action.endpointId].groupId = action.destinationGroupId;
      return endpoints;

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
      return { ...state, [action.response.id]: action.response };

    case groupsActionTypes.ON_GROUP_DUPLICATED:
      endpoints = { ...state, ...action.response.endpoints };
      return { ...state, ...action.response.endpoints };

    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.endpoints };

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.endpoints };

    case versionActionTypes.IMPORT_VERSION:
      return { ...state, ...action.response.endpoints };

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...action.data.endpoints };

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case publicEndpointsActionTypes.ON_APPROVED_ENDPOINT_SUCCESS:
      return { ...state, ...action.data };

    case publicEndpointsActionTypes.ON_APPROVED_ENDPOINT_ERROR:
      return { ...state };

    default:
      return state;
  }
}

export default endpointsReducer;
