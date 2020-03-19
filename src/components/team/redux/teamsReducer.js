import teamActionTypes from "./teamsActionTypes";

const initialState = {};

function teamsReducer(state = initialState, action) {
  let teamMembers = {};
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS:
      return { ...action.response };

    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR:
      return { ...action.response };

    case teamActionTypes.DELETE_SHARED_USERS_REQUEST:
      teamMembers = { ...state };
      delete teamMembers[action.teamIdentifier];
      return teamMembers;

    case teamActionTypes.ON_SHARED_USERS_DELETED:
      return state;

    case teamActionTypes.ON_SHARED_USERS_DELETED_ERROR:
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.teamIdentifier.id]: action.teamMember
      };
    default:
      return state;
  }
}

export default teamsReducer;
