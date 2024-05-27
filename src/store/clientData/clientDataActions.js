import clientDataActionTypes from "./clientDataActionTypes"

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

export const updataForIsPublished = (payload) => {
  return {
    type: clientDataActionTypes.UPDATE_FOR_ISPUBLISH,
    payload
  }
}

export const updateCollectionIdForPublish = (payload) => {
  return {
    type: clientDataActionTypes.SET_COLLECTION_ID_FOR_PUBLISH,
    payload
  }
}
