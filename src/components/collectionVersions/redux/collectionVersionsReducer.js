import versionActionTypes from './collectionVersionsActionTypes'
import collectionsActionTypes from '../../collections/redux/collectionsActionTypes'
import { toast } from 'react-toastify'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'

const initialState = {}

function versionsReducer (state = initialState, action) {
  let versions = {}

  switch (action.type) {
    case versionActionTypes.ON_AUTHORIZATION_DATA_REQUEST:
      state[action.versionId].authorizationData = action.data
      return {
        ...state
      }

    case versionActionTypes.ON_AUTHORIZATION_DATA_ERROR:
      state[action.versionId].authorizationData = action.originalAuthdata
      return {
        ...state
      }

    case versionActionTypes.ON_AUTHORIZATION_RESPONSES_REQUEST:
      state[action.versionId].authorizationResponse = action.authResponses
      return {
        ...state
      }

    case versionActionTypes.ON_AUTHORIZATION_RESPONSES_ERROR:
      state[action.versionId].authorizationResponse = action.authResponses
      toast.error(action.error)
      return {
        ...state
      }

    case versionActionTypes.ON_VERSIONS_FETCHED:
      return { ...action.versions }

    case versionActionTypes.ON_VERSIONS_FETCHED_ERROR:
      return state

    case versionActionTypes.UPDATE_VERSION_REQUEST:
      return {
        ...state,
        [action.editedVersion.id]: action.editedVersion
      }

    case versionActionTypes.ON_VERSION_UPDATED:
      return {
        ...state,
        [action.response.id]: action.response
      }

    case versionActionTypes.ON_VERSION_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalVersion.id]: action.originalVersion
      }
    case versionActionTypes.ADD_VERSION_REQUEST:
      return {
        ...state,
        [action.newVersion.requestId]: action.newVersion
      }

    case versionActionTypes.ON_VERSION_ADDED: {
      versions = { ...state }
      delete versions[action.response.requestId]
      const versionData = { ...action.response }
      delete versionData.requestId
      versions[action.response.id] = versionData
      return versions
    }
    case versionActionTypes.ON_VERSION_ADDED_ERROR:
      toast.error(action.error)
      versions = { ...state }
      delete versions[action.newVersion.requestId]
      return versions

    case versionActionTypes.DELETE_VERSION_REQUEST:
      versions = { ...state }
      delete versions[action.versionId]
      return versions

    case versionActionTypes.ON_VERSION_DELETED:
      return state

    case versionActionTypes.ON_VERSION_DELETED_ERROR:
      toast.error(action.error.data)
      if (action.error.status === 404) return state
      return {
        ...state,
        [action.version.id]: action.version
      }
    case versionActionTypes.ON_VERSION_DUPLICATED: {
      versions = { ...state }
      const version = action.response.version
      versions = { ...versions, [version.id]: version }
      return versions
    }

    case collectionsActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.versions }

    case versionActionTypes.IMPORT_VERSION:
      return {
        ...state,
        [action.response.version.id]: action.response.version
      }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...state, ...action.data.versions }

    case collectionsActionTypes.ON_COLLECTION_DELETED:
      versions = { ...state }
      action.payload.versionIds.forEach((vId) => {
        delete versions[vId]
      })
      return versions

    case collectionsActionTypes.ON_COLLECTION_IMPORTED:
      versions = { ...state, ...action.response.versions }
      return versions

    default:
      return state
  }
}

export default versionsReducer
