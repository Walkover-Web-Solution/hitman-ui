import axios from "axios";
import logger from "./logService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth from "../components/auth/authService";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    logger.log(!error);
    toast.error("An unexpected error occur");
  }
  if (error.response.status === 401) {
    toast.error("Session Expired");
    auth.logout();
    window.location = "/";
  }

  return Promise.reject(error);
});

function setJwt(jwt) {
  axios.defaults.headers.common["Authorization"] = jwt;
}

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  request: axios.request,
  patch: axios.patch,
  setJwt,
};
