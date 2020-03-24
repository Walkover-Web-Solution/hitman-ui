import collectionsApiService from "../../collections/collectionsApiService";
import teamsActionTypes from "./teamsActionTypes";

export const shareCollection = sharedCollection => {
  return dispatch => {
    dispatch(onCollectionSharedRequest(sharedCollection));
    collectionsApiService
      .shareCollection(sharedCollection)
      .then(response => {
        dispatch(onCollectionShared(sharedCollection, response.data));
      })
      .catch(error => {
        dispatch(
          onCollectionSharedError(
            error.response ? error.response.data : error,
            sharedCollection
          )
        );
      });
  };
};

export const onCollectionSharedRequest = sharedCollection => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED_REQUEST,
    sharedCollection
  };
};

export const onCollectionShared = (sharedCollection, response) => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED,
    sharedCollection,
    response
  };
};

export const onCollectionSharedError = (error, sharedCollection) => {
  return {
    type: teamsActionTypes.ON_COLLECTION_SHARED_ERROR,
    sharedCollection,
    error
  };
};

export const fetchAllUsersOfTeam = teamIdentifier => {
  return dispatch => {
    collectionsApiService
      .fetchAllUsersOfTeam(teamIdentifier)
      .then(response => {
        dispatch(onFetchAllUsers(response.data));
      })
      .catch(error => {
        dispatch(
          onFetchAllUsersError(error.response ? error.response.data : error)
        );
      });
  };
};

export const onFetchAllUsers = response => {
  return {
    type: teamsActionTypes.ON_FETCH_ALL_SHARED_USERS,
    response
  };
};

export const onFetchAllUsersError = error => {
  return {
    type: teamsActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR,
    error
  };
};

// export const deleteUserFromTeam = teamData => {
//   return dispatch => {
//     dispatch(deleteMemberRequest(teamData));
//     collectionsApiService
//       .deleteUserOfTeam(teamData)
//       .then(response => {
//         dispatch(onDeleteUser(response.data));
//       })
//       .catch(error => {
//         dispatch(
//           onDeleteUserError(
//             error.response ? error.response.data : error,
//             teamData
//           )
//         );
//       });
//   };
// };

// export const deleteMemberRequest = teamData => {
//   return {
//     type: teamsActionTypes.DELETE_SHARED_USERS_REQUEST,
//     teamData
//   };
// };

// export const onDeleteUser = response => {
//   return {
//     type: teamsActionTypes.ON_SHARED_USERS_DELETED,
//     response
//   };
// };

// export const onDeleteUserError = (error, teamData) => {
//   return {
//     type: teamsActionTypes.ON_SHARED_USERS_DELETED_ERROR,
//     error,
//     teamData
//   };
// };
