import runAutomationTypes from './runAutomationTypes'
import generalApiService from '../../../../services/generalApiService'

export const runAutomations = (details, collectionId) => {
  return (dispatch) => {
    generalApiService
      .runAutomation(details)
      .then((response) => {
        dispatch(onRunAutomationCompleted(response.data, collectionId))
      })
      .catch((error) => {
        dispatch(onRunAutomationFetchedError(error.response ? error.response.data : error))
      })
  }
}

export const onRunAutomationCompleted = (data, collectionId) => {
  return {
    type: runAutomationTypes.ON_AUTOMATION_RUN,
    payload : data, 
    collectionId
  }
}

export const onRunAutomationFetchedError = (error) => {
  return {
    type: runAutomationTypes.ON_AUTOMATION_RUN_ERROR,
    error
  }
}
