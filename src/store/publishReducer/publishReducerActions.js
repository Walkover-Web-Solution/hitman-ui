import publishReducerActionTypes from './publishReducerActionTypes'

export const updatePublicEnvironment = (environmentId, variableName, currentValue) => {
  return {
    type: publishReducerActionTypes.UPDATE_PUBLIC_ENVIRONMENTS,
    payload: { environmentId, variableName, currentValue }
  }
}
