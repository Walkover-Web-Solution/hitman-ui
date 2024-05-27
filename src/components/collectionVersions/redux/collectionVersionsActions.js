import collectionVersionsApiService from "../collectionVersionsApiService"
import versionActionTypes from "./collectionVersionsActionTypes"
import { toast } from "react-toastify"
import pagesActionTypes from "../../pages/redux/pagesActionTypes"
import { SESSION_STORAGE_KEY } from "../../common/utility"

export const updateVersion = (editedVersion) => {
  return (dispatch) => {
    dispatch(updateVersionRequest(editedVersion))
    const { number, host, id } = editedVersion
    collectionVersionsApiService
      .updateCollectionVersion(id, { number, host })
      .then((response) => {
        dispatch(onVersionUpdated(response.data))
      })
      .catch((error) => {
        dispatch(onVersionUpdatedError(error.response ? error.response.data : error))
      })
  }
}

export const updateVersionRequest = (editedVersion) => {
  return {
    type: versionActionTypes.UPDATE_VERSION_REQUEST,
    editedVersion
  }
}

export const onVersionUpdated = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_UPDATED,
    response
  }
}

export const onVersionUpdatedError = (error, originalVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_UPDATED_ERROR,
    error,
    originalVersion
  }
}

export const addParentPageVersion = (newVersion, pageId, customCallback) => {
  newVersion.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    collectionVersionsApiService
      .saveParentPageVersion(pageId, newVersion)
      .then((response) => {
        dispatch(onParentPageVersionAdded(response.data))
        if (customCallback) {
          customCallback(response.data)
        }
      })
      .catch((error) => {
        dispatch(onVersionAddedError(error.response ? error.response.data : error, newVersion))
      })
  }
}

export const onParentPageVersionAdded = (response) => {
  return {
    type: pagesActionTypes.ON_PARENTPAGE_VERSION_ADDED,
    response
  }
}

export const onVersionAddedError = (error, newVersion) => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED_ERROR,
    newVersion,
    error
  }
}
