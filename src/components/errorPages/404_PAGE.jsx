import React from 'react'
import { useNavigate } from 'react-router-dom'

function ERROR_404_PAGE() {
  const navigate = useNavigate()
  const message = this.props.location.error?.response?.data
  return (
    <div className='text-center errorPage'>
      <h4>OOPS! 404</h4>
      {message ? <h3>{message}</h3> : null}
      <button onClick={() => navigate({ pathname: '/' })} mat-button>Return to Dashboard</button>
    </div>
  )
}

export default ERROR_404_PAGE