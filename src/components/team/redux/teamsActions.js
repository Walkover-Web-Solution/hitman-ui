import collectionsService from "../../collections/collectionsService";
import teamsActionTypes from "./teamsActionTypes";

export const shareCollection = sharedCollection => {
  return dispatch => {
    collectionsService
      .shareCollection(sharedCollection)
      .then(response => {
        dispatch(onCollectionShared(response.data));
      })
      .catch(error => {
        dispatch(
          onCollectionSharedError(
            error.response ? error.response.data : error,
            sharedCollection
          )
        );
      });
  };
};

export const onCollectionShared = response => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED,
    response
  };
};

export const onCollectionSharedError = (error, sharedCollection) => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED_ERROR,
    sharedCollection,
    error
  };
};

export const fetchAllUsersOfTeam = teamIdentifier => {
  return dispatch => {
    collectionsService
      .fetchAllUsersOfTeam(teamIdentifier)
      .then(response => {
        dispatch(onFetchAllUsers(response.data));
      })
      .catch(error => {
        dispatch(
          onFetchAllUsersError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onFetchAllUsers = response => {
  return {
    type: teamsActionTypes.ON_FETCH_ALL_SHARED_USERS,
    response
  };
};

export const onFetchAllUsersError = error => {
  return {
    type: teamsActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR,
    error
  };
};

export const deleteUserFromTeam = teamData => {
  return dispatch => {
    collectionsService
      .deleteUserOfTeam(teamData)
      .then(response => {
        dispatch(onDeleteUser(response.data));
      })
      .catch(error => {
        dispatch(
          onDeleteUserError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onDeleteUser = response => {
  return {
    type: teamsActionTypes.ON_SHARED_USERS_DELETED,
    response
  };
};

export const onDeleteUserError = error => {
  return {
    type: teamsActionTypes.ON_SHARED_USERS_DELETED_ERROR,
    error
  };
};
