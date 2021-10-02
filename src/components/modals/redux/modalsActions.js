import modalsActionTypes from './modalsActionTypes'

export const openModal = (modalType, modalData = null) => {
  return (dispatch) => {
    dispatch({
      type: modalsActionTypes.ON_OPEN_MODAL,
      payload: modalType,
      data: modalData
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
