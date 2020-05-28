import { apiUrl } from "../../config.json";
import http from "../../services/httpService";

export function importApi(openApiObject) {
  console.log("importApi", openApiObject);
  return http.post(`${apiUrl}/import/openApi`, openApiObject);
}

export default {
  importApi,
};
