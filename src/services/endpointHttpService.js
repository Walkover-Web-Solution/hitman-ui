import axios from 'axios'
import logger from './logService'
import 'react-toastify/dist/ReactToastify.css'

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
const endpointInstance = axios.create()

endpointInstance.interceptors.response.use(null, (error) => {
  const expectedError =
    (error.response &&
    error.response.status >= 400 &&
    error.response.status < 500) || axios.isCancel(error)
  if (!expectedError) {
    logger.log(!error)
  }
  return Promise.reject(error)
})

export default {
  get: endpointInstance.get,
  post: endpointInstance.post,
  put: endpointInstance.put,
  delete: endpointInstance.delete,
  request: endpointInstance.request,
  patch: endpointInstance.patch
}
