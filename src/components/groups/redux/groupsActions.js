import groupsApiService from '../groupsApiService'
import groupsActionTypes from './groupsActionTypes'

export const fetchGroups = (orgId) => {
  return (dispatch) => {
    groupsApiService
      .getAllGroups(orgId)
      .then((response) => {
        dispatch(onGroupsFetched(response.data))
      })
      .catch((error) => {
        dispatch(onGroupsFetchedError(error.response ? error.response.data : error))
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
