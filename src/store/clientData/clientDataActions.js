import clientDataActionTypes from './clientDataActionTypes'

export const addIsExpandedAction = (payload) => {
  return {
    type: clientDataActionTypes.ADD_IS_EXPANDED,
    payload
  }
}

export const setDefaultversionId = (payload) => {
  return {
    type: clientDataActionTypes.DEFAULT_VERSION_ID,
    payload
  }
}
