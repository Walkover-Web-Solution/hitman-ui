import publishDocsActionTypes from './publishDocsActionTypes'

const initialState = {}

function publishDocsReducer (state = initialState, action) {
  let feedbacks = {}
  switch (action.type) {
    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED:
      feedbacks = { ...action.feedbacks }
      return feedbacks

    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED_ERROR:
      return state

    case publishDocsActionTypes.ON_SUBMIT_API_REVIEW:
      feedbacks = { ...action.feedbacks }
      return feedbacks

    case publishDocsActionTypes.ON_SUBMIT_API_REVIEW_ERROR:
      return state

    default:
      return state
  }
}

export default publishDocsReducer
