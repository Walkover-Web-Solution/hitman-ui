import publicReducerActionTypes from "./publicReducerActionTypes"

const initialState = {
  currentPublishId : ''
}

const publishReducer = (state = initialState, action) => {
  switch (action.type) {
    case publicReducerActionTypes.CURRENT_PUBLISH_ID:
      return { ...action.currentPublishId }
    default:
      break
  }
}

export default publishReducer
