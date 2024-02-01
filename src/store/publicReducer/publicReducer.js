import publicReducerActionTypes from "./publicReducerActionTypes";

const initialState = {
  currentPublishId: null
};

const publicReducer = (state = initialState, action) => {
  switch (action.type) {
    case publicReducerActionTypes.CURRENT_PUBLISH_ID:
      
      return {
        ...state,
        currentPublishId: action.payload
      };
    default:
      return state; // Return the original state if action type doesn't match
  }
};

export default publicReducer;
