import runAutomationTypes from './runAutomationTypes'
import generalApiService from '../../../../services/generalApiService'

export const runAutomations = (details) => {
  return (dispatch) => {
    generalApiService
      .runAutomation(details)
      .then((response) => {
        dispatch(onRunAutomationCompleted(response.data))
      })
      .catch((error) => {
        dispatch(onRunAutomationFetchedError(error.response ? error.response.data : error))
      })
  }
}

export const onRunAutomationCompleted = (data) => {
  return {
    type: runAutomationTypes.ON_AUTOMATION_RUN,
    payload : data
  }
}

export const onRunAutomationFetchedError = (error) => {
  return {
    type: runAutomationTypes.ON_AUTOMATION_RUN_ERROR,
    error
  }
}
