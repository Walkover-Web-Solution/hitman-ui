import queryString from 'query-string'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import './auth.scss'
import auth from './authService'

class Login extends Component {
  async componentDidMount () {
    const socketJwt = this.getSocketJwt()
    if (!socketJwt) return
    const profile = await auth.login(socketJwt)
    console.log(profile)
    const { state } = this.props.location
    window.location = state ? state.from.pathname : '/dashboard/endpoint/new'
  }

  getSocketJwt = () => {
    const { location } = this.props
    const { 'sokt-auth-token': socketJwt } = queryString.parse(location.search)
    return socketJwt
  };

  render () {
    if (auth.getCurrentUser()) return <Redirect to='/dashboard/endpoint/new' />

    return <></>
  }
}

export default Login
