import endpointService from "../endpointService";
import endpointsActionTypes from "./endpointsActionTypes";
import { setEndpointIds } from "../../groups/redux/groupsActions";
import store from "../../../store/store";
import { toast } from "react-toastify";

export const addEndpoint = (history, newEndpoint, groupId) => {
  return dispatch => {
    dispatch(addEndpointRequest({ ...newEndpoint, groupId }));
    endpointService
      .saveEndpoint(groupId, newEndpoint)
      .then(response => {
        dispatch(onEndpointAdded(response.data, newEndpoint));
        let endpointsOrder = store.getState().groups[groupId].endpointsOrder;
        endpointsOrder.push(response.data.id);
        dispatch(setEndpointIds(endpointsOrder, groupId));
        history.push(`/dashboard/endpoint/${response.data.id}`);
      })
      .catch(error => {
        dispatch(
          onEndpointAddedError(
            error.response ? error.response.data : error,
            newEndpoint
          )
        );
      });
  };
};

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

export const updateEndpoint = editedEndpoint => {
  return dispatch => {
    const originalEndpoint = store.getState().endpoints[editedEndpoint.id];
    dispatch(updateEndpointRequest(editedEndpoint));
    const id = editedEndpoint.id;
    delete editedEndpoint.id;
    delete editedEndpoint.groupId;
    endpointService
      .updateEndpoint(id, editedEndpoint)
      .then(response => {
        dispatch(onEndpointUpdated(response.data));
      })
      .catch(error => {
        dispatch(
          onEndpointUpdatedError(
            error.response ? error.response.data : error,
            originalEndpoint
          )
        );
      });
  };
};

export const deleteEndpoint = endpoint => {
  return dispatch => {
    dispatch(deleteEndpointRequest(endpoint));
    let endpointsOrder = store.getState().groups[endpoint.groupId]
      .endpointsOrder;
    endpointsOrder = endpointsOrder.filter(eId => eId !== endpoint.id);
    dispatch(setEndpointIds(endpointsOrder, endpoint.groupId));
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

export const duplicateEndpoint = endpoint => {
  return dispatch => {
    endpointService
      .duplicateEndpoint(endpoint.id)
      .then(response => {
        dispatch(onEndpointDuplicated(response.data));
      })
      .catch(error => {
        toast.error(error);
        // dispatch(onEndpointDuplicatedError(error.response, endpoint));
      });
  };
};

export const moveEndpoint = (endpointId, sourceGroupId, destinationGroupId) => {
  return dispatch => {
    dispatch(
      moveEndpointRequest(endpointId, sourceGroupId, destinationGroupId)
    );

    endpointService
      .moveEndpoint(endpointId, { groupId: destinationGroupId })
      .then(response => {
        dispatch(moveEndpointSuccess(response.data));
      });
  };
};

export const moveEndpointRequest = (
  endpointId,
  sourceGroupId,
  destinationGroupId
) => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_REQUEST,
    endpointId,
    sourceGroupId,
    destinationGroupId
  };
};

export const moveEndpointSuccess = response => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_SUCCESS,
    response
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

export const onEndpointDuplicated = response => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DUPLICATED,
    response
  };
};
