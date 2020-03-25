import store from "../../../store/store";
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
