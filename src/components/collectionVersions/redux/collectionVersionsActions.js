import collectionVersionsApiService from '../collectionVersionsApiService'
import versionActionTypes from './collectionVersionsActionTypes'
import { store } from '../../../store/store'
import { toast } from 'react-toastify'
import tabService from '../../tabs/tabService'
import { sendAmplitudeData } from '../../../services/amplitude'
import pagesActionTypes from '../../pages/redux/pagesActionTypes'

export const updateVersion = (editedVersion) => {
  return (dispatch) => {
    const originalVersion = store.getState().versions[editedVersion.id]
    dispatch(updateVersionRequest(editedVersion))
    const { number, host, id } = editedVersion
    collectionVersionsApiService
      .updateCollectionVersion(id, { number, host })
      .then((response) => {
        dispatch(onVersionUpdated(response.data))
      })
      .catch((error) => {
        dispatch(onVersionUpdatedError(error.response ? error.response.data : error, originalVersion))
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
        sendAmplitudeData('Version created', {
          versionId: response.data.id,
          versionNumber: response.data.number,
          pageId: response.data.pageId
        })
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

export const onVersionDuplicated = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_DUPLICATED,
    response
  }
}
export const importVersion = (importLink, shareIdentifier, collectionId) => {
  return (dispatch) => {
    collectionVersionsApiService
      .exportCollectionVersion(importLink, shareIdentifier)
      .then((response) => {
        response.data.collectionId = collectionId
        collectionVersionsApiService
          .importCollectionVersion(importLink, shareIdentifier, response.data)
          .then((response) => {
            dispatch(saveImportedVersion(response.data))
          })
          .catch((error) => {
            dispatch(onVersionImportError(error.response ? error.response.data : error))
          })
      })
      .catch((error) => {
        dispatch(onVersionImportError(error.response ? error.response.data : error))
      })
  }
}

export const onVersionImportError = (error) => {
  return {
    type: versionActionTypes.ON_VERSION_IMPORT_ERROR,
    error
  }
}

export const saveImportedVersion = (response) => {
  return {
    type: versionActionTypes.IMPORT_VERSION,
    response
  }
}