"use client"; 

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { switchOrg } from "@/services/orgApiService";
import axios from "axios";
import { setCurrentorganization, setOrganizationList } from "./redux/organizationRedux/organizationAction";
import { store } from "../../store/store";
import { setCurrentUser } from "./redux/usersRedux/userAction";

export const tokenKey = "token";
export const profileKey = "profile";
const uiURL = process.env.NEXT_PUBLIC_NEXT_UI_URL;
const proxyUrl = process.env.NEXT_PUBLIC_NEXT_PROXY_URL;

function isAdmin() {
  return { is_admin: true };
}

async function getUserData(token) {
  try {
    const response = await axios.get(`${proxyUrl}/getUsers?itemsPerPage=100`, {
      headers: { proxy_auth_token: token },
    });
    return response?.data?.data?.data;
  } catch (e) {
    localStorageCleanUp();
    logoutRedirection("/login");
  }
}

function logout(redirectUrl = "/login") {
  localStorageCleanUp();
  try {
    if (getProxyToken()) {
      axios
        .delete(`${proxyUrl}/logout`)
        .then(() => {
          logoutRedirection(redirectUrl);
        })
        .catch(() => {
          logoutRedirection(redirectUrl);
        });
    } else {
      logoutRedirection("/login");
    }
  } catch (e) {
    localStorageCleanUp();
    logoutRedirection("/login");
  }
}

function localStorageCleanUp() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(profileKey);
  }
}

function logoutRedirection(redirectUrl) {
  const redirectUri = `${uiURL}${redirectUrl}`;
  if (typeof window !== "undefined") {
    window.location.href = redirectUri;
  }
}

function getCurrentUser() {
  if (typeof window !== "undefined") {
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
    } catch (err) {
      return null;
    }
  }
  return null;
}

function getCurrentOrg() {
  try {
    const state = store.getState();
    const currentOrganization = state?.organizations?.currentOrg;
    return currentOrganization;
  } catch (err) {
    return null;
  }
}

function getOrgList() {
  try {
    const state = store.getState();
    const organizationList = state?.organizations?.orgList;
    return organizationList;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function getProxyToken() {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(tokenKey) || "";
  }
  return "";
}

async function getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken, redirect) {
  if (!proxyAuthToken) {
    proxyAuthToken = getProxyToken();
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(tokenKey, proxyAuthToken);
  }

  try {
    const response = await fetch(`${proxyUrl}/getDetails`, {
      headers: {
        proxy_auth_token: proxyAuthToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const userInfo = data.data[0];

    if (typeof window !== "undefined") {
      window.localStorage.setItem(profileKey, JSON.stringify(userInfo));
    }

    store.dispatch(setCurrentUser(userInfo));
    store.dispatch(setOrganizationList(userInfo.c_companies));
    store.dispatch(setCurrentorganization(userInfo.currentCompany));

    const currentOrgId = userInfo.currentCompany?.id;
    if (currentOrgId && redirect) {
      switchOrg(currentOrgId, redirect);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

function AuthServiceV2() {
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const proxyAuthToken = urlParams.get("proxy_auth_token");
      if (proxyAuthToken) {
        try {
          await getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken, true);
        } catch (err) {
          router.push("/logout");
        }
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="custom-loading-container">
      <progress className="pure-material-progress-linear w-25" />
    </div>
  );
}

export default AuthServiceV2;
export {
  isAdmin,
  getUserData,
  getCurrentUser,
  getCurrentOrg,
  getOrgList,
  getProxyToken,
  logout,
  getDataFromProxyAndSetDataToLocalStorage,
};
