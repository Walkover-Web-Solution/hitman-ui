import groupsActionTypes from './groupsActionTypes'

const initialState = {}

function groupsReducer(state = initialState, action) {
  let groups = {}
  switch (action.type) {
    case groupsActionTypes.ON_GROUPS_FETCHED:
      return { ...action.groups }

    case groupsActionTypes.ON_GROUPS_FETCHED_ERROR:
      return state

    default:
      return state
  }
}

export default groupsReducer
