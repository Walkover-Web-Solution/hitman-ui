import proxyRequest from "../proxy"
import { localStorageCleanUp } from "./authApiUtils";

export const tokenKey = "token";
export const profileKey = "profile";
const uiURL = process.env.REACT_APP_UI_URL;


export const getUserData = async () => {
    debugger
    try {
        const response = await proxyRequest.get(`/getUsers?itemsPerPage=100`)
        return response?.data?.data
    } catch (error) {
        // localStorageCleanUp();
        throw error;
    }
}

// export const logoutUser = async () => {
//     localStorageCleanUp();
//     try {
//         if (getProxyToken()) {
//             try {
//                 await proxyRequest.post(proxyUrl + "/logout");
//                 logoutRedirection("/login");
//             } catch (error) {
//                 logoutRedirection("/login");
//             }
//         } else {
//             logoutRedirection("/login");
//         }
//     } catch (e) {
//         localStorageCleanUp();
//         logoutRedirection("/login");
//     }
// };

// export const fetchAndStoreData = async () => {
//     if (!proxyAuthToken) { proxyAuthToken = getProxyToken() }
//     window.localStorage.setItem(tokenKey, proxyAuthToken);
//     try {
//         const response = await proxyRequest.post(proxyUrl + '/getDetails');

//         // const userInfo = data.data[0];
//         // window.localStorage.setItem(profileKey, JSON.stringify(userInfo));
//         // store.dispatch(setCurrentUser(userInfo));
//         // store.dispatch(setOrganizationList(userInfo.c_companies));
//         // store.dispatch(setCurrentorganization(userInfo.currentCompany));
//         // const currentOrgId = userInfo.currentCompany?.id;
//         // if (currentOrgId) {
//         //     switchOrg(currentOrgId, redirect)
//         // }

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//     } catch (error) {
//         throw error;
//     }
// }

// export const fetchAllOrganizations = async () => {
//     try {
//         const response = await proxyRequest.get('/getCompanies');
//         if (response) {
//             // store.dispatch(setOrganizationList(response?.data?.data?.data))
//         }
//     } catch (error) {
//         throw error
//     }
// }

// export const leaveOrganization = async (orgId) => {
//     try {
//         const response = await proxyRequest.post('/inviteAction/leave', { company_id: orgId })
//         // if (orgId == getCurrentOrg()?.id) {
//         //     const newOrg = getOrgList()?.[0]?.id;
//         //     switchOrg(newOrg, true);
//         // }
//         // if (response.status === 200) {
//         //     store.dispatch(removeOrganizationById(orgId));
//         // }
//     } catch (error) {
//         throw error
//     }
// }

// export const switchOrg = async (orgId) => {
//     try {
//         await proxyRequest.post('/switchCompany', { company_ref_id: orgId })
//         updateOrgDataByOrgId(orgId)
//         if (redirect) {
//             redirectToDashboard(orgId)
//         }

//     } catch (error) {
//         throw error
//     }
// }

// export const createOrg = async (name, type) => {
//     try {
//         const newOrg = await proxyRequest.post('/createCompany', { company: { name, meta: { type } } })
//         // await getDataFromProxyAndSetDataToLocalStorage(null, true)
//         // updateOrgDataByOrgId(newOrg?.data?.data?.id)
//         // await createOrganizationAndRunCode()
//         // await switchOrg(newOrg?.data?.data?.id, true)
//     } catch (error) {
//         throw error
//     }
// }

// export const updateOrg = async (name, type) => {
//     try {
//         const data = { company: { name, meta: { type } } }
//         const response = await proxyRequest.post(`/{featureId}/updateDetails`, data)
//         // await getDataFromProxyAndSetDataToLocalStorage()
//         // updateOrgDataByOrgId(updateOrg?.data?.data?.id)
//         // await createOrganizationAndRunCode()
//         // await switchOrg(updateOrg?.data?.data?.id, true)
//     } catch (error) {
//         throw error
//     }
// }

// export const inviteMembers = async (name, email) => {
//     try {
//         const data = {
//             user: {
//                 name: name,
//                 email: email
//             }
//         }
//         const response = await proxyRequest.post('/addUser', data)
//         toast.success('User added successfully')
//         return response
//     } catch (error) {
//         throw error
//     }
// }

// export const removeUser = async (userId) => {
//     try {
//         const feature_id = proxyGooglereferenceMapping();
//         const data = {
//             feature_id: feature_id,
//             company_id: getCurrentOrg()?.id
//         }
//         const headers = {
//             authkey: 'ebc1437c957484fcc548ee8b22449305'
//         };
//         const response = await http.post(`https://routes.msg91.com/api/clientUsers/${userId}/remove`, data, { headers })
//         return response;
//     } catch (error) {
//         toast.error('Cannot proceed at the moment. Please try again later')
//         throw error;
//     }
// }