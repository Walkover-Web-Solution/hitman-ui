import teamsActionTypes from "./teamsActionTypes";
import collectionsApiService from "../../collections/collectionsApiService";

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
