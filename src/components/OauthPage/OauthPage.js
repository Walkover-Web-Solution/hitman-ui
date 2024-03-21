import React, { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function OauthPage() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code') || '';
  const state = queryParams.get('state') || '';
  const accessToken = queryParams.get('access_token') || '';

  useEffect(() => {
    window.opener.postMessage(
      { techdocAuthenticationDetails: { code, state, accessToken } },
      window.location.origin
    );

    const closeWindowTimeout = setTimeout(() => {
      window.close();
    }, 1300);

    return () => clearTimeout(closeWindowTimeout);
  }, []);

  return (
    <div className='d-flex justify-content-center align-items-center h-100'>
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
