import queryString from 'query-string'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import './auth.scss'
import auth from './authService'
import { getOrgId } from '../common/utility'

class Login extends Component {
  async componentDidMount () {
    const socketJwt = this.getSocketJwt()
    if (!socketJwt) return
    const userInfo = await auth.login(socketJwt)
    if (this.isNewUser()) {
      await auth.notifySignup(userInfo)
    }
    const orgId = getOrgId()
    const { state } = this.props.location
    const reloadRoute = state ? state.from.pathname : `/orgs/${orgId}/dashboard/endpoint/new`
    this.props.history.push({
      pathname: reloadRoute
    })
  }

  isNewUser () {
    const { signup } = queryString.parse(this.props.location.search)
    if (signup) {
      return true
    } else return false
  }

  getSocketJwt = () => {
    const { location } = this.props
    const { 'sokt-auth-token': socketJwt } = queryString.parse(location.search)
    return socketJwt
  };

  render () {
    const orgId = getOrgId()
    if (auth.getCurrentUser()) return <Redirect to={`/orgs/${orgId}/dashboard/endpoint/new`} />

    return <></>
  }
}

export default Login
