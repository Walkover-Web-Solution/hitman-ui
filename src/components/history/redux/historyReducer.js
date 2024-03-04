import { Toast } from 'react-bootstrap'
import historyActionTyes from './historyActionTypes'
import { toast } from 'react-toastify'

const initialState = {}

function historyReducer(state = initialState, action) {
  let newState = {}
  switch (action.type) {
    case historyActionTyes.FETCH_HISTORY_FROM_LOCAL:
      newState = { ...state, ...action.data }
      return newState

    case historyActionTyes.ADD_HISTORY:
      newState = { ...state }
      newState[action.data.id] = action.data
      toast.success('Task done succesfully')
      return newState

    case historyActionTyes.REMOVE_HISTORY:
      return initialState

    default:
      return state
  }
}

export default historyReducer
