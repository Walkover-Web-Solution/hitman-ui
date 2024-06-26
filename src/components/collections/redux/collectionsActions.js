import { store } from '../../../store/store'
import collectionsApiService from '../collectionsApiService'
import collectionsActionTypes from './collectionsActionTypes'
import openApiService from '../../openApi/openApiService'
import versionActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import { onParentPageAdded } from '../../pages/redux/pagesActions'
import { toast } from 'react-toastify'
import { SESSION_STORAGE_KEY, deleteAllPagesAndTabsAndReactQueryData, operationsAfterDeletion } from '../../common/utility'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

export const fetchCollections = (orgId) => {
  return (dispatch) => {
    collectionsApiService
      .getCollections(orgId)
      .then((response) => {
        dispatch(onCollectionsFetched(response.data))
      })
      .catch((error) => {
        dispatch(onCollectionsFetchedError(error.response ? error.response.data : error))
      })
  }
}

export const onCollectionsFetched = (collections) => {
  return {
    type: collectionsActionTypes.ON_COLLECTIONS_FETCHED,
    collections
  }
}

export const onCollectionsFetchedError = (error) => {
  return {
    type: collectionsActionTypes.ON_COLLECTIONS_FETCHED_ERROR,
    error
  }
}

export const fetchCollection = (collectionId) => {
  return (dispatch) => {
    collectionsApiService
      .getCollection(collectionId)
      .then((response) => {
        dispatch(onCollectionsFetched(response.data))
      })
      .catch((error) => {
        dispatch(onCollectionsFetchedError(error.response ? error.response.data : error))
      })
  }
}

export const addCollection = (newCollection, openSelectedCollection, customCallback) => {
  newCollection.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    collectionsApiService
      .saveCollection(newCollection)
      .then((response) => {
        dispatch(onCollectionAdded(response.data))
        const inivisiblePageData = {
          page: {
            id: response.data.rootParentId,
            type: 0,
            child: [],
            collectionId: response.data.id
          }
        }
        dispatch(onParentPageAdded(inivisiblePageData))
        if (openSelectedCollection) {
          openSelectedCollection(response.data.id)
        }
        if (customCallback) {
          customCallback({ success: true, data: response.data })
        }
      })
      .catch((error) => {
        dispatch(onCollectionAddedError(error.response ? error.response.data : error, newCollection))
        if (customCallback) {
          customCallback({ success: false })
        }
      })
  }
}

export const addCollectionRequest = (newCollection) => {
  return {
    type: collectionsActionTypes.ADD_COLLECTION_REQUEST,
    newCollection
  }
}

export const onCollectionAdded = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_ADDED,
    response
  }
}

export const onCollectionAddedError = (error, newCollection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_ADDED_ERROR,
    newCollection,
    error
  }
}

export const updateCollection = (editedCollection, stopLoader, customCallback) => {
  return (dispatch) => {
    editedCollection.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
    const originalCollection = store.getState().collections[editedCollection.id]
    dispatch(updateCollectionRequest({ ...originalCollection, ...editedCollection }))
    const id = editedCollection.id
    delete editedCollection.id
    delete editedCollection.requestId
    delete editedCollection.rootParentId
    collectionsApiService
      .updateCollection(id, editedCollection)
      .then((response) => {
        dispatch(onCollectionUpdated(response.data))
        if (stopLoader) {
          stopLoader()
        }
        if (customCallback) customCallback({ success: true, data: response.data })
      })
      .catch((error) => {
        dispatch(onCollectionUpdatedError(error.response ? error.response.data : error, originalCollection))
        if (stopLoader) {
          stopLoader()
        }
        if (customCallback) customCallback({ success: false })
      })
  }
}

export const updateCollectionRequest = (editedCollection) => {
  return {
    type: collectionsActionTypes.UPDATE_COLLECTION_REQUEST,
    editedCollection
  }
}

export const onCollectionUpdated = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_UPDATED,
    response
  }
}

export const onCollectionUpdatedError = (error, originalCollection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_UPDATED_ERROR,
    error,
    originalCollection
  }
}

export const deleteCollection = (collection) => {
  collection.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    collectionsApiService
      .deleteCollection(collection.id, collection)
      .then((res) => {
        const rootParentPageId = collection.rootParentId
        deleteAllPagesAndTabsAndReactQueryData(rootParentPageId)
          .then((data) => {
            dispatch(deleteCollectionRequest(collection))
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data.pages })
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })

            // after deletion operation
            operationsAfterDeletion(data)
            toast.success('Collection deleted successfully')
          })
          .catch((error) => {
            console.error('error after getting data from deleteCollection deleteAllPagesAndTabsAndReactQueryData == ', error)
          })
      })
      .catch((error) => {
        console.error('error', error)
        dispatch(onCollectionDeletedError(error.response, collection))
      })
  }
}

export const deleteCollectionRequest = (collection) => {
  return {
    type: collectionsActionTypes.DELETE_COLLECTION_REQUEST,
    collection
  }
}

export const onCollectionDeleted = (payload) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DELETED,
    payload
  }
}

export const onCollectionDeletedError = (error, collection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DELETED_ERROR,
    error,
    collection
  }
}

// To do later
export const duplicateCollection = (collection) => {
  return (dispatch) => {
    collectionsApiService
      .duplicateCollection(collection.id)
      .then((response) => {
        dispatch(onCollectionDuplicated(response.data))
      })
      .catch((error) => {
        dispatch(onCollectionDuplicatedError(error.response ? error.response.data : error))
      })
  }
}
// To do later
export const onCollectionDuplicated = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED,
    response
  }
}
// To do later
export const onCollectionDuplicatedError = (error) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_DUPLICATED_ERROR,
    error
  }
}

export const addCustomDomain = (collectionId, domain) => {
  return (dispatch) => {
    const collection = { ...store.getState().collections[collectionId] }
    if (!collection.docProperties.domainsList) {
      collection.docProperties.domainsList = []
    }
    collection.docProperties.domainsList.push({
      domain
    })
    dispatch(updateCollectionRequest({ ...collection }))

    const id = collection.id
    delete collection.id
    collectionsApiService
      .updateCollection(id, collection)
      .then((response) => {
        dispatch(onCollectionUpdated(response.data))
      })
      .catch((error) => {
        dispatch(onCollectionUpdatedError(error.response ? error.response.data : error, collection))
      })
  }
}

export const importApi = (collection, importType, website, customCallback, defaultView) => {
  collection.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    if (importType === 'postman') {
      openApiService
        .importPostmanCollection(collection, website, defaultView)
        .then((response) => {
          dispatch(onCollectionImported(response.data))
          toast.success('Collection imported successfully')
          if (customCallback) customCallback({ success: true })
        })
        .catch((error) => {
          toast.error(error.response ? error.response.data : error)
          dispatch(onCollectionImportedError(error.response ? error.response.data : error))
          if (customCallback) customCallback({ success: false })
        })
    } else {
      openApiService
        .importApi(collection, defaultView)
        .then((response) => {
          dispatch(onCollectionImported(response?.data))
          toast.success('Collection imported successfully')
          if (customCallback) customCallback({ success: true })
        })
        .catch((error) => {
          toast.error(error.response ? error.response.data : error)
          dispatch(onCollectionImportedError(error?.response ? error?.response?.data : error))
          if (customCallback) customCallback({ success: false })
        })
    }
  }
}

export const saveImportedVersion = (response) => {
  return {
    type: versionActionTypes.IMPORT_VERSION,
    response
  }
}

export const onVersionsFetchedError = (error) => {
  return {
    type: versionActionTypes.ON_VERSIONS_FETCHED_ERROR,
    error
  }
}
// To do later
export const importCollection = (collection, customCallback) => {
  return (dispatch) => {
    dispatch(importCollectionRequest(collection))
    collectionsApiService
      .importCollection(collection.id)
      .then((response) => {
        dispatch(onCollectionImported(response.data))
        if (customCallback) customCallback({ success: true })
      })
      .catch((error) => {
        dispatch(onCollectionImportedError(error.response ? error.response.data : error, collection))
        if (customCallback) customCallback({ success: false })
      })
  }
}
// To do later
export const importCollectionRequest = (collection) => {
  return {
    type: collectionsActionTypes.IMPORT_COLLECTION_REQUEST,
    collection
  }
}
// To do later
export const onCollectionImported = (response) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_IMPORTED,
    collection: response.collection,
    pages: response.pages
  }
}
// To do later
export const onCollectionImportedError = (error, collection) => {
  return {
    type: collectionsActionTypes.ON_COLLECTION_IMPORTED_ERROR,
    collection,
    error
  }
}