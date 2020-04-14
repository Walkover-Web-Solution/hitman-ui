import teamActionTypes from "../../teams/redux/teamsActionTypes";
import collectionsActionTypes from "../../collections/redux/collectionsActionTypes";

const initialState = {};

function teamsReducer(state = initialState, action) {
  let teams = {};
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_TEAMS_OF_USER:
      return { ...action.data };

    case teamActionTypes.ON_FETCH_ALL_TEAMS_OF_USER_ERROR:
      return state;

    case collectionsActionTypes.ON_COLLECTION_ADDED:
      teams = { ...state };
      teams[action.response.teamId] = action.response.team;
      return teams;

    case collectionsActionTypes.ON_COLLECTION_DELETED:
      teams = { ...state };
      delete teams[action.payload.collection.teamId];
      return teams;

    default:
      return state;
  }
}

export default teamsReducer;
