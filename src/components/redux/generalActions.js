import generalActionsTypes from './generalActionTypes'
import generalApiService from '../../services/generalApiService'

export const addCollectionAndPages = (orgId, queryParams = null) => {
  return (dispatch) => {
    let queryParamsString = `?`
    // setting query params value
    for (let key in queryParams) {
      queryParamsString += `${key}=${queryParams[key]}`
    }
    generalApiService
      .getCollectionsAndPages(orgId, queryParamsString)
      .then((response) => {
        dispatch({ type: generalActionsTypes.ADD_COLLECTIONS, data: response.data.collections })
        dispatch({ type: generalActionsTypes.ADD_PAGES, data: response.data.pages })
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
