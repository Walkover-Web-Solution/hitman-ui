import cookiesActionTypes from './cookiesActionTypes'
import { toast } from 'react-toastify'

const initialState = {}

function cookiesReducer (state = initialState, action) {
  let cookies = {}
  switch (action.type) {
    case cookiesActionTypes.ON_COOKIES_FETCHED:
      return { ...action.cookies }

    case cookiesActionTypes.ON_COOKIES_FETCHED_ERROR:
      toast.error(action.error)
      return state

    case cookiesActionTypes.ADD_DOMAIN_REQUEST:
      cookies = { ...state }
      cookies[action.newDomain.requestId] = { ...action.newDomain }
      return cookies

    case cookiesActionTypes.ON_DOMAIN_ADDED:
      cookies = { ...state }
      delete cookies[action.domain.requestId]
      cookies[action.domain.id] = { ...action.domain }
      return cookies

    case cookiesActionTypes.ON_DOMAIN_ADDED_ERROR:
      toast.error(action.error)
      cookies = { ...state }
      delete cookies[action.domain.requestId]
      return cookies

    default:
      return state
  }
}

export default cookiesReducer
