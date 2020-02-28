import { GET_COLLECTIONS } from "../constants/action-types";

const initialState = {
  collections: {}
};

function rootReducer(state = initialState, action) {
  if (action.type === GET_COLLECTIONS) {
    return Object.assign({}, state, {
      collections: action.collections
    });
  }
  return state;
}

export default rootReducer;
