import publicReducerActionTypes from './publicReducerActionTypes'

export const currentPublishId = (payload) => {
  // debugger
  return {
    type: publicReducerActionTypes.CURRENT_PUBLISH_ID,
    payload
  }
}
