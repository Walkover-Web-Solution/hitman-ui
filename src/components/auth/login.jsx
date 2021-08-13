import queryString from 'query-string'
import React, { Component } from 'react'
import './auth.scss'
import auth from './authService'
import { getOrgId } from '../common/utility'

class Login extends Component {
  async componentDidMount () {
    const socketJwt = auth.getJwt()
    if (!socketJwt) {
      this.props.history.push({
        pathname: '/logout',
        search: this.props.location.search
      })
    }
    const userInfo = await auth.login(socketJwt)
    if (this.isNewUser()) {
      await auth.notifySignup(userInfo)
    }
    const orgId = getOrgId()
    const reloadRoute = new URLSearchParams(this.props.location.search).get('redirect_uri') || `/orgs/${orgId}/dashboard`
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

  render () {
    return <></>
  }
}

export default Login
