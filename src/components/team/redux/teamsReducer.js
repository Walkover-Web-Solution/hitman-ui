import teamActionTypes from "./teamsActionTypes";
import { toast } from "react-toastify";

const initialState = {};

function teamsReducer(state = initialState, action) {
  let teams = {};
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
