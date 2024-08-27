// import { store } from "../../store/store";
// import { redirectToDashboard } from '../components/common/utility'
// import { getOrgList, getCurrentOrg, getDataFromProxyAndSetDataToLocalStorage } from '../components/auth/authServiceV2'
// import { toast } from 'react-toastify'
// import { store } from '../store/store'
// import { removeOrganizationById, setCurrentorganization, setOrganizationList } from '../components/auth/redux/organizationRedux/organizationAction'


// export const tokenKey = "token";

// export const getProxyToken = () => {
//     return window.localStorage.getItem(tokenKey) || "";
// }


// export function localStorageCleanUp() {
//     try {
//         window.localStorage.removeItem(tokenKey);
//         window.localStorage.removeItem(profileKey);
//         // Add any other keys you may want to remove
//     } catch (error) {
//         console.error("Error cleaning up local storage:", error);
//     }
// }

// function logoutRedirection(redirectUrl = "/login") {
//     try {
//         const redirectUri = uiURL + redirectUrl;
//         window.location.href = redirectUri;
//     } catch (error) {
//         console.error("Error during redirection:", error);
//         window.location.href = uiURL + "/login";
//     }
// }

// function getCurrentUser() {
//     try {
//         const profile = window.localStorage.getItem(profileKey);
//         const parsedProfile = JSON.parse(profile);
//         const desiredData = {
//             id: parsedProfile.id,
//             name: parsedProfile.name,
//             email: parsedProfile.email,
//             created_at: parsedProfile.created_at,
//             updated_at: parsedProfile.updated_at,
//             is_block: parsedProfile.is_block,
//         };
//         return desiredData;
//     } catch (err) {
//         return null;
//     }
// }

// function getCurrentOrg() {
//     try {
//         const state = store.getState();
//         const currentOrganization = state?.organizations?.currentOrg;
//         return currentOrganization;
//     } catch (err) {
//         return null;
//     }
// }

// export function updateOrgDataByOrgId(OrgId) {
//     const data = getOrgList()
//     let currentOrganisation;

//     const targetIndex = data.findIndex((obj) => obj.id === OrgId)
//     currentOrganisation = data[targetIndex]
//     store.dispatch(setCurrentorganization(currentOrganisation))
// }

// function getOrgList() {
//     try {
//         const state = store.getState();
//         const organizationList = state?.organizations?.orgList;
//         return organizationList;
//     } catch (err) {
//         console.error(err)
//         return null;
//     }
// }

// function proxyGooglereferenceMapping() {
//     const envMappings = {
//         local: process.env.REACT_APP_PROXY_REFERENCE_ID_LOCAL,
//         test: process.env.REACT_APP_PROXY_REFERENCE_ID_TEST,
//         prod: process.env.REACT_APP_PROXY_REFERENCE_ID_PROD,
//     };
//     return envMappings[process.env.REACT_APP_ENV] || "";
// }


// // export {
// //     localStorageCleanUp,
// //     logoutRedirection,
// //     getCurrentUser,
// //     getCurrentOrg,
// //     getOrgList,
// //     getProxyToken,
// //     proxyGooglereferenceMapping
// // };
