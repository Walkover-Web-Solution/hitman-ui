import environmentsActionTypes from "./environmentsActionTypes";
import { toast } from "react-toastify";

const initialState = {
  environments: {},
  currentEnvironmentId: ""
};

function environmentsReducer(state = initialState, action) {
  let environments = {};
  switch (action.type) {
    case environmentsActionTypes.SET_ENVIRONMENT_ID:
      return {
        ...state,
        currentEnvironmentId: action.currentEnvironmentId
      };

    case environmentsActionTypes.ON_ENVIRONMENTS_FETCHED:
      return {
        ...state,
        environments: { ...state.environments, ...action.environments }
      };

    case environmentsActionTypes.ON_ENVIRONMENTS_FETCHED_ERROR:
      toast.error(action.error);
      return state;

    case environmentsActionTypes.ADD_ENVIRONMENT_REQUEST:
      return {
        ...state,
        environments: {
          ...state.environments,
          [action.newEnvironment.requestId]: action.newEnvironment
        }
      };

    case environmentsActionTypes.ON_ENVIRONMENT_ADDED:
      environments = { ...state.environments };
      delete environments[action.response.requestId];
      environments[action.response.id] = action.response;
      return { ...state, environments };

    case environmentsActionTypes.ON_ENVIRONMENT_ADDED_ERROR:
      toast.error(action.error);
      environments = { ...state.environments };
      delete environments[action.newEnvironment.requestId];
      return { ...state, environments };

    case environmentsActionTypes.UPDATE_ENVIRONMENT_REQUEST:
      return {
        ...state,
        environments: {
          ...state.environments,
          [action.editedEnvironment.id]: action.editedEnvironment
        }
      };

    case environmentsActionTypes.ON_ENVIRONMENT_UPDATED:
      return {
        ...state,
        environments: {
          ...state.environments,
          [action.response.id]: action.response
        }
      };

    case environmentsActionTypes.ON_ENVIRONMENT_UPDATED_ERROR:
      toast.error(action.error);
      return {
        ...state,
        environments: {
          ...state.environments,
          [action.originalEnvironment.id]: action.originalEnvironment
        }
      };

    case environmentsActionTypes.DELETE_ENVIRONMENT_REQUEST:
      environments = { ...state.environments };
      delete environments[action.environment.id];
      return { ...state, environments };

    case environmentsActionTypes.ON_ENVIRONMENT_DELETED:
      return state;

    case environmentsActionTypes.ON_ENVIRONMENT_DELETED_ERROR:
      toast.error(action.error.data);
      if (action.error.status === 404) return state;
      return {
        ...state,
        environments: {
          ...state.environments,
          [action.environment.id]: action.environment
        }
      };

    default:
      return state;
  }
}

export default environmentsReducer;
