import endpointsActionTypes from './endpointsActionTypes'
import { toast } from 'react-toastify'
import versionActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import collectionActionTypes from '../../collections/redux/collectionsActionTypes'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

const initialState = {}

function endpointsReducer(state = initialState, action) {
  let endpoints = {}
  switch (action.type) {
    case endpointsActionTypes.SET_AUTHORIZATION_TYPE_REQUEST:
      state[action.endpointId].authorizationType = action.authData
      return {
        ...state
      }

    case endpointsActionTypes.SET_AUTHORIZATION_TYPE_ERROR:
      state[action.versionId].authorizationType = action.originalAuthType
      return state

    case endpointsActionTypes.MOVE_ENDPOINT_REQUEST:
      endpoints = { ...state }
      endpoints[action.endpointId].groupId = action.destinationGroupId
      return endpoints

    case endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalEndpoint.id]: action.originalEndpoint
      }

    case endpointsActionTypes.DELETE_ENDPOINT_REQUEST:
      endpoints = { ...state }
      delete endpoints[action.endpoint.id]
      return endpoints

    case endpointsActionTypes.ON_ENDPOINT_DELETED:
      return state

    case endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR:
      toast.error(action.error.data)
      if (action.error.status === 404) return state
      return {
        ...state,
        [action.endpoint.id]: action.endpoint
      }

    case endpointsActionTypes.ON_ENDPOINT_DUPLICATED:
      return { ...state, [action.response.id]: action.response }

    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.endpoints }

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.endpoints }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...action.data.endpoints }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED_ERROR:
      toast.error(action.error)
      return state

    case publicEndpointsActionTypes.ON_ENDPOINT_STATE_ERROR:
      toast.error(action.error)
      return { ...state }

    case collectionActionTypes.ON_COLLECTION_DELETED:
    case versionActionTypes.ON_VERSION_DELETED:
      endpoints = { ...state }
      action.payload.endpointIds.forEach((eId) => {
        delete endpoints[eId]
      })
      return endpoints

    case endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED:
      endpoints = { ...action.endpoints }
      return endpoints

    case endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED_ERROR:
      toast.error(action.error)
      endpoints = { ...action.endpoints }
      return endpoints

    case bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION:
      endpoints = { ...action.data.updatedEndpoints }
      return endpoints

    case bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_ERROR:
      endpoints = { ...action.originalData.originalEndpoints }
      return endpoints

    default:
      return state
  }
}

export default endpointsReducer
