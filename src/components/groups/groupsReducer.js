import groupsActionTypes from "./groupsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  groups: {}
};

function groupsReducer(state = initialState, action) {
  let groups = {};
  switch (action.type) {
    case groupsActionTypes.FETCH_GROUPS_SUCCESS:
      return { ...action.groups }
      
    case groupsActionTypes.FETCH_GROUPS_FAILURE:
      toast.error(action.error);
      return state;

    case groupsActionTypes.ADD_GROUP_REQUEST:
      return {
        ...state,
        [action.newGroup.requestId]: action.newGroup
    }

    case groupsActionTypes.ADD_GROUP_SUCCESS:
      groups = { ...state };
      delete groups[action.response.requestId];
      groups[action.response.id] = action.response;
      return groups;

    case groupsActionTypes.ADD_GROUP_FAILURE:
      toast.error(action.error);
      groups = { ...state };
      delete groups[action.newGroup.requestId];
      return groups;

      case groupsActionTypes.UPDATE_GROUP_REQUEST:
      return {
          ...state,
          [action.editedGroup.id]: action.editedGroup
      };

    case groupsActionTypes.UPDATE_GROUP_SUCCESS:
      return {
        ...state,
        [action.response.id]: action.response
    };

    case groupsActionTypes.UPDATE_GROUP_FAILURE:
      toast.error(action.error);
      return {
          ...state,
          [action.originalGroup.id]: action.originalGroup
      };

    case groupsActionTypes.DELETE_GROUP_REQUEST:
      groups = { ...state};
      delete groups[action.group.id];
      return groups;

    case groupsActionTypes.DELETE_GROUP_SUCCESS:
      return state;

    case groupsActionTypes.DELETE_GROUP_FAILURE:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
          ...state,
          [action.group.id]: action.group
        }
    
    default:
      return state;
  }
}

export default groupsReducer;
