import { ADD_COLLECTION } from "../constants/action-types";

const initialState = {
  collections: {}
};

function rootReducer(state = initialState, action) {
  if (action.type === ADD_COLLECTION) {
    return Object.assign({}, state, {
      collections: { ...state.collections, ...action.payload }
    });
  }
  return state;
}

export default rootReducer;
