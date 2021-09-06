import modalsActionTypes from './modalsActionTypes'

export const openModal = (modalType) => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_OPEN_MODAL,
      payload: modalType
    })
  }
}

export const closeModal = () => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_CLOSE_MODAL
    })
  }
}

export default {
  openModal,
  closeModal
}
