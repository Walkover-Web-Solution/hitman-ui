import teamActionTypes from "./teamUsersActionTypes";
import { toast } from "react-toastify";

const initialState = {};

function teamsUsersReducer(state = initialState, action) {
  let teamUsers = {};
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS:
      return { ...action.response };

    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR:
      return { ...action.response };

    case teamActionTypes.ON_COLLECTION_SHARED_REQUEST:
      teamUsers = { ...state };

      for (let i = 0; i < action.sharedCollection.length; i++) {
        if (action.sharedCollection[i].id !== null) {
          if (action.sharedCollection[i].deleteFlag === true) {
            delete teamUsers[action.sharedCollection[i].userId];
          }
        } else {
          teamUsers[action.sharedCollection[i].requestId] =
            action.sharedCollection[i];
        }
      }
      return teamUsers;

    case teamActionTypes.ON_COLLECTION_SHARED:
      const sharedCollection = action.sharedCollection;
      teamUsers = { ...state };

      for (let i = 0; i < sharedCollection.length; i++) {
        if (sharedCollection[i].id !== null) {
          if (sharedCollection[i].deleteFlag === false) {
            teamUsers[action.response[i].userId] = action.response[i];
          }
        } else {
          if (action.response[i].id === null) {
            toast.error("User Not Found");
            delete teamUsers[action.response[i].requestId];
          } else {
            teamUsers[action.response[i].userId] = action.response[i];
            delete teamUsers[action.response[i].requestId];
          }
        }
      }
      return teamUsers;

    case teamActionTypes.ON_COLLECTION_SHARED_ERROR:
      toast.error(action.error);
      return;

    default:
      return state;
  }
}

export default teamsUsersReducer;
