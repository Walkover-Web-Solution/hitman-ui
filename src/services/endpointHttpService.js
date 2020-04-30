import axios from "axios";
import logger from "./logService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
var endpointInstance = axios.create();

endpointInstance.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    logger.log(!error);
    toast.error("An unexpected error occur");
  }
  console.log("EndpointHttpService interceptor");
  return Promise.reject(error);
});

// function setJwt(jwt) {
//   axios.defaults.headers.common["Authorization"] = jwt;
// }

export default {
  get: endpointInstance.get,
  post: endpointInstance.post,
  put: endpointInstance.put,
  delete: endpointInstance.delete,
  request: endpointInstance.request,
  patch: endpointInstance.patch,
  //   setJwt,
};
