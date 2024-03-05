import collectionVersionsApiService from '../collectionVersionsApiService'
import versionActionTypes from './collectionVersionsActionTypes'
import { toast } from 'react-toastify'
import pagesActionTypes from '../../pages/redux/pagesActionTypes'
import { showToast } from '../../common/utility'

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
  return (dispatch) => {
    dispatch(addVersionRequest({ ...newVersion, pageId }))
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

export const addVersionRequest = (newVersion) => {
  showToast("Version added successfully")
  return {
    type: pagesActionTypes.ADD_VERSION_REQUEST,
    newVersion
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
// To do later
export const duplicateVersion = (version) => {
  return (dispatch) => {
    collectionVersionsApiService
      .duplicateVersion(version.id)
      .then((response) => {
        dispatch(onVersionDuplicated(response.data))
      })
      .catch((error) => {
        toast.error(error)
      })
  }
}
// To do later
export const onVersionDuplicated = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_DUPLICATED,
    response
  }
}
