import axios from 'axios'
import logger from './logService'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import auth from '../components/auth/authService'
import history from '../history'

axios.defaults.baseURL = process.env.REACT_APP_API_URL

const instance = axios.create()
instance.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500

  if (error.response.config.method === 'get' && error.response.status === 404) {
    history.push({
      pathname: '/404_PAGE',
      error: error
    })
  }

  if (error.response.config.method === 'get' && error.response.status === 403) {
    history.push({
      pathname: '/403_PAGE',
      error: error
    })
  }

  if (!expectedError) {
    logger.log(!error)
    toast.error('An unexpected error occur')
  }
  if (error?.response?.status === 401) {
    toast.error('Session Expired')
    auth.logout(window.location.pathname)
  }
  return Promise.reject(error)
})

function setJwt (jwt) {
  instance.defaults.headers.common.Authorization = jwt
}

export default {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  delete: instance.delete,
  request: instance.request,
  patch: instance.patch,
  setJwt
}
