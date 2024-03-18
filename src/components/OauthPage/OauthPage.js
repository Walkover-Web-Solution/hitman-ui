import React from 'react'
import { useLocation } from 'react-router'

export default function OauthPage() {

  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const authCode = queryParams.get('code') || '';
  const authState = queryParams.get('state') || '';

  window.opener.postMessage({ authCode, authState }, window.location.origin);

  return (
    <div className='d-flex justify-content-center align-items-center h-100'>
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  )
}