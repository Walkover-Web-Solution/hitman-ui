import cookiesApiService from '../cookiesApiService'
import cookiesActionTypes from './cookiesActionTypes'

export const fetchAllCookies = (data) => {
  return (dispatch) => {
    dispatch(addDomainRequest(data))
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
        dispatch(onDomainAdded(response.data, data))
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
