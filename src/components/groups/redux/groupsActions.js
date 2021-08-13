import store from '../../../store/store'
import groupsApiService from '../groupsApiService'
import groupsActionTypes from './groupsActionTypes'
import { toast } from 'react-toastify'
import tabService from '../../tabs/tabService'
import indexedDbService from '../../indexedDb/indexedDbService'

export const setEndpointIds = (endpointsOrder, groupId) => {
  const group = store.getState().groups[groupId]
  group.endpointsOrder = endpointsOrder
  return (dispatch) => dispatch(updateGroup(group))
}

export const updateGroupOrder = (groupsOrder, versionId) => {
  return (dispatch) => {
    const originalGroups = JSON.parse(JSON.stringify(store.getState().groups))
    dispatch(
      updateGroupOrderRequest({ ...store.getState().groups }, groupsOrder)
    )
    groupsApiService
      .updateGroupOrder(groupsOrder)
      .then(() => {
        toast.success('Postion changed successfully')
      })
      .catch((error) => {
        dispatch(
          onGroupOrderUpdatedError(
            error.response ? error.response.data : error,
            originalGroups
          )
        )
      })
  }
}

export const updateGroupOrderRequest = (groups, groupsOrder) => {
  for (let i = 0; i < groupsOrder.length; i++) {
    groups[groupsOrder[i]].position = i
  }
  return {
    type: groupsActionTypes.ON_GROUPS_ORDER_UPDATED,
    groups
  }
}

export const onGroupOrderUpdatedError = (error, groups) => {
  return {
    type: groupsActionTypes.ON_GROUPS_ORDER_UPDATED_ERROR,
    groups,
    error
  }
}

export const fetchGroups = (orgId) => {
  return (dispatch) => {
    groupsApiService
      .getAllGroups(orgId)
      .then((response) => {
        dispatch(onGroupsFetched(response.data))
        indexedDbService.clearStore('groups')
        indexedDbService.addMultipleData('groups', Object.values(response.data))
      })
      .catch((error) => {
        dispatch(
          onGroupsFetchedError(error.response ? error.response.data : error)
        )
      })
  }
}

export const fetchGroupsFromIdb = (orgId) => {
  return (dispatch) => {
    indexedDbService
      .getAllData('groups')
      .then((response) => {
        dispatch(onGroupsFetched(response))
      })
      .catch((error) => {
        dispatch(
          onGroupsFetchedError(
            error.response ? error.response.data : error
          )
        )
      })
  }
}

export const onGroupsFetched = (groups) => {
  return {
    type: groupsActionTypes.ON_GROUPS_FETCHED,
    groups
  }
}

export const onGroupsFetchedError = (error) => {
  return {
    type: groupsActionTypes.ON_GROUPS_FETCHED_ERROR,
    error
  }
}

export const addGroup = (versionId, newGroup) => {
  return (dispatch) => {
    dispatch(addGroupRequest(newGroup))
    groupsApiService
      .saveGroup(versionId, newGroup)
      .then((response) => {
        dispatch(onGroupAdded(response.data))
      })
      .catch((error) => {
        dispatch(
          onGroupAddedError(
            error.response ? error.response.data : error,
            newGroup
          )
        )
      })
  }
}

export const addGroupRequest = (newGroup) => {
  return {
    type: groupsActionTypes.ADD_GROUP_REQUEST,
    newGroup
  }
}

export const onGroupAdded = (response) => {
  return {
    type: groupsActionTypes.ON_GROUP_ADDED,
    response
  }
}

export const onGroupAddedError = (error, newGroup) => {
  return {
    type: groupsActionTypes.ON_GROUP_ADDED_ERROR,
    newGroup,
    error
  }
}

export const updateGroup = (editedGroup) => {
  return (dispatch) => {
    const originalGroup = store.getState().groups[editedGroup.id]
    const group = { ...editedGroup }
    dispatch(updateGroupRequest(editedGroup))
    const id = group.id
    delete group.id
    const { name, endpointsOrder, position } = editedGroup
    groupsApiService
      .updateGroup(id, { name, endpointsOrder, position })
      .then((response) => {
        dispatch(onGroupUpdated(response.data))
      })
      .catch((error) => {
        dispatch(
          onGroupUpdatedError(
            error.response ? error.response.data : error,
            originalGroup
          )
        )
      })
  }
}

export const updateGroupRequest = (editedGroup) => {
  return {
    type: groupsActionTypes.UPDATE_GROUP_REQUEST,
    editedGroup
  }
}

export const onGroupUpdated = (response) => {
  return {
    type: groupsActionTypes.ON_GROUP_UPDATED,
    response
  }
}

export const onGroupUpdatedError = (error, originalGroup) => {
  return {
    type: groupsActionTypes.ON_GROUP_UPDATED_ERROR,
    error,
    originalGroup
  }
}

export const deleteGroup = (group, props) => {
  return (dispatch) => {
    dispatch(deleteGroupRequest(group))
    groupsApiService
      .deleteGroup(group.id)
      .then((response) => {
        const storeData = { ...store.getState() }
        const pageIds = [
          ...Object.keys(storeData.pages).filter(
            (pId) => storeData.pages[pId].groupId === group.id
          )
        ]
        const endpointIds = [
          ...Object.keys(storeData.endpoints).filter(
            (eId) => storeData.endpoints[eId].groupId === group.id
          )
        ]

        endpointIds.map((eId) => tabService.removeTab(eId, props))
        pageIds.map((pId) => tabService.removeTab(pId, props))
        dispatch(onGroupDeleted({ endpointIds, pageIds }))
        const groups = JSON.parse(JSON.stringify(store.getState().groups))
        delete groups[group.id]
        dispatch(updateGroupOrderRequest(groups, response.data))
      })
      .catch((error) => {
        dispatch(
          onGroupDeletedError(
            error.response ? error.response.data : error,
            group
          )
        )
      })
  }
}

export const deleteGroupRequest = (group) => {
  return {
    type: groupsActionTypes.DELETE_GROUP_REQUEST,
    group
  }
}

export const onGroupDeleted = (payload) => {
  return {
    type: groupsActionTypes.ON_GROUP_DELETED,
    payload
  }
}

export const onGroupDeletedError = (error, group) => {
  return {
    type: groupsActionTypes.ON_GROUP_DELETED_ERROR,
    error,
    group
  }
}

export const duplicateGroup = (group) => {
  return (dispatch) => {
    groupsApiService
      .duplicateGroup(group.id)
      .then((response) => {
        dispatch(onGroupDuplicated(response.data))
      })
      .catch((error) => {
        toast.error(error)
      })
  }
}

export const onGroupDuplicated = (response) => {
  return {
    type: groupsActionTypes.ON_GROUP_DUPLICATED,
    response
  }
}
