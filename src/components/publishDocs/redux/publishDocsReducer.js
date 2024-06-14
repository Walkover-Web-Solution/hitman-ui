import { statesEnum } from '../../common/utility'
import publishDocsActionTypes from './publishDocsActionTypes'
import _ from 'lodash'

const initialState = {}
function publishDocsReducer(state = initialState, action) {
  let feedbacks = {}
  switch (action.type) {
    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED:
      feedbacks = action.feedbacks
      return feedbacks

    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED_ERROR:
      return state

    default:
      return state
  }
}

export default publishDocsReducer
