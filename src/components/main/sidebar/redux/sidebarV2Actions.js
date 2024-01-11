import sidebarApiService from "../sidebarApiService"
import sidebarV2ActionTypes from "./sidebarV2ActionTypes"

export const addCollectionAndPagesInSideBar = (orgId) => {
    return (dispatch) => {
        dispatch({ type: sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_LOADING, payload: { value: true } })
        sidebarApiService.getCollectionsAndPagesForSidebar(orgId).then((response) => {
            dispatch({ type: sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_ON_SIDEBAR, payload: response.data })
        }).catch((error) => {
            console.log(error);
        })
        dispatch({ type: sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_LOADING, payload: { value: false } })
    }
}

export const updateIsExpandInSidebar = (payload) => {
    return {
      type: sidebarV2ActionTypes.UPDATE_CLIENT_DATA_ISEXPANDED,
      payload,
    }
  }

  export const updateCollectionInSidebar = (target1,id, updatedProperties) => {
    console.log(target1,id, updatedProperties,1234567890)
    return {
      type: sidebarV2ActionTypes.UPDATE_COLLECTION_IN_SIDEBAR,
      payload: {
        target1,
        id,
        updatedProperties
      }
    };
  }
