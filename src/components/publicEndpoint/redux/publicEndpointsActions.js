import publicEndpointsService from "../publicEndpointsService.js";
import publicEndpointsActionTypes from "./publicEndpointsActionTypes";
import publicPageService from "../publicPageService";

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

export const pendingPage = page => {
  return dispatch => {
    publicPageService
      .pendingPage(page)
      .then(response => {
        dispatch(onPageStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onPageStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const approvePage = page => {
  return dispatch => {
    publicPageService
      .approvePage(page)
      .then(response => {
        dispatch(onPageStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onPageStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const draftPage = page => {
  return dispatch => {
    publicPageService
      .draftPage(page)
      .then(response => {
        dispatch(onPageStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onPageStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const rejectPage = page => {
  return dispatch => {
    publicPageService
      .rejectPage(page)
      .then(response => {
        dispatch(onPageStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onPageStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onPageStateSuccess = data => {
  return {
    type: publicEndpointsActionTypes.ON_PAGE_STATE_SUCCESS,
    data
  };
};

export const onPageStateError = error => {
  return {
    type: publicEndpointsActionTypes.ON_PAGE_STATE_ERROR,
    error
  };
};

export const pendingEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .pendingEndpoint(endpoint)
      .then(response => {
        dispatch(onEndpointStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onEndpointStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const approveEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .approveEndpoint(endpoint)
      .then(response => {
        dispatch(onEndpointStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onEndpointStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const draftEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .draftEndpoint(endpoint)
      .then(response => {
        dispatch(onEndpointStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onEndpointStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const rejectEndpoint = endpoint => {
  return dispatch => {
    publicEndpointsService
      .rejectEndpoint(endpoint)
      .then(response => {
        dispatch(onEndpointStateSuccess(response.data));
      })
      .catch(error => {
        dispatch(
          onEndpointStateError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onEndpointStateSuccess = data => {
  return {
    type: publicEndpointsActionTypes.ON_ENDPOINT_STATE_SUCCESS,
    data
  };
};

export const onEndpointStateError = error => {
  return {
    type: publicEndpointsActionTypes.ON_ENDPOINT_STATE_ERROR,
    error
  };
};
