import clientDataActionTypes from './clientDataActionTypes'

const initialState = {
  collectionToPublish: '',
  publishDataForCollections : {}
}

const clientDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case clientDataActionTypes.ADD_IS_EXPANDED:
      if (state?.[action?.payload?.id]) {
        state[action?.payload?.id] = { ...state[action?.payload?.id], ...{ isExpanded: action?.payload?.value } }
      } else state[action?.payload?.id] = { isExpanded: action?.payload?.value }
      return { ...state }

    case clientDataActionTypes.DEFAULT_VERSION_ID:
      if (state?.[action?.payload?.rootId]) {
        state[action?.payload?.rootId] = {
          ...state[action?.payload?.rootId],
          selectedVersionId: action?.payload?.value || '',
          defaultVersionId: action?.payload?.defaultVersionId || '',
          defaultVersionName: action?.payload?.defaultVersionName || '',
          selectedVersionName: action?.payload?.selectedVersionName || ''
        }
      } else state[action?.payload?.id] = { defaultVersion: action?.payload?.value }
      return { ...state }

    case clientDataActionTypes.UPDATE_FOR_ISPUBLISH:
      if (!state[action.payload.id]) state[action.payload.id] = {}
      state[action.payload.id] = { ...state[action.payload.id], checkedForPublished: action.payload.isChecked }
      return { ...state }

    case clientDataActionTypes.SET_COLLECTION_ID_FOR_PUBLISH:
      state['collectionToPublish'] = action.payload.collectionId
      return { ...state }
    default:
      return state
  }
}

export default clientDataReducer
