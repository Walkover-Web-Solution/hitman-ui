import { toast } from 'react-toastify'
import { store } from '../../../store/store'
import endpointApiService from '../endpointApiService'
import endpointsActionTypes from './endpointsActionTypes'
import { getOrgId, operationsAfterDeletion, deleteAllPagesAndTabsAndReactQueryData, SESSION_STORAGE_KEY } from '../../common/utility'
import shortid from 'shortid'
import pagesActionTypes from '../../pages/redux/pagesActionTypes'
import { addChildInParent } from '../../pages/redux/pagesActions'
import { replaceTabForUntitled } from '../../tabs/redux/tabsActions'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

export const formatResponseToSend = (response) => {
  return {
    id: response.data.id,
    requestType: response.data.requestType,
    name: response.data.name,
    urlName: response.data.urlName,
    parentId: response.data.parentId,
    child: [],
    state: response.data.state,
    isPublished: response.data.isPublished,
    type: response.data.type || 4,
    versionId: response.data.versionId || null,
    collectionId: response.data.collectionId
  }
}

export const addEndpoint = (history, newEndpoint, rootParentId, customCallback, props) => {
  newEndpoint.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  const orgId = getOrgId()
  const requestId = shortid.generate()
  return (dispatch) => {
    const prevCurrentTabId = store.getState()?.tabs?.activeTabId
    endpointApiService
      .saveEndpoint(rootParentId, { ...newEndpoint, requestId })
      .then(async (response) => {
        const responseToSend = formatResponseToSend(response)
        const data = await dispatch(addChildInParent(responseToSend))
        history.push(`/orgs/${orgId}/dashboard/endpoint/${data?.payload?.id}`)
        if (props?.match?.params?.endpointId === 'new') {
          dispatch(replaceTabForUntitled(data.payload.id, prevCurrentTabId))
        }
        if (customCallback) {
          customCallback({ closeForm: true, stopLoader: true })
        }
      })
      .catch((error) => {
        dispatch(onEndpointAddedError(error.response ? error.response.data : error, newEndpoint, requestId))
        if (customCallback) {
          customCallback({ closeForm: false, stopLoader: true })
        }
      })
  }
}

export const updateEndpoint = (editedEndpoint, stopSaveLoader) => {
  return (dispatch) => {
    // const originalEndpoint = JSON.parse(JSON.stringify(store.getState().endpoints[editedEndpoint.id]))
    // dispatch(updateEndpointRequest(editedEndpoint))
    const id = editedEndpoint.id
    const updatedEndpoint = editedEndpoint
    delete updatedEndpoint.id
    delete updatedEndpoint.groupId
    endpointApiService
      .updateEndpoint(id, updatedEndpoint)
      .then((response) => {
        // dispatch(onEndpointUpdated(response.data))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
      .catch((error) => {
        // dispatch(onEndpointUpdatedError(error.response ? error.response.data : error, originalEndpoint))
        if (stopSaveLoader) {
          stopSaveLoader()
        }
      })
  }
}

export const deleteEndpoint = (endpoint) => {
  endpoint.uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return (dispatch) => {
    endpointApiService
      .deleteEndpoint(endpoint.id, endpoint)
      .then((res) => {
        deleteAllPagesAndTabsAndReactQueryData(endpoint.id)
          .then((data) => {
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data.pages })
            dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })

            // after deletion operation
            operationsAfterDeletion(data)
            toast.success('Endpoint Deleted Successfully')
          })
          .catch((error) => {
            console.error('Can not delete endpoint', error)
          })
      })
      .catch((error) => {
        dispatch(onEndpointDeletedError(error.response, endpoint))
      })
  }
}

export const duplicateEndpoint = (endpoint) => {
  return (dispatch) => {
    endpointApiService
      .duplicateEndpoint(endpoint.id)
      .then((response) => {
        const responseToSend = formatResponseToSend(response)
        dispatch(onEndpointDuplicated(responseToSend))
      })
      .catch((error) => {
        toast.error(error)
      })
  }
}

export const moveEndpoint = (endpointId, sourceGroupId, destinationGroupId) => {
  return (dispatch) => {
    dispatch(moveEndpointRequest(endpointId, sourceGroupId, destinationGroupId))

    endpointApiService.moveEndpoint(endpointId, { groupId: destinationGroupId }).then((response) => {
      dispatch(moveEndpointSuccess(response.data))
    })
  }
}

export const setAuthorizationType = (endpointId, authData) => {
  const originalAuthType = store.getState().endpoints[endpointId].authorizationType
  return (dispatch) => {
    dispatch(setAuthorizationTypeRequest(endpointId, authData))
    endpointApiService
      .setAuthorizationType(endpointId, authData)
      .then(() => {})
      .catch((error) => {
        dispatch(onAuthorizationTypeError(error.response ? error.response.data : error, endpointId, originalAuthType))
        toast.error(error)
      })
  }
}

export const setAuthorizationTypeRequest = (endpointId, authData) => {
  return {
    type: endpointsActionTypes.SET_AUTHORIZATION_TYPE_REQUEST,
    endpointId,
    authData
  }
}

export const onAuthorizationTypeError = (error, endpointId, originalAuthType) => {
  return {
    type: endpointsActionTypes.SET_AUTHORIZATION_TYPE_ERROR,
    error,
    endpointId,
    originalAuthType
  }
}

export const moveEndpointRequest = (endpointId, sourceGroupId, destinationGroupId) => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_REQUEST,
    endpointId,
    sourceGroupId,
    destinationGroupId
  }
}

export const moveEndpointSuccess = (response) => {
  return {
    type: endpointsActionTypes.MOVE_ENDPOINT_SUCCESS,
    response
  }
}

export const onEndpointAddedError = (error, newEndpoint, requestId) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_ADDED_ERROR,
    newEndpoint,
    error,
    requestId
  }
}

export const onEndpointUpdatedError = (error, originalEndpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_UPDATED_ERROR,
    error,
    originalEndpoint
  }
}

export const deleteEndpointRequest = (endpoint) => {
  return {
    type: pagesActionTypes.DELETE_ENDPOINT_REQUEST,
    endpoint
  }
}

export const onEndpointDeleted = (response) => {
  return {
    type: pagesActionTypes.ON_ENDPOINT_DELETED,
    response
  }
}

export const onEndpointDeletedError = (error, endpoint) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR,
    error,
    endpoint
  }
}

export const onEndpointDuplicated = (response) => {
  return {
    type: pagesActionTypes.ON_ENDPOINT_DUPLICATED,
    response
  }
}

export const updateEndpointOrder = (sourceEndpointIds, groupId) => {
  return (dispatch) => {
    const originalEndpoints = JSON.parse(JSON.stringify(store.getState().endpoints))
    dispatch(updateEndpointOrderRequest({ ...store.getState().endpoints }, sourceEndpointIds))
    endpointApiService
      .updateEndpointOrder(sourceEndpointIds)
      .then((response) => {
        toast.success(response.data)
      })
      .catch((error) => {
        dispatch(onEndpointOrderUpdatedError(error.response ? error.response.data : error, originalEndpoints))
      })
  }
}

export const updateEndpointOrderRequest = (endpoints, sourceEndpointIds) => {
  for (let i = 0; i < sourceEndpointIds.length; i++) {
    endpoints[sourceEndpointIds[i]].position = i
  }
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED,
    endpoints
  }
}

export const onEndpointOrderUpdatedError = (error, endpoints) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED_ERROR,
    endpoints,
    error
  }
}

export const reorderEndpoint = (sourceEndpointIds, sourceGroupId, destinationEndpointIds, destinationGroupId, endpointId) => {
  return (dispatch) => {
    const originalEndpoints = JSON.parse(JSON.stringify(store.getState().endpoints))
    dispatch(
      reorderEndpointRequest(
        { ...store.getState().endpoints },
        sourceEndpointIds,
        sourceGroupId,
        destinationEndpointIds,
        destinationGroupId,
        endpointId
      )
    )
    endpointApiService
      .updateEndpointOrder(sourceEndpointIds, sourceGroupId, destinationEndpointIds, destinationGroupId, endpointId)
      .then(() => {})
      .catch((error) => {
        dispatch(reorderEndpointError(error.response ? error.response.data : error, originalEndpoints))
      })
  }
}

export const reorderEndpointRequest = (
  endpoints,
  sourceEndpointIds,
  sourceGroupId,
  destinationEndpointIds,
  destinationGroupId,
  endpointId
) => {
  for (let i = 0; i < sourceEndpointIds.length; i++) {
    endpoints[sourceEndpointIds[i]].position = i
  }
  for (let i = 0; i < destinationEndpointIds.length; i++) {
    endpoints[destinationEndpointIds[i]].position = i
  }
  endpoints[endpointId].groupId = destinationGroupId
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED,
    endpoints
  }
}

export const reorderEndpointError = (error, endpoints) => {
  return {
    type: endpointsActionTypes.ON_ENDPOINTS_ORDER_UPDATED_ERROR,
    endpoints,
    error
  }
}
