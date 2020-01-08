import React from 'react'

const Login = () => {
  const url =
    'https://viasocket.com/login?token_required=true&redirect_uri=http://localhost:3000/collections'

  return (
    <div>
      <h1>Login</h1>
      <button className='btn btn-success btn-lg'>
        <a href={url}>Login With ViaSocket</a>
      </button>
    </div>
  )
}

export default Login
