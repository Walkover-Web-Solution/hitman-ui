import modalsActionTypes from './modalsActionTypes'

const initialState = { activeModal: null, modalData: null }

function modalsReducer (state = initialState, action) {
  switch (action.type) {
    case modalsActionTypes.ON_OPEN_MODAL:
      return { activeModal: action.payload, modalData: action.data }

    case modalsActionTypes.ON_CLOSE_MODAL:
      return { activeModal: null, modalData: null }

    default:
      return state
  }
}

export default modalsReducer
