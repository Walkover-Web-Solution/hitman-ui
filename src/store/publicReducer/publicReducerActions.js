import publicReducerActionTypes from "./publicReducerActionTypes"

export const currentPublishId = (payload) => {
  
  return {
    type: publicReducerActionTypes.CURRENT_PUBLISH_ID,
    payload
  }
}
