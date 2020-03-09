import endpointService from "../endpoints/endpointService";
import endpointsActionTypes from "./endpointsActionTypes";
import { moveEndpoint } from "../groups/groupsActions";
import store from "../../store/store";

export const fetchEndpoints = () => {
  return dispatch => {
    endpointService
      .getAllEndpoints()
      .then(response => {
        dispatch(fetchEndpointsSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          fetchEndpointsFailure(error.response ? error.response.data : error)
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
        dispatch(addEndpointSuccess(response.data, newEndpoint));
      })
      .catch(error => {
        dispatch(addEndpointFailure(error.response.data, newEndpoint));
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
        dispatch(updateEndpointSuccess(response.data));
      })
      .catch(error => {
        dispatch(updateEndpointFailure(error.response.data, originalEndpoint));
      });
  };
};

export const fetchEndpointsSuccess = endpoints => {
  return {
    type: endpointsActionTypes.FETCH_ENDPOINTS_SUCCESS,
    endpoints
  };
};

export const fetchEndpointsFailure = error => {
  return {
    type: endpointsActionTypes.FETCH_ENDPOINTS_FAILURE,
    error
  };
};

export const addEndpointRequest = newEndpoint => {
  return {
    type: endpointsActionTypes.ADD_ENDPOINT_REQUEST,
    newEndpoint
  };
};

export const addEndpointSuccess = response => {
  return {
    type: endpointsActionTypes.ADD_ENDPOINT_SUCCESS,
    response
  };
};

export const addEndpointFailure = (error, newEndpoint) => {
  return {
    type: endpointsActionTypes.ADD_ENDPOINT_FAILURE,
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

export const updateEndpointSuccess = response => {
  return {
    type: endpointsActionTypes.UPDATE_ENDPOINT_SUCCESS,
    response
  };
};

export const updateEndpointFailure = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.UPDATE_ENDPOINT_FAILURE,
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
        dispatch(deleteEndpointSuccess());
      })
      .catch(error => {
        dispatch(deleteEndpointFailure(error.response, endpoint));
      });
  };
};

export const deleteEndpointRequest = endpoint => {
  return {
    type: endpointsActionTypes.DELETE_ENDPOINT_REQUEST,
    endpoint
  };
};

export const deleteEndpointSuccess = () => {
  return {
    type: endpointsActionTypes.DELETE_ENDPOINT_SUCCESS
  };
};

export const deleteEndpointFailure = (error, endpoint) => {
  return {
    type: endpointsActionTypes.DELETE_ENDPOINT_FAILURE,
    error,
    endpoint
  };
};

export const duplicateEndpoint = endpoint => {
  return dispatch => {
    endpointService
      .duplicateEndpoint(endpoint.id)
      .then(response => {
        dispatch(duplicateEndpointSuccess(response.data));
      })
      .catch(error => {
        dispatch(duplicateEndpointFailure(error.response, endpoint));
      });
  };
};

export const duplicateEndpointSuccess = response => {
  return {
    type: endpointsActionTypes.DUPLICATE_ENDPOINT_SUCCESS,
    response
  };
};

export const duplicateEndpointFailure = (error, endpoint) => {
  return {
    type: endpointsActionTypes.DUPLICATE_ENDPOINT_FAILURE,
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
export const dndMoveEndpoint = (
  endpointId,
  sourceGroupId,
  destinationGroupId
) => {
  return dispatch => {
    // const originalEndpoint = store.getState().endpoints[editedEndpoint.id];
    dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId));
    const endpoint = store.getState().endpoints[endpointId];
    console.log(endpoint);
    endpoint.groupId = destinationGroupId;
    console.log(endpoint);
    dispatch(updateEndpoint(endpoint));
    // const id = editedEndpoint.id;
    // delete editedEndpoint.id;
    // endpointService
    //   .updateEndpoint(id, editedEndpoint)
    //   .then(response => {
    //     dispatch(updateEndpointSuccess(response.data));
    //   })
    //   .catch(error => {
    //     dispatch(updateEndpointFailure(error.response.data, originalEndpoint));
    //   });
  };
};
