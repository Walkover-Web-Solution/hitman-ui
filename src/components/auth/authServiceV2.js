import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import http from "../../services/httpService";
import { Modal } from "react-bootstrap";
import { switchOrg } from "../../services/orgApiService";
import { getDataFromProxyAndSetDataToLocalStorage } from "../common/utility";

const tokenKey = "token";
const profileKey = "profile";
export const orgKey = "organisation";
export const orgListKey = "organisationList";
const uiURL = process.env.REACT_APP_UI_URL;
const proxyUrl = process.env.REACT_APP_PROXY_URL;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function isAdmin() {
  return { is_admin: true };
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
  window.localStorage.removeItem(orgKey);
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
    const org = window.localStorage.getItem(orgKey);
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
  const [show, setShow] = useState(true);
  const [orgList, setOrgList] = useState(null);

  useEffect(async () => {
    try {
      const proxyAuthToken = query.get("proxy_auth_token");
      const orgId = query.get("company_ref_id") || getCurrentOrg()?.id || "";
      if (proxyAuthToken) {
        await getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken);
        setOrgList(getOrgList());
      } else if (getOrgList()) {
        history.push(`/orgs/${orgId}/dashboard`);
      } else {
        history.push("/logout");
      }
    } catch (err) {
      history.push("/logout");
    }
  }, []);

  const orgNames = () => {
    return (
      <Modal show={show}>
        <Modal.Header>
          <Modal.Title>Select Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="org-listing-container ">
            <div className="org-listing-column d-flex flex-column">
              {orgList?.map((org, key) => (
                <button
                  className="btn btn-primary mb-2 p-2"
                  key={key}
                  onClick={() => switchOrg(org.id)}
                >
                  {org.name}
                </button>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    );
  };

  return <>{orgList?.length ? orgNames() : <div className='custom-loading-container'>
  <progress class="pure-material-progress-linear w-25"/>
    </div>}</>;
}

export default AuthServiceV2;
export {
  isAdmin,
  getCurrentUser,
  getCurrentOrg,
  getOrgList,
  getProxyToken,
  logout,
};
