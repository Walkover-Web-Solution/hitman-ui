import teamActionTypes from "./teamsActionTypes";

const initialState = {};

function teamsReducer(state = initialState, action) {
  let team = {};
  switch (action.type) {
    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS:
      return { ...action.response };

    case teamActionTypes.ON_FETCH_ALL_SHARED_USERS_ERROR:
      return { ...action.response };

    // case teamActionTypes.ON_COLLECTION_SHARED:

    //   const sharedCollection = action.sharedCollection;
    //   team = { ...state };
    //   for (let i = 0; i < sharedCollection.length; i++) {
    //     if (sharedCollection[i].id !== null) {
    //       if (sharedCollection[i].deleteFlag === true) {
    //         delete team[Object.keys(action.response)[0]];
    //       } else {
    //       }
    //     } else {
    //     }
    //   }

    //   return team;
    // case teamActionTypes.ON_COLLECTION_SHARED_ERROR:

    // case teamActionTypes.DELETE_SHARED_USERS_REQUEST:
    //   teams = { ...state };
    //   delete teams[action.userId];
    //   return teams;

    // case teamActionTypes.ON_SHARED_USERS_DELETED:
    //   return state;

    // case teamActionTypes.ON_SHARED_USERS_DELETED_ERROR:
    //   if (action.error.status === 404) return state;
    //   return {
    //     ...state,
    //     [action.teams.userId]: action.teamData
    //   };

    default:
      return state;
  }
}

export default teamsReducer;
