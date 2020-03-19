import teamActionTypes from "./teamsActionTypes";

const initialState = {};

function teamsReducer(state = initialState, action) {
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS:
      return { ...action.response };

    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR:
      return { ...action.response };

    default:
      return state;
  }
}

export default teamsReducer;
