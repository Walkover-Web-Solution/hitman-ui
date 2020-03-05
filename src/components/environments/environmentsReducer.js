import environmentsActionTypes from "./environmentsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  environments: {}
};

function environmentsReducer(state = initialState, action) {
  let environments = {};
  switch (action.type) {
    case environmentsActionTypes.FETCH_ENVIRONMENTS_SUCCESS:
      return { ...action.environments };

    case environmentsActionTypes.FETCH_ENVIRONMENTS_FAILURE:
      toast.error(action.error);
      return state;

    case environmentsActionTypes.ADD_ENVIRONMENT_REQUEST:
      return {
        ...state,
        [action.newEnvironment.requestId]: action.newEnvironment
      };

    case environmentsActionTypes.ADD_ENVIRONMENT_SUCCESS:
      environments = { ...state };
      delete environments[action.response.requestId];
      environments[action.response.id] = action.response;
      return environments;

    case environmentsActionTypes.ADD_ENVIRONMENT_FAILURE:
      toast.error(action.error);
      environments = { ...state };
      delete environments[action.newEnvironment.requestId];
      return environments;

    case environmentsActionTypes.UPDATE_ENVIRONMENT_REQUEST:
      return {
        ...state,
        [action.editedEnvironment.id]: action.editedEnvironment
      };

    case environmentsActionTypes.UPDATE_ENVIRONMENT_SUCCESS:
      return {
        ...state,
        [action.response.id]: action.response
      };

    case environmentsActionTypes.UPDATE_ENVIRONMENT_FAILURE:
      toast.error(action.error);
      return {
        ...state,
        [action.originalEnvironment.id]: action.originalEnvironment
      };

    case environmentsActionTypes.DELETE_ENVIRONMENT_REQUEST:
      environments = { ...state };
      delete environments[action.environment.id];
      return environments;

    case environmentsActionTypes.DELETE_ENVIRONMENT_SUCCESS:
      return state;

    case environmentsActionTypes.DELETE_ENVIRONMENT_FAILURE:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        [action.environment.id]: action.environment
      };

    default:
      return state;
  }
}

export default environmentsReducer;
