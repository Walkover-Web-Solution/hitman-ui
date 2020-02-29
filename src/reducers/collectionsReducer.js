const initialState = {
  collections: []
};

function rootReducer(state = initialState, action) {
  console.log("called reducer", state, action);
  if (action.type === "FETCH_COLLECTIONS") {
    return Object.assign({}, state, {
      collections: action.collections
    });
  }
  if (action.type === "ADD_COLLECTION") {
    // return Object.assign(
    //   {},
    //   {
    //     collections: {
    //       ...state.collections,
    //       [action.newCollection.id]: action.newCollection
    //     }
    //   }
    // );
  }
  return state;
}

// import { ADD_ARTICLE } from "../constants/action-types";

// function rootReducer(state = initialState, action) {
//   console.log("reducer called ", state, action);
//   if (action.type === ADD_ARTICLE) {
//     return Object.assign({}, state, {
//       articles: state.articles.concat(action.payload)
//     });
//   }
//   if (action.type === "DATA_LOADED") {
//     return Object.assign({}, state, {
//       remoteArticles: state.remoteArticles.concat(action.payload)
//     });
//   }
//   console.log("state", state);
//   return state;
// }

export default rootReducer;
