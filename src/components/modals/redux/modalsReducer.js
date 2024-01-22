import modalsActionTypes from './modalsActionTypes'

const initialState = { activeModal: null, modalData: null, installPrompt: null, publishData: false }

function modalsReducer(state = initialState, action) {
  switch (action.type) {
    case modalsActionTypes.ON_OPEN_MODAL:
      return { ...state, activeModal: action.payload, modalData: action.data }

    case modalsActionTypes.ON_CLOSE_MODAL:
      return { ...state, activeModal: null, modalData: action.payload }

    case modalsActionTypes.ON_INSTALL_MODAL:
      return { ...state, installPrompt: action.payload }

    case modalsActionTypes.ON_PUBLISH_DOC:
      // debugger
      return { ...state, publishData: action.payload }

    default:
      return state
  }
}

export default modalsReducer
