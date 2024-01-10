import sidebarApiService from "../sidebarApiService"
import sidebarV2ActionTypes from "./sidebarV2ActionTypes"

export const addCollectionAndPagesInSideBar = (orgId) => {
    return (dispatch) => {
        dispatch({ type: sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_LOADING, payload: { value: true } })
        sidebarApiService.getCollectionsAndPagesForSidebar(orgId).then((response) => {
            // debugger
            console.log(123456789, response);
            dispatch({ type: sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_ON_SIDEBAR, payload: response.data })
        }).catch((error) => {
            console.log(error);
        })
        dispatch({ type: sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_LOADING, payload: { value: false } })
    }
}