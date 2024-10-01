'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2';

function ProtectedRouteV2({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const match = pathname.split('/');
  const isOrgInPath = match.includes('orgs');
  const currentUser = getCurrentUser();
  const currentOrg = getCurrentOrg();
  const orgList = getOrgList();
  const proxyToken = getProxyToken();

  useEffect(() => {
    if (!proxyToken) {
      router.replace(`/logout?redirect_uri=${pathname}`);
      return;
    }

    if (currentUser && orgList && currentOrg) {
      const currentOrgId = currentOrg.id;
      if (
        currentOrgId &&
        isOrgInPath &&
        match[2] !== currentOrgId.toString()
      ) {
        const newUrl = pathname.replace(
          /\/orgs\/[^\/]+/,
          `/orgs/${currentOrgId}`
        );
        router.replace(newUrl);
        return;
      }
    } else {
      router.replace(`/login?redirect_uri=${pathname}`);
      return;
    }
  }, [
    proxyToken,
    currentUser,
    orgList,
    currentOrg,
    isOrgInPath,
    match,
    router,
    pathname,
  ]);

  if (!proxyToken || !currentUser || !orgList || !currentOrg) {
    return null; // Or render a loading indicator
  }

  return <>{children}</>;
}

export default ProtectedRouteV2;