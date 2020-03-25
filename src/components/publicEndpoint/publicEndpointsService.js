import http from "../../services/httpService";
import { apiUrl } from "../../config.json";

export function fetchAll(collectionIdentifier) {
  return http.get(`${apiUrl}/public/${collectionIdentifier}`);
}

export default {
  fetchAll
};
