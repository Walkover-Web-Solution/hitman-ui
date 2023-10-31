import { Component } from 'react'
// import auth from './authService'
import indexedDbService from '../indexedDb/indexedDbService'
import { logout } from './authServiceV2'
class Logout extends Component {
  componentDidMount () {
    indexedDbService.deleteDataBase('hitman')
    const redirectURI = '/login'
    logout(redirectURI)
  }

  render () {
    return null
  }
}

export default Logout
