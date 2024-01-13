import clientDataActionTypes from './clientDataActionTypes'

const initialState = {}

const clientDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case clientDataActionTypes.ADD_IS_EXPANDED:
      if (state?.[action?.payload?.id]) {
        state[action?.payload?.id] = { ...state[action?.payload?.id], ...{ isExpanded: action?.payload?.value } }
      } else state[action?.payload?.id] = { isExpanded: action?.payload?.value }
      return { ...state }

    default:
      return state
  }
}

export default clientDataReducer
