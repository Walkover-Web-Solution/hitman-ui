import teamActionTypes from "./teamsActionTypes";
import { toast } from "react-toastify";

const initialState = {};

function teamsReducer(state = initialState, action) {
  let team = {};
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS:
      return { ...action.response };

    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR:
      return { ...action.response };

    case teamActionTypes.ON_COLLECTION_SHARED_REQUEST:
      team = { ...state };

      for (let i = 0; i < action.sharedCollection.length; i++) {
        if (action.sharedCollection[i].id !== null) {
          if (action.sharedCollection[i].deleteFlag === true) {
            delete team[action.sharedCollection[i].userId];
          }
        } else {
          team[action.sharedCollection[i].requestId] =
            action.sharedCollection[i];
        }
      }
      return team;

    case teamActionTypes.ON_COLLECTION_SHARED:
      const sharedCollection = action.sharedCollection;
      team = { ...state };

      for (let i = 0; i < sharedCollection.length; i++) {
        if (sharedCollection[i].id !== null) {
          if (sharedCollection[i].deleteFlag === false) {
            team[action.response[i].userId] = action.response[i];
          }
        } else {
          if (action.response[i].id === null) {
            toast.error("User Not Found");
            delete team[action.response[i].requestId];
          } else {
            team[action.response[i].userId] = action.response[i];
            delete team[action.response[i].requestId];
          }
        }
      }
      return team;

    case teamActionTypes.ON_COLLECTION_SHARED_ERROR:
      toast.error(action.error);

    // case teamActionTypes.DELETE_SHARED_USERS_REQUEST:
    //   teams = { ...state };
    //   delete teams[action.userId];
    //   return teams;

    // case teamActionTypes.ON_SHARED_USERS_DELETED:
    //   return state;

    // case teamActionTypes.ON_SHARED_USERS_DELETED_ERROR:
    //   if (action.error.status === 404) return state;
    //   return {
    //     ...state,
    //     [action.teams.userId]: action.teamData
    //   };

    default:
      return state;
  }
}

export default teamsReducer;
