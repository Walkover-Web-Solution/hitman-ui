import versionActionTypes from "./collectionVersionsActionTypes";

const initialState = {
  versions: {}
};

function versionsReducer(state = initialState, action) {
  switch (action.type) {
    // case "FETCH_VERSIONS_REQUEST":
    //     return {
    //         ...state,
    //         loading: true
    //     };
    case versionActionTypes.FETCH_VERSIONS_SUCCESS:
      return {
        versions: action.payload
      };
    case versionActionTypes.FETCH_VERSIONS_FAILURE:
      return {
        versions: {}
      };

    default:
      return state;
  }
}

export default versionsReducer;
