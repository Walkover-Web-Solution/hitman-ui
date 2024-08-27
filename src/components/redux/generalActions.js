import { getCollectionsAndPages } from '../../api/collection/collectionApi'
import generalActionsTypes from './generalActionTypes'

export const addCollectionAndPages = (orgId, queryParams = null) => {
  return (dispatch) => {
    let queryParamsString = `?`
    // setting query params value
    for (let key in queryParams) {
      queryParamsString += `${key}=${queryParams[key]}`
      queryParamsString += '&'
    }
    if (queryParamsString.slice(-1) === '&') {
      queryParamsString = queryParamsString.slice(0, -1);
    }
    getCollectionsAndPages(queryParamsString)
      .then((response) => {
        dispatch({ type: generalActionsTypes.ADD_COLLECTIONS, data: response.data.collections })
        dispatch({ type: generalActionsTypes.ADD_PAGES, data: response.data.pages })
      })
      .catch((error) => {
        dispatch({ type: generalActionsTypes.ADD_COLLECTIONS, data: {} })
        dispatch({ type: generalActionsTypes.ADD_PAGES, data: {} })
        console.error(error)
      })
  }
}
