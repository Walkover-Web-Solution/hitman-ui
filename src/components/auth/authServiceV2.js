import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import http from "../../services/httpService";
import { switchOrg } from "../../services/orgApiService";
import { getDataFromProxyAndSetDataToLocalStorage } from "../common/utility";
import axios from "axios";

export const tokenKey = "token";
export const profileKey = "profile";
export const orgListKey = "organisationList";
export const currentOrgKey = "currentOrganisation";
const uiURL = process.env.REACT_APP_UI_URL;
const proxyUrl = process.env.REACT_APP_PROXY_URL;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function isAdmin() {
  return { is_admin: true };
}

async function getUserData(token){
  const response = await axios.get(`${process.env.REACT_APP_PROXY_URL}/getUsers?itemsPerPage=100`, {
    headers: { proxy_auth_token: token }
  })

  if(!response){
    console.log("No User found")
  }
  return response.data?.data?.data;
}

function logout(redirectUrl = "/login") {
  // const isDesktop = process.env.REACT_APP_IS_DESKTOP
  try {
    if (getProxyToken()) {
      http
        .delete(proxyUrl + "/logout")
        .then(() => {
          logoutRedirection(redirectUrl);
        })
        .catch(() => {
          logoutRedirection(redirectUrl);
        });
    } else {
      logoutRedirection("/login");
    }
    localStorageCleanUp();
  } catch (e) {
    localStorageCleanUp();
    logoutRedirection("/login");
  }
}

function localStorageCleanUp() {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(profileKey);
  window.localStorage.removeItem(orgListKey);
}

function logoutRedirection(redirectUrl) {
  // if (isElectron()) {
  //   history.push({ pathname: '/' })
  // } else {
  const redirectUri = uiURL + redirectUrl;
  window.location = redirectUri;
  // }
}
function getCurrentUser() {
  try {
    const profile = window.localStorage.getItem(profileKey);
    const parsedProfile = JSON.parse(profile);
    const desiredData = {
      id: parsedProfile.id,
      name: parsedProfile.name,
      email: parsedProfile.email,
      created_at: parsedProfile.created_at,
      updated_at: parsedProfile.updated_at,
      is_block: parsedProfile.is_block,
    };
    return desiredData;
  } catch (ex) {
    return null;
  }
}

function getCurrentOrg() {
  try {
    const org = window.localStorage.getItem(currentOrgKey);
    return JSON.parse(org);
  } catch (ex) {
    return null;
  }
}

function getOrgList() {
  try {
    const orgs = window.localStorage.getItem(orgListKey);
    return JSON.parse(orgs);
  } catch (ex) {
    return null;
  }
}

function getProxyToken() {
  const tokenKey = "token";
  return window.localStorage.getItem(tokenKey) || "";
}

function AuthServiceV2() {
  const query = useQuery();
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const proxyAuthToken = query.get("proxy_auth_token");
        const orgId = query.get("company_ref_id") || getCurrentOrg()?.id || "";
        if (proxyAuthToken) {
          await getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken);
          const storedCurrentOrgId = window.localStorage.getItem("currentOrganisation");
          let currentOrgId;
          if (storedCurrentOrgId == null || storedCurrentOrgId == "undefined") {
            currentOrgId = orgId;
          } else {
            currentOrgId = JSON.parse(storedCurrentOrgId).id;
          }
          switchOrg(currentOrgId);
        } else {
          const redirectPath = getOrgList() ? `/orgs/${orgId}/dashboard` : "/logout";
          history.push(redirectPath);
        }
      } catch (err) {
        history.push("/logout");
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className='custom-loading-container'>
      <progress className="pure-material-progress-linear w-25"/>
    </div>
  );
}

export default AuthServiceV2;
export {
  isAdmin,
  getCurrentUser,
  getUserData,
  getCurrentOrg,
  getOrgList,
  getProxyToken,
  logout,
};
