import React, { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function OauthPage() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const techdocAuthCode = queryParams.get('code') || '';
  const techdocAuthState = queryParams.get('state') || '';

  useEffect(() => {
    window.opener.postMessage(
      { techdocAuthenticationDetails: { techdocAuthCode, techdocAuthState } },
      window.location.origin
    );

    const closeWindowTimeout = setTimeout(() => {
      window.close();
    }, 1300);

    return () => clearTimeout(closeWindowTimeout);
  }, [techdocAuthCode, techdocAuthState]);

  return (
    <div className='d-flex justify-content-center align-items-center h-100'>
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
