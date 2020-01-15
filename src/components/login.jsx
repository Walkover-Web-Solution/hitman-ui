import queryString from 'query-string'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import auth from '../services/authService'
import { Link } from 'react-router-dom'

class Login extends Component {
  async componentDidMount () {
    const socketJwt = this.getSocketJwt()
    if (!socketJwt) return
    await auth.login(socketJwt)
    const { state } = this.props.location
    window.location = state ? state.from.pathname : '/collections'
  }

  getSocketJwt = () => {
    const { location } = this.props
    const { 'sokt-auth-token': socketJwt } = queryString.parse(location.search)
    return socketJwt
  }

  render () {
    if (auth.getCurrentUser()) return <Redirect to='/collections' />
    const redirectionUrl = 'http://localhost:3000/login'
    const socketLoginUrl = `https://viasocket.com/login?token_required=true&redirect_uri=${redirectionUrl}`

    const h1style = {
      color: '#0f0f0f',
      fontSize: '50px',
      paddingTop: '150px',
      paddingBottom: '30px'
    }

    return (
      <React.Fragment>
        <center>
          <h1 style={h1style}> Welcome to the Login Page</h1>

          <button className='btn btn-primary btn-lg'>
            <a href={socketLoginUrl} style={{ color: '#fcfcfc' }}>
              Login With ViaSocket
            </a>
          </button>
        </center>
      </React.Fragment>
    )
  }
}

export default Login
