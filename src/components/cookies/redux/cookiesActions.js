import cookiesApiService from '../cookiesApiService'
import cookiesActionTypes from './cookiesActionTypes'

export const fetchAllCookies = () => {
  return (dispatch) => {
    cookiesApiService
      .getAllCookies()
      .then((response) => {
        dispatch(onCookiesFetched(response.data))
      }).catch((error) => {
        dispatch(onCookiesFetchedError(error.response ? error.response.data : error))
      })
  }
}

export const onCookiesFetched = (cookies) => {
  return {
    type: cookiesActionTypes.ON_COOKIES_FETCHED,
    cookies
  }
}

export const onCookiesFetchedError = (error) => {
  return {
    type: cookiesActionTypes.ON_COOKIES_FETCHED_ERROR,
    error
  }
}

export const addCookieDomain = (data) => {
  return (dispatch) => {
    dispatch(addDomainRequest(data))
    cookiesApiService
      .addDomain(data)
      .then((response) => {
        dispatch(onDomainAdded(response.data))
      }).catch((error) => {
        dispatch(onDomainAddedError(error.response ? error.response.data : error, data))
      })
  }
}

export const addDomainRequest = (newDomain) => {
  return {
    type: cookiesActionTypes.ADD_DOMAIN_REQUEST,
    newDomain
  }
}

export const onDomainAdded = (domain) => {
  return {
    type: cookiesActionTypes.ON_DOMAIN_ADDED,
    domain
  }
}

export const onDomainAddedError = (error, domain) => {
  return {
    type: cookiesActionTypes.ON_DOMAIN_ADDED_ERROR,
    domain,
    error
  }
}

export const updateCookies = (data) => {
  return (dispatch) => {
    dispatch(updateCookieRequest(data))
    cookiesApiService
      .updateDomain(data.id, data)
      .then((response) => {
        dispatch(onCookiesUpdated(response.data))
      }).catch((error) => {
        dispatch(onCookiesUpdateError(error.response ? error.response.data : error, data))
      })
  }
}

export const updateCookieRequest = (cookiesData) => {
  return {
    type: cookiesActionTypes.ON_COOKIES_UPDATE_REQUEST,
    cookiesData
  }
}

export const onCookiesUpdated = (updatedData) => {
  return {
    type: cookiesActionTypes.ON_COOKIES_UPDATED,
    updatedData
  }
}

export const onCookiesUpdateError = (error, originalData) => {
  return {
    type: cookiesActionTypes.ON_COOKIES_UPDATE_ERROR,
    originalData,
    error
  }
}

export const deleteDomain = (data) => {
  return (dispatch) => {
    dispatch(deleteDomainRequest(data))
    cookiesApiService
      .deleteDomain(data.id)
      .then((response) => {
        dispatch(onDomainDeleted(response.data))
      }).catch((error) => {
        dispatch(onDomainDeleteError(error.response ? error.response.data : error, data))
      })
  }
}

export const deleteDomainRequest = (domain) => {
  return {
    type: cookiesActionTypes.ON_DOMAIN_DELETE_REQUEST,
    domain
  }
}

export const onDomainDeleted = (domain) => {
  return {
    type: cookiesActionTypes.ON_DOMAIN_DELETED,
    domain
  }
}

export const onDomainDeleteError = (error, domain) => {
  return {
    type: cookiesActionTypes.ON_DOMAIN_DELETE_ERROR,
    domain,
    error
  }
}
