import store from "../../../store/store";
import PublicEndpointsService from "../publicEndpointsService.js";
import publicEndpointsActionTypes from "./publicEndpointsActionTypes";

export const fetchAllPublicEndpoints = collectionIdentifier => {
  return dispatch => {
    PublicEndpointsService.fetchAll(collectionIdentifier)
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

export const onPublicEndpointsFetched = collections => {
  return {
    type: publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED,
    collections
  };
};

export const onPublicEndpointsFetchedError = error => {
  return {
    type: publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED_ERROR,
    error
  };
};
