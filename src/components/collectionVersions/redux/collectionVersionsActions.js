import collectionVersionsApiService from '../collectionVersionsApiService'
import versionActionTypes from './collectionVersionsActionTypes'
import store from '../../../store/store'
import { toast } from 'react-toastify'
import tabService from '../../tabs/tabService'
import indexedDbService from '../../indexedDb/indexedDbService'
export const fetchAllVersions = (orgId) => {
  return (dispatch) => {
    collectionVersionsApiService
      .getAllCollectionVersions(orgId)
      .then((response) => {
        const versions = response.data
        dispatch(onVersionsFetched(versions))
        indexedDbService.addMultipleData('versions', Object.values(response.data))
      })
      .catch((error) => {
        dispatch(onVersionsFetchedError(error.message))
      })
  }
}

export const fetchAllVersionsFromIdb = (orgId) => {
  return (dispatch) => {
    indexedDbService
      .getAllData('versions')
      .then((response) => {
        dispatch(onVersionsFetched(response))
      })
      .catch((error) => {
        dispatch(
          onVersionsFetchedError(
            error.response ? error.response.data : error
          )
        )
      })
  }
}

export const fetchVersions = (collectionId) => {
  return (dispatch) => {
    collectionVersionsApiService
      .getCollectionVersions(collectionId)
      .then((response) => {
        const versions = response.data
        dispatch(onVersionsFetched(versions))
      })
      .catch((error) => {
        dispatch(onVersionsFetchedError(error.message))
      })
  }
}

export const onVersionsFetched = (versions) => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED,
    versions
  }
}

export const onVersionsFetchedError = (error) => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED_ERROR,
    error
  }
}

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
        dispatch(
          onVersionUpdatedError(
            error.response ? error.response.data : error,
            originalVersion
          )
        )
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

export const addVersion = (newVersion, collectionId) => {
  return (dispatch) => {
    dispatch(addVersionRequest(newVersion))
    collectionVersionsApiService
      .saveCollectionVersion(collectionId, newVersion)
      .then((response) => {
        dispatch(onVersionAdded(response.data))
      })
      .catch((error) => {
        dispatch(
          onVersionAddedError(
            error.response ? error.response.data : error,
            newVersion
          )
        )
      })
  }
}

export const addVersionRequest = (newVersion) => {
  return {
    type: versionActionTypes.ADD_VERSION_REQUEST,
    newVersion
  }
}

export const onVersionAdded = (response) => {
  return {
    type: versionActionTypes.ON_VERSION_ADDED,
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

export const deleteVersion = (version, props) => {
  return (dispatch) => {
    dispatch(deleteVersionRequest(version.id))
    collectionVersionsApiService
      .deleteCollectionVersion(version.id)
      .then(() => {
        const storeData = { ...store.getState() }
        const groupIds = Object.keys(storeData.groups).filter(
          (gId) => storeData.groups[gId].versionId === version.id
        )
        const pageIds = [
          ...Object.keys(storeData.pages).filter(
            (pId) => storeData.pages[pId].versionId === version.id
          )
        ]
        let endpointIds = []

        groupIds.map(
          (gId) =>
            (endpointIds = [
              ...Object.keys(storeData.endpoints).filter(
                (eId) => storeData.endpoints[eId].groupId === gId
              ),
              ...endpointIds
            ])
        )

        endpointIds.map((eId) => tabService.removeTab(eId, props))
        pageIds.map((pId) => tabService.removeTab(pId, props))

        dispatch(onVersionDeleted({ groupIds, endpointIds, pageIds }))
      })
      .catch((error) => {
        dispatch(onVersionDeletedError(error.response, version))
      })
  }
}

export const deleteVersionRequest = (versionId) => {
  return {
    type: versionActionTypes.DELETE_VERSION_REQUEST,
    versionId
  }
}

export const onVersionDeleted = (payload) => {
  return {
    type: versionActionTypes.ON_VERSION_DELETED,
    payload
  }
}

export const onVersionDeletedError = (error, version) => {
  return {
    type: versionActionTypes.ON_VERSION_DELETED_ERROR,
    error,
    version
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
            dispatch(
              onVersionsFetchedError(
                error.response ? error.response.data : error
              )
            )
          })
      })
      .catch((error) => {
        dispatch(
          onVersionsFetchedError(error.response ? error.response.data : error)
        )
      })
  }
}

export const saveImportedVersion = (response) => {
  return {
    type: versionActionTypes.IMPORT_VERSION,
    response
  }
}

export const setAuthorizationResponses = (versionId, authResponses) => {
  return (dispatch) => {
    const originalAuthResponses = store.getState().versions[versionId]
      .authorizationResponse
    dispatch(setAuthorizationResponsesRequest(versionId, authResponses))
    collectionVersionsApiService
      .setAuthorizationResponse(versionId, authResponses)
      .then(() => {})
      .catch((error) => {
        dispatch(
          onAuthorizationResponsesError(
            error.response ? error.response.data : error,
            versionId,
            originalAuthResponses
          )
        )
      })
  }
}

export const setAuthorizationResponsesRequest = (versionId, authResponses) => {
  return {
    type: versionActionTypes.ON_AUTHORIZATION_RESPONSES_REQUEST,
    versionId,
    authResponses
  }
}

export const onAuthorizationResponsesError = (
  error,
  versionId,
  authResponses
) => {
  return {
    type: versionActionTypes.ON_AUTHORIZATION_RESPONSES_ERROR,
    error,
    versionId,
    authResponses
  }
}

export const setAuthorizationData = (versionId, data) => {
  return (dispatch) => {
    const originalAuthdata = store.getState().versions[versionId]
      .authorizationData
    dispatch(onAuthorizationDataRequest(versionId, data))
    collectionVersionsApiService
      .setAuthorizationData(versionId, data)
      .then(() => {})
      .catch((error) => {
        dispatch(
          onAuthorizationDataError(
            error.response ? error.response.data : error,
            versionId,
            originalAuthdata
          )
        )
      })
  }
}

export const onAuthorizationDataRequest = (versionId, data) => {
  return {
    type: versionActionTypes.ON_AUTHORIZATION_DATA_REQUEST,
    versionId,
    data
  }
}

export const onAuthorizationDataError = (
  error,
  versionId,
  originalAuthdata
) => {
  return {
    type: versionActionTypes.ON_AUTHORIZATION_DATA_ERROR,
    error,
    versionId,
    originalAuthdata
  }
}
