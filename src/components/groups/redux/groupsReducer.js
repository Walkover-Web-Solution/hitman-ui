import groupsActionTypes from './groupsActionTypes'
import endpointsActionTypes from '../../endpoints/redux/endpointsActionTypes'
import { toast } from 'react-toastify'
import versionActionTypes from '../../collectionVersions/redux/collectionVersionsActionTypes'
import collectionActionTypes from '../../collections/redux/collectionsActionTypes'
import publicEndpointsActionTypes from '../../publicEndpoint/redux/publicEndpointsActionTypes'

const initialState = {}

function groupsReducer(state = initialState, action) {
  let groups = {}
  switch (action.type) {
    case endpointsActionTypes.MOVE_ENDPOINT_REQUEST:
      groups = { ...state }
      groups[action.sourceGroupId].endpointsOrder = groups[action.sourceGroupId].endpointsOrder.filter((eId) => eId !== action.endpointId)
      if (!groups[action.destinationGroupId].endpointsOrder.includes(action.endpointId)) {
        groups[action.destinationGroupId].endpointsOrder.push(action.endpointId)
      }
      return groups

    case groupsActionTypes.ON_GROUPS_FETCHED:
      return { ...action.groups }

    case groupsActionTypes.ON_GROUPS_FETCHED_ERROR:
      return state

    case groupsActionTypes.ADD_GROUP_REQUEST:
      return {
        ...state,
        [action.newGroup.requestId]: action.newGroup
      }

    case groupsActionTypes.ON_GROUP_ADDED:
      groups = { ...state }
      delete groups[action.response.requestId]
      groups[action.response.id] = action.response
      return groups

    case groupsActionTypes.ON_GROUP_ADDED_ERROR:
      toast.error(action.error)
      groups = { ...state }
      delete groups[action.newGroup.requestId]
      return groups

    case groupsActionTypes.UPDATE_GROUP_REQUEST:
      return {
        ...state,
        [action.editedGroup.id]: action.editedGroup
      }

    case groupsActionTypes.ON_GROUP_UPDATED:
      return state

    case groupsActionTypes.ON_GROUP_UPDATED_ERROR:
      toast.error(action.error)
      return {
        ...state,
        [action.originalGroup.id]: action.originalGroup
      }

    case groupsActionTypes.DELETE_GROUP_REQUEST:
      groups = { ...state }
      delete groups[action.group.id]
      return groups

    case groupsActionTypes.ON_GROUP_DELETED:
      return state

    case groupsActionTypes.ON_GROUP_DELETED_ERROR:
      toast.error(action.error.data)
      if (action.error.status === 404) return state
      return {
        ...state,
        [action.group.id]: action.group
      }

    case groupsActionTypes.ON_GROUP_DUPLICATED: {
      groups = { ...state }
      const group = action.response.group
      groups = { ...groups, [group.id]: group }
      return groups
    }

    case versionActionTypes.ON_VERSION_DUPLICATED:
      return { ...state, ...action.response.groups }

    case collectionActionTypes.ON_COLLECTION_DUPLICATED:
      return { ...state, ...action.response.groups }

    case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
      return { ...state, ...action.data.groups }


    case groupsActionTypes.ON_GROUPS_ORDER_UPDATED:
      groups = { ...action.groups }
      return groups

    case groupsActionTypes.ON_GROUPS_ORDER_UPDATED_ERROR:
      toast.error(action.error)
      groups = { ...action.groups }
      return groups

    default:
      return state
  }
}

export default groupsReducer
