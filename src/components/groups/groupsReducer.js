import groupsActionTypes from "./groupsActionTypes";
import endpointsActionTypes from "../endpoints/endpointsActionTypes";
import { toast } from "react-toastify";
import versionActionTypes from "../collectionVersions/collectionVersionsActionTypes";
import collectionActionTypes from "../collections/collectionsActionTypes";

const initialState = {};

function groupsReducer(state = initialState, action) {
  let groups = {};
  switch (action.type) {
    case endpointsActionTypes.ON_ENDPOINT_DUPLICATED:
      groups = { ...state };
      groups[action.response.groupId].endpointsOrder.push(action.response.id);
      return groups;

    case endpointsActionTypes.MOVE_ENDPOINT_REQUEST:
      groups = { ...state };
      groups[action.sourceGroupId].endpointsOrder = groups[
        action.sourceGroupId
      ].endpointsOrder.filter(eId => eId !== action.endpointId);
      groups[action.destinationGroupId].endpointsOrder.push(action.endpointId);
      return groups;

    case groupsActionTypes.ON_GROUPS_FETCHED:
      return { ...action.groups };

    case groupsActionTypes.ON_GROUPS_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case groupsActionTypes.ADD_GROUP_REQUEST:
      return {
        ...state,
        [action.newGroup.requestId]: action.newGroup
      };

    case groupsActionTypes.ON_GROUP_ADDED:
      groups = { ...state };
      delete groups[action.response.requestId];
      groups[action.response.id] = action.response;
      return groups;

    case groupsActionTypes.ON_GROUP_ADDED_ERROR:
      toast.error(action.error);
      groups = { ...state };
      delete groups[action.newGroup.requestId];
      return groups;

    case groupsActionTypes.UPDATE_GROUP_REQUEST:
      return {
        ...state,
        [action.editedGroup.id]: action.editedGroup
      };

    case groupsActionTypes.ON_GROUP_UPDATED:
      return {
        ...state,
        [action.response.id]: action.response
      };

    case groupsActionTypes.ON_GROUP_UPDATED_ERROR:
      toast.error(action.error);
      return {
        ...state,
        [action.originalGroup.id]: action.originalGroup
      };

    case groupsActionTypes.DELETE_GROUP_REQUEST:
      groups = { ...state };
      delete groups[action.group.id];
      return groups;

    case groupsActionTypes.ON_GROUP_DELETED:
      return state;

    case groupsActionTypes.ON_GROUP_DELETED:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.group.id]: action.group
      };

    case groupsActionTypes.ON_GROUP_DUPLICATED:
      groups = { ...state };
      const group = action.response.groups;
      groups = { ...groups, [group.id]: group };
      return groups;

    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.groups };

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.groups };
    default:
      return state;
  }
}

export default groupsReducer;
