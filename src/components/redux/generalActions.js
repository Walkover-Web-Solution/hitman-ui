import generalActionsTypes from './generalActionTypes'
import generalApiService from '../../services/generalApiService'
import publishReducerActionTypes from '../../store/publishReducer/publishReducerActionTypes'

export const addCollectionAndPages = (orgId, queryParams = null) => {
  return (dispatch) => {
    let queryParamsString = `?`
    // setting query params value
    for (let key in queryParams) {
      queryParamsString += `${key}=${queryParams[key]}`
      queryParamsString +='&'
    } 
    if (queryParamsString.slice(-1) === '&') {
      queryParamsString = queryParamsString.slice(0, -1);
    }
    generalApiService
      .getCollectionsAndPages(orgId, queryParamsString)
      .then((response) => {
        dispatch({ type: generalActionsTypes.ADD_COLLECTIONS, data: response.data.collections })
        dispatch({ type: generalActionsTypes.ADD_PAGES, data: response.data.pages })
        dispatch({ type: publishReducerActionTypes.ADD_PUBLIC_ENVIRONMENTS, data: response?.data?.environment })
      })
      .catch((error) => {
        dispatch({ type: generalActionsTypes.ADD_COLLECTIONS, data: {} })
        dispatch({ type: generalActionsTypes.ADD_PAGES, data: {} })
        dispatch({ type: publishReducerActionTypes.ADD_PUBLIC_ENVIRONMENTS, data: {} })
        console.error(error)
      })
  }
}
