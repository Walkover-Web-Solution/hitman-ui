import clientDataActionTypes from './clientDataActionTypes'

export const addIsExpandedAction = (payload) => {
  return {
    type: clientDataActionTypes.ADD_IS_EXPANDED,
    payload
  }
}
