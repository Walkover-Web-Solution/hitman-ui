// import store from '../../../store/store'
import publishDocsApiService from '../publishDocsApiService'
import publishDocsActionTypes from './publishDocsActionTypes'

export const fetchFeedbacks = (collectionId) => {
  return (dispatch) => {
    publishDocsApiService.getFeedbacks(collectionId)
      .then((response) => {
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

export const onSubmitApifeedback = (review, collectionId, customCallback) => {
  return (dispatch) => {
    publishDocsApiService.postFeedback(collectionId, review)
      .then(response => {
        console.log(response)
        dispatch(onSubmitApiReview(response.data))
          .catch((error) => {
            dispatch(
              onSubmitApiReviewError(
                error.response ? error.response.data : error
              )
            )
            if (customCallback) {
              customCallback({ success: false })
            }
          })
      })
  }
}

export const onSubmitApiReview = (payload) => {
  return {
    type: publishDocsActionTypes.SUBMIT_API_REVIEW,
    payload
  }
}

export const onSubmitApiReviewError = (error) => {
  return {
    type: publishDocsActionTypes.ON_SUBMIT_API_REVIEW_ERROR,
    error
  }
}
