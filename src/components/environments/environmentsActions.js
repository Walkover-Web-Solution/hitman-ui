import environmentService from "../environments/environmentService";
import environmentsActionTypes from "./environmentsActionTypes";
import store from "../../store/store";

export const fetchEnvironments = () => {
  return dispatch => {
    environmentService
      .getEnvironments()
      .then(response => {
        dispatch(fetchEnvironmentsSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          fetchEnvironmentsFailure(error.response ? error.response.data : error)
        );
      });
  };
};

export const addEnvironment = newEnvironment => {
  return dispatch => {
    dispatch(addEnvironmentRequest(newEnvironment));
    environmentService
      .saveEnvironment(newEnvironment)
      .then(response => {
        dispatch(addEnvironmentSuccess(response.data, newEnvironment));
      })
      .catch(error => {
        dispatch(addEnvironmentFailure(error.response.data, newEnvironment));
      });
  };
};

export const updateEnvironment = editedEnvironment => {
  return dispatch => {
    const originalEnvironment = store.getState().environments[
      editedEnvironment.id
    ];
    dispatch(updateEnvironmentRequest(editedEnvironment));
    const id = editedEnvironment.id;
    delete editedEnvironment.id;
    environmentService
      .updateEnvironment(id, editedEnvironment)
      .then(response => {
        dispatch(updateEnvironmentSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          updateEnvironmentFailure(error.response.data, originalEnvironment)
        );
      });
  };
};

export const deleteEnvironment = environment => {
  return dispatch => {
    dispatch(deleteEnvironmentRequest(environment));
    environmentService
      .deleteEnvironment(environment.id)
      .then(() => {
        dispatch(deleteEnvironmentSuccess());
      })
      .catch(error => {
        dispatch(deleteEnvironmentFailure(error.response, environment));
      });
  };
};

export const fetchEnvironmentsSuccess = environments => {
  return {
    type: environmentsActionTypes.FETCH_ENVIRONMENTS_SUCCESS,
    environments
  };
};

export const fetchEnvironmentsFailure = error => {
  return {
    type: environmentsActionTypes.FETCH_ENVIRONMENTS_FAILURE,
    error
  };
};

export const addEnvironmentRequest = newEnvironment => {
  return {
    type: environmentsActionTypes.ADD_ENVIRONMENT_REQUEST,
    newEnvironment
  };
};

export const addEnvironmentSuccess = response => {
  return {
    type: environmentsActionTypes.ADD_ENVIRONMENT_SUCCESS,
    response
  };
};

export const addEnvironmentFailure = (error, newEnvironment) => {
  return {
    type: environmentsActionTypes.ADD_ENVIRONMENT_FAILURE,
    newEnvironment,
    error
  };
};

export const updateEnvironmentRequest = editedEnvironment => {
  return {
    type: environmentsActionTypes.UPDATE_ENVIRONMENT_REQUEST,
    editedEnvironment
  };
};

export const updateEnvironmentSuccess = response => {
  console.log(response);
  return {
    type: environmentsActionTypes.UPDATE_ENVIRONMENT_SUCCESS,
    response
  };
};

export const updateEnvironmentFailure = (error, originalEnvironment) => {
  return {
    type: environmentsActionTypes.UPDATE_ENVIRONMENT_FAILURE,
    error,
    originalEnvironment
  };
};

export const deleteEnvironmentRequest = environment => {
  return {
    type: environmentsActionTypes.DELETE_ENVIRONMENT_REQUEST,
    environment
  };
};

export const deleteEnvironmentSuccess = () => {
  return {
    type: environmentsActionTypes.DELETE_ENVIRONMENT_SUCCESS
  };
};

export const deleteEnvironmentFailure = (error, environment) => {
  return {
    type: environmentsActionTypes.DELETE_ENVIRONMENT_FAILURE,
    error,
    environment
  };
};
