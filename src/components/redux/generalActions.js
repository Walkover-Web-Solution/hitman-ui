import generalActionsTypes from './generalActionTypes'
import generalApiService from '../../services/generalApiService'

export const addCollectionAndPages = (orgId) => {
  return (dispatch) => {
    generalApiService
      .getCollectionsAndPages(orgId)
      .then((response) => {
        dispatch({ type: generalActionsTypes.ADD_COLLECTIONS, data: response.data.collections })
        dispatch({ type: generalActionsTypes.ADD_PAGES, data: response.data.pages })
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
