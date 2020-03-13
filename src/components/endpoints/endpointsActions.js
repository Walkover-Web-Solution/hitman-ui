import endpointService from "../endpoints/endpointService";
import endpointsActionTypes from "./endpointsActionTypes";
import store from "../../store/store";

export const fetchEndpoints = () => {
  return dispatch => {
    endpointService
      .getAllEndpoints()
      .then(response => {
        dispatch(onEndpointsFetched(response.data));
      })
      .catch(error => {
        dispatch(
          onEndpointsFetchedError(error.response ? error.response.data : error)
        );
      });
  };
};

export const addEndpoint = (newEndpoint, groupId) => {
  return dispatch => {
    dispatch(addEndpointRequest(newEndpoint));
    endpointService
      .saveEndpoint(groupId, newEndpoint)
      .then(response => {
        dispatch(onEndpointAdded(response.data, newEndpoint));
      })
      .catch(error => {
        dispatch(onEndpointAddedError(error.response.data, newEndpoint));
      });
  };
};

export const updateEndpoint = editedEndpoint => {
  return dispatch => {
    const originalEndpoint = store.getState().endpoints[editedEndpoint.id];
    dispatch(updateEndpointRequest(editedEndpoint));
    const id = editedEndpoint.id;
    delete editedEndpoint.id;
    endpointService
      .updateEndpoint(id, editedEndpoint)
      .then(response => {
        dispatch(onEndpointUpdated(response.data));
      })
      .catch(error => {
        dispatch(onEndpointUpdatedError(error.response.data, originalEndpoint));
      });
  };
};

export const onEndpointsFetched = endpoints => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_FETCHED,
    endpoints
  };
};

export const onEndpointsFetchedError = error => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_FETCHED_ERROR,
    error
  };
};

export const addEndpointRequest = newEndpoint => {
  return {
    type: endpointsActionTypes.ADD_ENDPOINT_REQUEST,
    newEndpoint
  };
};

export const onEndpointAdded = response => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_ADDED,
    response
  };
};

export const onEndpointAddedError = (error, newEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_ADDED_ERROR,
    newEndpoint,
    error
  };
};

export const updateEndpointRequest = editedEndpoint => {
  return {
    type: endpointsActionTypes.UPDATE_ENDPOINT_REQUEST,
    editedEndpoint
  };
};

export const onEndpointUpdated = response => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED,
    response
  };
};

export const onEndpointUpdatedError = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR,
    error,
    originalEndpoint
  };
};

export const deleteEndpoint = endpoint => {
  return dispatch => {
    dispatch(deleteEndpointRequest(endpoint));
    endpointService
      .deleteEndpoint(endpoint.id)
      .then(() => {
        dispatch(onEndpointDeleted());
      })
      .catch(error => {
        dispatch(onEndpointDeletedError(error.response, endpoint));
      });
  };
};

export const deleteEndpointRequest = endpoint => {
  return {
    type: endpointsActionTypes.DELETE_ENDPOINT_REQUEST,
    endpoint
  };
};

export const onEndpointDeleted = () => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DELETED
  };
};

export const onEndpointDeletedError = (error, endpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR,
    error,
    endpoint
  };
};

export const duplicateEndpoint = endpoint => {
  return dispatch => {
    endpointService
      .duplicateEndpoint(endpoint.id)
      .then(response => {
        dispatch(onEndpointDuplicated(response.data));
      })
      .catch(error => {
        dispatch(onEndpointDuplicatedError(error.response, endpoint));
      });
  };
};

export const onEndpointDuplicated = response => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DUPLICATED,
    response
  };
};

export const onEndpointDuplicatedError = (error, endpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DUPLICATED_ERROR,
    error,
    endpoint
  };
};

export const updateState = endpoints => {
  return dispatch => {
    try {
      dispatch(updateStateSuccess(endpoints));
    } catch (error) {
      dispatch(updateStateFailure(error));
    }
  };
};

export const updateStateSuccess = endpoints => {
  return {
    type: endpointsActionTypes.UPDATE_STATE_SUCCESS,
    endpoints
  };
};

export const updateStateFailure = error => {
  return {
    type: endpointsActionTypes.UPDATE_STATE_FAILURE,
    error
  };
};

export default {
  updateState
};
