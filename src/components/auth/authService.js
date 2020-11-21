import jwtDecode from "jwt-decode";
import http from "../../services/httpService";

const apiEndpoint = process.env.REACT_APP_API_URL + "/profile";
const tokenKey = "token";
const profileKey = "profile";
const orgKey = "organisation";

http.setJwt(`Bearer ${getJwt()}`);

export async function login(socketJwt) {
  const { data: userInfo } = await http.request({
    url: apiEndpoint,
    method: "GET",
    headers: {
      Authorization: `Bearer ${socketJwt}`,
    },
  });
  localStorage.setItem(tokenKey, socketJwt);
  localStorage.setItem(profileKey, JSON.stringify(userInfo.profile));
  localStorage.setItem(orgKey, JSON.stringify(userInfo.orgs[0]));
  http.setJwt(`Bearer ${socketJwt}`);
  return userInfo
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(profileKey);
  localStorage.removeItem(orgKey);
}

export function getCurrentUser() {
  try {
    const profile = localStorage.getItem(profileKey);
    return JSON.parse(profile)
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
};
