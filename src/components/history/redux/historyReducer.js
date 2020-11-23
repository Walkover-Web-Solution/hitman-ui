import historyActionTyes from './historyActionTypes'

const initialState = {}

function historyReducer (state = initialState, action) {
  let newState = {}
  switch (action.type) {
    case historyActionTyes.FETCH_HISTORY_FROM_IDB:
      newState = { ...state, ...action.data }
      return newState

    case historyActionTyes.ADD_HISTORY:
      newState = { ...state }
      newState[action.data.id] = action.data
      return newState

    default:
      return state
  }
}

export default historyReducer
