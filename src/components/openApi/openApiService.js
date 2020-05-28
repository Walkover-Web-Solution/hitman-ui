import { apiUrl } from "../../config.json";
import http from "../../services/httpService";
import authService from "../auth/authService";

export function importApi(openApiObject) {
  let user = authService.getCurrentUser();
  let userId = user.user.identifier;
  // console.log("importApi", openApiObject, user.user.identifier);
  return http.post(`${apiUrl}/import/openApi/${userId}`, openApiObject);
  // return http.post(
  //   `${apiUrl}/import/openApi`,
  //   openApiObject,
  //   user.user.identifier
  // );
}

export default {
  importApi,
};
