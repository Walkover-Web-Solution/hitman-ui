import http from "../../services/httpService";
import httpService from "../../services/endpointHttpService";

import { apiUrl } from "../../config.json";

export function getConfigVars() {
  return httpService.request({
    url: `https://api.heroku.com/apps/hitman-ui/config-vars`,
    method: "GET",
    headers: {
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export function updateConfigVars(variablesJson) {
  return httpService.request({
    url: `https://api.heroku.com/apps/hitman-ui/config-vars`,
    method: "PATCH",
    body: variablesJson,
    headers: {
      "Content-Type": "application / json",
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export function createDomain(domainName) {
  return httpService.request({
    url: `https://api.heroku.com/apps/hitman-ui/domains`,
    method: "POST",
    body: { hostname: domainName },
    headers: {
      "Content-Type": "application / json",
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export function deleteDomain(domainName) {
  return httpService.request({
    url: `https://api.heroku.com/apps/hitman-ui/domains/${domainName}`,
    method: "DELETE",
    headers: {
      "Content-Type": "application / json",
      Accept: " application/vnd.heroku+json; version=3",
      Authorization: `Bearer ${herokuToken}`,
    },
  });
}

export default {};
