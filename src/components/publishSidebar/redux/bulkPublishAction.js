import store from '../../../store/store'
import bulkPublishApiService from '../bulkPublishApiService'
import bulkPublishActionTypes from './bulkPublishActionTypes'

export const bulkPublish = (collectionId, data) => {
  return (dispatch) => {
    const originalEndpoints = JSON.parse(JSON.stringify(store.getState().endpoints))
    const originalPages = JSON.parse(JSON.stringify(store.getState().pages))
    const originalData = { originalEndpoints, originalPages }
    bulkPublishApiService
      .bulkPublish(collectionId, data)
      .then((response) => {
        const modifiedData = updateEndpointsData(originalEndpoints, originalPages, data)
        dispatch(onBulkPublishUpdation(modifiedData))
      })
      .catch((error) => {
        dispatch(
          onBulkPublishUpdationError(
            error.response ? error.response.data : error,
            originalData
          )
        )
      })
  }
}

export const onBulkPublishUpdation = (data) => {
  return {
    type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION,
    data
  }
}

export const onBulkPublishUpdationError = (error, originalData) => {
  return {
    type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_ERROR,
    error,
    originalData
  }
}

function updateEndpointsData (originalEndpoints, originalPages, data) {
  const updatedEndpoints = JSON.parse(JSON.stringify(originalEndpoints))
  const updatedPages = JSON.parse(JSON.stringify(originalPages))
  const { pages, endpoints } = data
  endpoints.forEach((endpointId) => {
    updatedEndpoints[endpointId].state = 'Pending'
  })

  pages.forEach((pageId) => {
    updatedPages[pageId].state = 'Pending'
  })

  return { updatedEndpoints, updatedPages }
}
