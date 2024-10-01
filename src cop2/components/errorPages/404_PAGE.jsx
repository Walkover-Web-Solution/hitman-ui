import React from 'react'
import { useRouter  } from 'next/navigation'

function ERROR_404_PAGE() {
  const router = useRouter();
  const location = router.pathname;
  const message = location.error?.response?.data
  return (
    <div className='text-center errorPage'>
      <h4>OOPS! 404</h4>
      {message ? <h3>{message}</h3> : null}
      <button onClick={() => router.push('/')} mat-button>
        Return to Dashboard
      </button>
    </div>
  )
}

export default ERROR_404_PAGE
