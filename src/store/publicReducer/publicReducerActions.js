import publicReducerActionTypes from "./publicReducerActionTypes"

export const addInPublishedDataActions = (payload) => {
  return {
    type: publicReducerActionTypes.CURRENT_PUBLISH_ID,
    payload
  }
}
