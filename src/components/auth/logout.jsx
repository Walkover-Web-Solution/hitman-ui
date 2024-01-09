import { Component } from 'react'
import { logout } from './authServiceV2'
class Logout extends Component {
  componentDidMount () {
    const redirectURI = '/login'
    logout(redirectURI)
  }

  render () {
    return null
  }
}

export default Logout
