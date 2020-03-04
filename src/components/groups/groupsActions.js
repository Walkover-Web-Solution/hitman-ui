import groupsActionTypes from "./groupsActionTypes";
import groupsService from "../groups/groupsService";
import shortId from "shortid";
import store from "../../store/store";


export const fetchGroups = () => {
  return dispatch => {
    groupsService
      .getAllGroups()
      .then(response => {
        dispatch(fetchGroupsSuccess(response.data));
      })
      .catch(error => {
        dispatch(fetchGroupsFailure(error.response?error.response.data:error));
      });
  };
};

export const fetchGroupsSuccess = groups => {
  return {
    type: groupsActionTypes.FETCH_GROUPS_SUCCESS,
    groups
  };
};

export const fetchGroupsFailure = error => {
  return {
    type: groupsActionTypes.FETCH_GROUPS_FAILURE,
    error
  };
};

export const addGroup = (versionId,newGroup) => {
  return dispatch => {
    dispatch(addGroupRequest(newGroup));
    groupsService
      .saveGroup(versionId,newGroup)
      .then(response => {
        dispatch(addGroupSuccess(response.data));
      })
      .catch(error => {
        dispatch(addGroupFailure(error.response?error.response.data:error, newGroup));
      });
  };
};

export const addGroupRequest = newGroup => {
  return {
    type: groupsActionTypes.ADD_GROUP_REQUEST,
    newGroup
  };
};

export const addGroupSuccess = response => {
  return {
    type: groupsActionTypes.ADD_GROUP_SUCCESS,
    response
  };
};

export const addGroupFailure = (error, newGroup) => {
  return {
    type: groupsActionTypes.ADD_GROUP_FAILURE,
    newGroup,
    error
  };
};


export const updateGroup = editedGroup => {
  return dispatch => {
    const originalGroup = store.getState().groups[
      editedGroup.id
    ];
    dispatch(updateGroupRequest(editedGroup));
    const id = editedGroup.id;
    delete editedGroup.id;
    groupsService
      .updateGroup(id, editedGroup)
      .then((response) => {
        dispatch(updateGroupSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          updateGroupFailure(error.response?error.response.data:error, originalGroup)
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

export const updateGroupSuccess = (response) => {
  return {
    type: groupsActionTypes.UPDATE_GROUP_SUCCESS,
    response
  };
};

export const updateGroupFailure = (error, originalGroup) => {
  return {
    type: groupsActionTypes.UPDATE_GROUP_FAILURE,
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
        dispatch(deleteGroupSuccess());
      })
      .catch(error => {
        dispatch(deleteGroupFailure(error.response?error.response.data:error, group));
      });
  };
};

export const deleteGroupRequest = group => {
  return {
    type: groupsActionTypes.DELETE_GROUP_REQUEST,
    group
  };
};

export const deleteGroupSuccess = () => {
  return {
    type:groupsActionTypes.DELETE_GROUP_SUCCESS
  };
};

export const deleteGroupFailure = (error, group) => {
  return {
    type:groupsActionTypes.DELETE_GROUP_FAILURE,
    error,
    group
  };
};
