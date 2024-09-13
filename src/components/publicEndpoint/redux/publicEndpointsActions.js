import publicEndpointsService from '../publicEndpointsService.js'
import publicEndpointsActionTypes from './publicEndpointsActionTypes'
import publicPageService from '../publicPageService'
import { SESSION_STORAGE_KEY } from '../../common/utility.js'
import { navigateTo } from '../../../navigationService.js'
import { toast } from 'react-toastify'
import { setPublishLoader } from '../../pages/redux/pagesActions.js'

export const fetchAllPublicEndpoints = (collectionIdentifier, domain) => {
  return (dispatch) => {
    publicEndpointsService
      .fetchAll(collectionIdentifier, domain)
      .then((response) => {
        dispatch(onPublicEndpointsFetched(response.data))
      })
      .catch((error) => {
        dispatch(onPublicEndpointsFetchedError(error.response ? error.response.data : error))
        navigateTo({ pathname: '/p/error', collection: true })
      })
  }
}

export const onPublicEndpointsFetched = (data) => {
  return {
    type: publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED,
    data
  }
}

export const onPublicEndpointsFetchedError = (error) => {
  return {
    type: publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED_ERROR,
    error
  }
}

export const pendingPage = (page) => {
  return (dispatch) => {
    publicPageService
      .pendingPage(page)
      .then((response) => {
        dispatch(onPageStateSuccess(response.data))
      })
      .catch((error) => {
        dispatch(onPageStateError(error.response ? error.response.data : error))
      })
  }
}

export const approvePage = (page, publishPageLoaderHandler) => {
  return async (dispatch) => {
    try {
      dispatch(setPublishLoader(page, true))
      const response = await publicPageService.approvePage(page)

      dispatch(onPageStateSuccess(response.data))
      publishPageLoaderHandler()
      toast.success('Page published successfully')

      dispatch(setPublishLoader(page, false)) 
    } catch (error) {
      console.error('API call failed:', error)
      dispatch(onPageStateError(error.response ? error.response.data : error))
      dispatch(setPublishLoader(page, false)) 
    }
  }
}

export const draftPage = (page) => {
  return (dispatch) => {
    publicPageService
      .draftPage(page)
      .then((response) => {
        dispatch(onPageStateSuccess(response.data))
        toast.success('Page unpublished successfully')
      })
      .catch((error) => {
        dispatch(onPageStateError(error.response ? error.response.data : error))
        toast.error(error)
      })
  }
}

export const rejectPage = (page) => {
  return (dispatch) => {
    publicPageService
      .rejectPage(page)
      .then((response) => {
        dispatch(onPageStateSuccess(response.data))
      })
      .catch((error) => {
        dispatch(onPageStateError(error.response ? error.response.data : error))
      })
  }
}

export const onPageStateSuccess = (data) => {
  return {
    type: publicEndpointsActionTypes.ON_PAGE_STATE_SUCCESS,
    data
  }
}

export const onPageStateError = (error) => {
  return {
    type: publicEndpointsActionTypes.ON_PAGE_STATE_ERROR,
    error
  }
}

export const pendingEndpoint = (endpoint) => {
  return (dispatch) => {
    publicEndpointsService
      .pendingEndpoint(endpoint)
      .then((response) => {
        dispatch(onEndpointStateSuccess({ state: response.data.state, id: response.data.id, isPublished: false }))
      })
      .catch((error) => {
        dispatch(onEndpointStateError(error.response ? error.response.data : error))
      })
  }
}

export const approveEndpoint = (endpoint, publishLoaderHandler) => {
  // debugger
  dispatch(setPublishLoader(endpoint, true)) 
  const uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
  return async (dispatch) => {
    try {
      const response = await publicEndpointsService.approveEndpoint(endpoint, uniqueTabId)
      dispatch(onEndpointStateSuccess({ state: response.data.state, id: response.data.id, isPublished: true, publishLoader: false }))
    } catch (error) {
      console.error('API call failed:', error)
      dispatch(onEndpointStateError(error?.response ? error?.response?.data : error))
      // publishLoaderHandler();
    }
  }
}


// export const approveEndpoint = (endpoint, publishLoaderHandler) => {
//   const uniqueTabId = sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)
//   return (dispatch) => {
//     // dispatch(setPublishLoader(endpoint, true))
//     publicEndpointsService
//       .approveEndpoint(endpoint, uniqueTabId)
//       .then((response) => {
//         dispatch(onEndpointStateSuccess({ state: response.data.state, id: response.data.id, isPublished: true }))
//         publishLoaderHandler()
//         toast.success('Enpoint published successfully')
//         // dispatch(setPublishLoader(endpoint, false)) 
//       })
//       .catch((error) => {
//         dispatch(onEndpointStateError(error?.response ? error?.response?.data : error))
//         publishLoaderHandler()
//         toast.error(error)
//         // dispatch(setPublishLoader(endpoint, false)) 
//       })
//   }
// }

export const draftEndpoint = (endpoint) => {
  return (dispatch) => {
    publicEndpointsService
      .draftEndpoint(endpoint)
      .then((response) => {
        dispatch(onEndpointStateSuccess({ state: response.data.state, id: response.data.id, isPublished: false }))
        toast.success('Enpoint unpublished successfully')
      })
      .catch((error) => {
        dispatch(onEndpointStateError(error.response ? error.response.data : error))
        toast.error(error)
      })
  }
}

export const rejectEndpoint = (endpoint) => {
  return (dispatch) => {
    publicEndpointsService
      .rejectEndpoint(endpoint)
      .then((response) => {
        dispatch(onEndpointStateSuccess({ state: response.data.state, id: endpoint.id, isPublished: false }))
      })
      .catch((error) => {
        dispatch(onEndpointStateError(error.response ? error.response.data : error))
      })
  }
}

export const onEndpointStateSuccess = (data) => {
  return {
    type: publicEndpointsActionTypes.ON_ENDPOINT_STATE_SUCCESS,
    data
  }
}

export const onEndpointStateError = (error) => {
  return {
    type: publicEndpointsActionTypes.ON_ENDPOINT_STATE_ERROR,
    error
  }
}
