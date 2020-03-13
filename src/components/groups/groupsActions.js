import store from "../../store/store";
import groupsService from "../groups/groupsService";
import groupsActionTypes from "./groupsActionTypes";

import endpointsActions from "../endpoints/endpointsActions";
import pagesActions from "../pages/pagesActions";

export const fetchGroups = () => {
  return dispatch => {
    groupsService
      .getAllGroups()
      .then(response => {
        dispatch(onGroupsFetched(response.data));
      })
      .catch(error => {
        dispatch(
          onGroupsFetchedError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onGroupsFetched = groups => {
  return {
    type: groupsActionTypes.ON_GROUPS_FETCHED,
    groups
  };
};

export const onGroupsFetchedError = error => {
  return {
    type: groupsActionTypes.ON_GROUPS_FETCHED_ERROR,
    error
  };
};

export const addGroup = (versionId, newGroup) => {
  return dispatch => {
    dispatch(addGroupRequest(newGroup));
    groupsService
      .saveGroup(versionId, newGroup)
      .then(response => {
        dispatch(onGroupAdded(response.data));
      })
      .catch(error => {
        dispatch(
          onGroupAddedError(
            error.response ? error.response.data : error,
            newGroup
          )
        );
      });
  };
};

export const addGroupRequest = newGroup => {
  return {
    type: groupsActionTypes.ADD_GROUP_REQUEST,
    newGroup
  };
};

export const onGroupAdded = response => {
  return {
    type: groupsActionTypes.ON_GROUP_ADDED,
    response
  };
};

export const onGroupAddedError = (error, newGroup) => {
  return {
    type: groupsActionTypes.ON_GROUP_ADDED_ERROR,
    newGroup,
    error
  };
};

export const updateGroup = editedGroup => {
  return dispatch => {
    const originalGroup = store.getState().groups[editedGroup.id];
    dispatch(updateGroupRequest(editedGroup));
    const id = editedGroup.id;
    delete editedGroup.id;
    const { name, host, endpointsOrder } = editedGroup;
    groupsService
      .updateGroup(id, { name, host, endpointsOrder })
      .then(response => {
        dispatch(onGroupUpdated(response.data));
      })
      .catch(error => {
        dispatch(
          onGroupUpdatedError(
            error.response ? error.response.data : error,
            originalGroup
          )
        );
      });
  };
};

export const updateGroupRequest = editedGroup => {
  return {
    type: groupsActionTypes.UPDATE_GROUP_REQUEST,
    editedGroup
  };
};

export const onGroupUpdated = response => {
  return {
    type: groupsActionTypes.ON_GROUP_UPDATED,
    response
  };
};

export const onGroupUpdatedError = (error, originalGroup) => {
  return {
    type: groupsActionTypes.ON_GROUP_UPDATED_ERROR,
    error,
    originalGroup
  };
};

export const deleteGroup = group => {
  return dispatch => {
    dispatch(deleteGroupRequest(group));
    groupsService
      .deleteGroup(group.id)
      .then(() => {
        dispatch(onGroupDeleted());
      })
      .catch(error => {
        dispatch(
          onGroupDeletedError(
            error.response ? error.response.data : error,
            group
          )
        );
      });
  };
};

export const deleteGroupRequest = group => {
  return {
    type: groupsActionTypes.DELETE_GROUP_REQUEST,
    group
  };
};

export const onGroupDeleted = () => {
  return {
    type: groupsActionTypes.ON_GROUP_DELETED
  };
};

export const onGroupDeletedError = (error, group) => {
  return {
    type: groupsActionTypes.ON_GROUP_DELETED_ERROR,
    error,
    group
  };
};

export const duplicateGroup = group => {
  return dispatch => {
    groupsService
      .duplicateGroup(group.id)
      .then(response => {
        const endpoints = response.data.endpoints;
        const pages = response.data.pages;
        dispatch(endpointsActions.updateState(endpoints));
        dispatch(pagesActions.updateState(pages));
        dispatch(onGroupDuplicated(response.data));
      })
      .catch(error => {
        dispatch(onGroupDuplicatedError(error.response, group));
      });
  };
};

export const onGroupDuplicated = response => {
  return {
    type: groupsActionTypes.ON_GROUP_DUPLICATED,
    response
  };
};

export const onGroupDuplicatedError = (error, group) => {
  return {
    type: groupsActionTypes.ON_GROUP_DUPLICATED_ERROR,
    error,
    group
  };
};

export const updateState = groups => {
  return dispatch => {
    try {
      dispatch(updateStateSuccess(groups));
    } catch (error) {
      dispatch(updateStateFailure(error));
    }
  };
};

export const updateStateSuccess = groups => {
  return {
    type: groupsActionTypes.UPDATE_STATE_SUCCESS,
    groups
  };
};

export const updateStateFailure = error => {
  return {
    type: groupsActionTypes.UPDATE_STATE_FAILURE,
    error
  };
};

export default {
  updateState
};
