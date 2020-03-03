import collectionVersionsService from "./collectionVersionsService";
import versionActionTypes from "./collectionVersionsActionTypes";

export const fetchVersions = collections => {
  return dispatch => {
    console.log("fetchVersions");
    // dispatch(fetchVersionsRequest());
    let versions = {};
    const collectionIds = Object.keys(collections);
    for (let i = 0; i < collectionIds.length; i++) {
      const {
        data: versions1
      } = collectionVersionsService.getCollectionVersions(collectionIds[i]);
      versions = { ...versions, ...versions1 };
    }
    console.log(versions);
    dispatch(fetchVersionsSuccess(versions));

    // collectionVersionsService
    //     .getCollectionVersions()
    // .then(response => {
    //         const versions = response.data;
    //         dispatch(fetchVersionsSuccess(versions));
    //     })
    //     .catch(error => {
    //         dispatch(fetchVersionsFailure(error.message));
    //     });
  };
};

// export const fetchVersionsRequest = () => {
//   return {
//     type: "FETCH_VERSIONS_REQUEST"
//   };
// };

export const fetchVersionsSuccess = versions => {
  return {
    type: versionActionTypes.FETCH_VERSIONS_SUCCESS,
    payload: versions
  };
};

export const fetchVersionsFailure = error => {
  return {
    type: versionActionTypes.FETCH_VERSIONS_FAILURE,
    payload: error
  };
};
