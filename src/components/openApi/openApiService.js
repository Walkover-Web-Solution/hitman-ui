import { apiUrl } from "../../config.json";
import http from "../../services/httpService";
import authService from "../auth/authService";

export function importApi(openApiObject) {
  let user = authService.getCurrentUser();
  let userId = user.user.identifier;
  return http.post(`${apiUrl}/import/openApi/${userId}`, openApiObject);
}

export default {
  importApi,
};
