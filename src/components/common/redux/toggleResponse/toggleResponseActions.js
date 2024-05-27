import toggleResponseActionTypes from "./toggleResponseActionTypes"

export const onResponseToggle = (type) => {
  return (dispatch) => {
    dispatch(onToggle(type))
  }
}
export const onToggle = (payload) => {
  return {
    type: toggleResponseActionTypes.ON_RESPONSE_TOGGLE,
    payload,
  }
}
// export const onChatResponseToggle = (type) => {
//   return (dispatch) => {
//     dispatch(onChatToggle(type))
//   }
// }
// export const onChatToggle = (payload) => {
//   return {
//     type: toggleResponseActionTypes.ON_ASK_RESPONSE_TOGGLE,
//     payload
//   }
// }
// export const onHistoryResponseToggle = (type) => {
//   return (dispatch) => {
//     dispatch(onHistoryToggle(type))
//   }
// }
// export const onHistoryToggle = (payload) => {
//   return {
//     type: toggleResponseActionTypes.ON_HISTORY_TOGGLE,
//     payload
//   }
// }
