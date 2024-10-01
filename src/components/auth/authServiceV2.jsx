"use client"; 

import { useEffect } from "react";
import { useRouter } from "next/router"; // Changed from react-router-dom
import { switchOrg } from "@/services/orgApiService";
import axios from "axios";
import { setCurrentorganization, setOrganizationList } from "./redux/organizationRedux/organizationAction";
import { store } from "@/store/store";
import { setCurrentUser } from "./redux/usersRedux/userAction";

const uiURL = process.env.NEXT_PUBLIC_VITE_UI_URL; // Updated to use Next.js environment variables
const proxyUrl = process.env.NEXT_PUBLIC_VITE_PROXY_URL; // Updated to use Next.js environment variables

function useQuery() {
  const router = useRouter();
  return router.query; // Use Next.js router for query parameters
}

async function getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken, redirect) {
  // ... existing code ...
}

function AuthServiceV2() {
  const query = useQuery();
  const router = useRouter(); // Use Next.js router

  useEffect(() => {
    const fetchData = async () => {
      try {
        const proxyAuthToken = query.proxy_auth_token; // Access query parameter directly
        if (proxyAuthToken) {
          await getDataFromProxyAndSetDataToLocalStorage(proxyAuthToken, true);
        }
      } catch (err) {
        router.push("/logout"); // Use Next.js router for navigation
      }
    };

    fetchData();
  }, [query, router]); // Add query and router as dependencies

  return (
    <div className='custom-loading-container'>
      <progress className="pure-material-progress-linear w-25" />
    </div>
  );
}

export default AuthServiceV2;