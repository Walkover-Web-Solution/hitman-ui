import collectionsApiService from "../../collections/collectionsApiService";
import teamsActionTypes from "./teamUsersActionTypes";

export const shareCollection = sharedCollection => {
  return dispatch => {
    dispatch(onCollectionSharedRequest(sharedCollection));
    collectionsApiService
      .shareCollection(sharedCollection)
      .then(response => {
        dispatch(onCollectionShared(sharedCollection, response.data));
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

export const onCollectionSharedRequest = sharedCollection => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED_REQUEST,
    sharedCollection
  };
};

export const onCollectionShared = (sharedCollection, response) => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED,
    sharedCollection,
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
    collectionsApiService
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

export const fetchAllTeamsOfUser = () => {
  return dispatch => {
    collectionsApiService
      .fetchAllTeamsOfUser()
      .then(response => {
        dispatch(onFetchAllTeams(response.data));
      })
      .catch(error => {
        dispatch(
          onFetchAllTeamsError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onFetchAllTeams = data => {
  return {
    type: teamsActionTypes.ON_FETCH_ALL_TEAMS_OF_USER,
    data
  };
};

export const onFetchAllTeamsError = error => {
  return {
    type: teamsActionTypes.ON_FETCH_ALL_TEAMS_OF_USER_ERROR,
    error
  };
};
