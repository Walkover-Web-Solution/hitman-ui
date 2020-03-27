import teamActionTypes from "../../teamUsers/redux/teamUsersActionTypes";
import { toast } from "react-toastify";

const initialState = {};

function teamsReducer(state = initialState, action) {
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_TEAMS_OF_USER:
      return { ...action.data };

    case teamActionTypes.ON_FETCH_ALL_TEAMS_OF_USER_ERROR:
      return state;

    default:
      return state;
  }
}

export default teamsReducer;
