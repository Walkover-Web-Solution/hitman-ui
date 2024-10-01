import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function ERROR_403_PAGE() {
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.state?.error?.response?.data

  return (
    <div className='text-center errorPage'>
      <h4>Access Forbidden</h4>
      {message ? <h3>{message}</h3> : <h3>You do not have access to this entity. Please ask organization admin to give access.</h3>}
      <button onClick={() => navigate('/')}>Return to Dashboard</button>
    </div>
  )
}

export default ERROR_403_PAGE