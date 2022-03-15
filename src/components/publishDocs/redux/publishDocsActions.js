// import store from '../../../store/store'
import publishDocsApiService from '../publishDocsApiService'
import publishDocsActionTypes from './publishDocsActionTypes'

export const fetchFeedbacks = (collectionId) => {
  return (dispatch) => {
    publishDocsApiService.getFeedbacks(collectionId)
      .then((response) => {
        console.log(response.data)
        dispatch(onFeedbacksFetched(response.data))
      })
      .catch((error) => {
        dispatch(
          onFeedbacksFetchedError(
            error.response ? error.response.data : error
          )
        )
      })
  }
}

export const onFeedbacksFetched = (feedbacks) => {
  return {
    type: publishDocsActionTypes.ON_FEEDBACKS_FETCHED,
    feedbacks
  }
}

export const onFeedbacksFetchedError = (error) => {
  return {
    type: publishDocsActionTypes.ON_FEEDBACKS_FETCHED_ERROR,
    error
  }
}
