// import {store} from '../../../store/store'
import publishDocsApiService from '../publishDocsApiService'
import publishDocsActionTypes from './publishDocsActionTypes'

export const fetchFeedbacks = (collectionId, orgId) => {
  return (dispatch) => {
    publishDocsApiService
      .getFeedbacks(collectionId, orgId)
      .then((response) => {
        dispatch(onFeedbacksFetched(response.data))
      })
      .catch((error) => {
        dispatch(onFeedbacksFetchedError(error.response ? error.response.data : error))
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

export const onDefaultVersion = (orgId,versionData) => {
  console.log("inside onDefault versionnnn",versionData);
  return (dispatch) =>{
    publishDocsApiService
    .setDefaultVersion(orgId,versionData)
    .then((response)=>{
      dispatch(onSetDefaultVersion(response.data))
    })
    .catch((error)=>{
      dispatch(onSetDefaultVersionError(error.response ? error.response.data : error))
    })
  }
}
export const onSetDefaultVersion = (versionData) => {
  console.log("inside on set dfault versionnnnn", versionData);
  return {
    type: publishDocsActionTypes.ON_DEFAULT_VERSION,
    versionData
  }
}
export const onSetDefaultVersionError = (error) => {
  return {
    type: publishDocsActionTypes.ON_DEFAULT_VERSION_ERROR,
    error
  }
}