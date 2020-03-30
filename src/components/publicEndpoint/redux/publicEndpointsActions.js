import publicEndpointsService from "../publicEndpointsService.js";
import publicEndpointsActionTypes from "./publicEndpointsActionTypes";

export const fetchAllPublicEndpoints = collectionIdentifier => {
  return dispatch => {
    publicEndpointsService
      .fetchAll(collectionIdentifier)
      .then(response => {
        dispatch(onPublicEndpointsFetched(response.data));
      })
      .catch(error => {
        dispatch(
          onPublicEndpointsFetchedError(
            error.response ? error.response.data : error
          )
        );
      });
  };
};

export const onPublicEndpointsFetched = data => {
  return {
    type: publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED,
    data
  };
};

export const onPublicEndpointsFetchedError = error => {
  return {
    type: publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED_ERROR,
    error
  };
};

export const pendingEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .pendingEndpoint(endpoint)
      .then(response => {
        dispatch(onPendingEndpointSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onPendingEndpointError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onPendingEndpointSuccess = data => {
  return {
    type: publicEndpointsActionTypes.ON_PENDING_ENDPOINT_SUCCESS,
    data
  };
};

export const onPendingEndpointError = error => {
  return {
    type: publicEndpointsActionTypes.ON_PENDING_ENDPOINT_ERROR,
    error
  };
};

export const approveEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .approveEndpoint(endpoint)
      .then(response => {
        dispatch(onApproveEndpointSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onApproveEndpointError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onApproveEndpointSuccess = data => {
  return {
    type: publicEndpointsActionTypes.ON_APPROVED_ENDPOINT_SUCCESS,
    data
  };
};

export const onApproveEndpointError = error => {
  return {
    type: publicEndpointsActionTypes.ON_APPROVED_ENDPOINT_ERROR,
    error
  };
};

export const draftEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .draftEndpoint(endpoint)
      .then(response => {
        dispatch(onDraftEndpointSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onDraftEndpointError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onDraftEndpointSuccess = data => {
  return {
    type: publicEndpointsActionTypes.ON_DRAFT_ENDPOINT_SUCCESS,
    data
  };
};

export const onDraftEndpointError = error => {
  return {
    type: publicEndpointsActionTypes.ON_DRAFT_ENDPOINT_ERROR,
    error
  };
};
