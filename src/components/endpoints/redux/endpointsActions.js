import { toast } from "react-toastify";
import store from "../../../store/store";
import { setEndpointIds } from "../../groups/redux/groupsActions";
import endpointApiService from "../endpointApiService";
import endpointsActionTypes from "./endpointsActionTypes";

export const addEndpoint = (history, newEndpoint, groupId) => {
  return (dispatch) => {
    dispatch(addEndpointRequest({ ...newEndpoint, groupId }));
    endpointApiService
      .saveEndpoint(groupId, newEndpoint)
      .then((response) => {
        dispatch(onEndpointAdded(response.data, newEndpoint));
        // let endpointsOrder = store.getState().groups[groupId].endpointsOrder;
        // endpointsOrder.push(response.data.id);
        // dispatch(setEndpointIds(endpointsOrder, groupId));
        history.push(`/dashboard/endpoint/${response.data.id}`);
      })
      .catch((error) => {
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
  return (dispatch) => {
    endpointApiService
      .getAllEndpoints()
      .then((response) => {
        dispatch(onEndpointsFetched(response.data));
      })
      .catch((error) => {
        dispatch(
          onEndpointsFetchedError(error.response ? error.response.data : error)
        );
      });
  };
};

export const updateEndpoint = (editedEndpoint) => {
  return (dispatch) => {
    const originalEndpoint = store.getState().endpoints[editedEndpoint.id];
    dispatch(updateEndpointRequest(editedEndpoint));
    const id = editedEndpoint.id;
    delete editedEndpoint.id;
    delete editedEndpoint.groupId;
    endpointApiService
      .updateEndpoint(id, editedEndpoint)
      .then((response) => {
        dispatch(onEndpointUpdated(response.data));
      })
      .catch((error) => {
        dispatch(
          onEndpointUpdatedError(
            error.response ? error.response.data : error,
            originalEndpoint
          )
        );
      });
  };
};

export const deleteEndpoint = (endpoint) => {
  return (dispatch) => {
    dispatch(deleteEndpointRequest(endpoint));
    // let endpointsOrder = store.getState().groups[endpoint.groupId]
    // .endpointsOrder;
    // endpointsOrder = endpointsOrder.filter((eId) => eId !== endpoint.id);
    // dispatch(setEndpointIds(endpointsOrder, endpoint.groupId));
    endpointApiService
      .deleteEndpoint(endpoint.id)
      .then(() => {
        dispatch(onEndpointDeleted());
      })
      .catch((error) => {
        dispatch(onEndpointDeletedError(error.response, endpoint));
      });
  };
};

export const duplicateEndpoint = (endpoint) => {
  return (dispatch) => {
    endpointApiService
      .duplicateEndpoint(endpoint.id)
      .then((response) => {
        dispatch(onEndpointDuplicated(response.data));
      })
      .catch((error) => {
        toast.error(error);
      });
  };
};

export const moveEndpoint = (endpointId, sourceGroupId, destinationGroupId) => {
  return (dispatch) => {
    dispatch(
      moveEndpointRequest(endpointId, sourceGroupId, destinationGroupId)
    );

    endpointApiService
      .moveEndpoint(endpointId, { groupId: destinationGroupId })
      .then((response) => {
        dispatch(moveEndpointSuccess(response.data));
      });
  };
};

export const setAuthorizationType = (endpointId, authData) => {
  const originalAuthType = store.getState().endpoints[endpointId]
    .authorizationType;
  return (dispatch) => {
    dispatch(setAuthorizationTypeRequest(endpointId, authData));
    endpointApiService
      .setAuthorizationType(endpointId, authData)
      .then(() => {})
      .catch((error) => {
        dispatch(
          onAuthorizationTypeError(
            error.response ? error.response.data : error,
            endpointId,
            originalAuthType
          )
        );
        toast.error(error);
      });
  };
};

export const setAuthorizationTypeRequest = (endpointId, authData) => {
  return {
    type: endpointsActionTypes.SET_AUTHORIZATION_TYPE_REQUEST,
    endpointId,
    authData,
  };
};

export const onAuthorizationTypeError = (
  error,
  endpointId,
  originalAuthType
) => {
  return {
    type: endpointsActionTypes.SET_AUTHORIZATION_TYPE_ERROR,
    error,
    endpointId,
    originalAuthType,
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
    destinationGroupId,
  };
};

export const moveEndpointSuccess = (response) => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_SUCCESS,
    response,
  };
};

export const onEndpointsFetched = (endpoints) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_FETCHED,
    endpoints,
  };
};

export const onEndpointsFetchedError = (error) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_FETCHED_ERROR,
    error,
  };
};

export const addEndpointRequest = (newEndpoint) => {
  return {
    type: endpointsActionTypes.ADD_ENDPOINT_REQUEST,
    newEndpoint,
  };
};

export const onEndpointAdded = (response) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_ADDED,
    response,
  };
};

export const onEndpointAddedError = (error, newEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_ADDED_ERROR,
    newEndpoint,
    error,
  };
};

export const updateEndpointRequest = (editedEndpoint) => {
  return {
    type: endpointsActionTypes.UPDATE_ENDPOINT_REQUEST,
    editedEndpoint,
  };
};

export const onEndpointUpdated = (response) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED,
    response,
  };
};

export const onEndpointUpdatedError = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR,
    error,
    originalEndpoint,
  };
};

export const deleteEndpointRequest = (endpoint) => {
  return {
    type: endpointsActionTypes.DELETE_ENDPOINT_REQUEST,
    endpoint,
  };
};

export const onEndpointDeleted = () => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DELETED,
  };
};

export const onEndpointDeletedError = (error, endpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR,
    error,
    endpoint,
  };
};

export const onEndpointDuplicated = (response) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DUPLICATED,
    response,
  };
};

export const updateEndpointOrder = (sourceEndpointIds, groupId) => {
  return (dispatch) => {
    const originalEndpoints = JSON.parse(
      JSON.stringify(store.getState().endpoints)
    );
    dispatch(
      updateEndpointOrderRequest(
        { ...store.getState().endpoints },
        sourceEndpointIds
      )
    );
    endpointApiService
      .updateEndpointOrder(sourceEndpointIds)
      .then(() => {})
      .catch((error) => {
        dispatch(
          onEndpointOrderUpdatedError(
            error.response ? error.response.data : error,
            originalEndpoints
          )
        );
      });
  };
};

export const updateEndpointOrderRequest = (endpoints, sourceEndpointIds) => {
  for (let i = 0; i < sourceEndpointIds.length; i++) {
    endpoints[sourceEndpointIds[i]].position = i;
  }
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED,
    endpoints,
  };
};

export const onEndpointOrderUpdatedError = (error, endpoints) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED_ERROR,
    endpoints,
    error,
  };
};

export const reorderEndpoint = (
  sourceEndpointIds,
  sourceGroupId,
  destinationEndpointIds,
  destinationGroupId,
  endpointId
) => {
  return (dispatch) => {
    const originalEndpoints = JSON.parse(
      JSON.stringify(store.getState().endpoints)
    );
    dispatch(
      reorderEndpointRequest(
        { ...store.getState().endpoints },
        sourceEndpointIds,
        sourceGroupId,
        destinationEndpointIds,
        destinationGroupId,
        endpointId
      )
    );
    endpointApiService
      .updateEndpointOrder(
        sourceEndpointIds,
        sourceGroupId,
        destinationEndpointIds,
        destinationGroupId,
        endpointId
      )
      .then(() => {})
      .catch((error) => {
        dispatch(
          reorderEndpointError(
            error.response ? error.response.data : error,
            originalEndpoints
          )
        );
      });
  };
};

export const reorderEndpointRequest = (
  endpoints,
  sourceEndpointIds,
  sourceGroupId,
  destinationEndpointIds,
  destinationGroupId,
  endpointId
) => {
  for (let i = 0; i < sourceEndpointIds.length; i++) {
    endpoints[sourceEndpointIds[i]].position = i;
  }
  for (let i = 0; i < destinationEndpointIds.length; i++) {
    endpoints[destinationEndpointIds[i]].position = i;
  }
  endpoints[endpointId].groupId = destinationGroupId;
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED,
    endpoints,
  };
};

export const reorderEndpointError = (error, endpoints) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED_ERROR,
    endpoints,
    error,
  };
};
