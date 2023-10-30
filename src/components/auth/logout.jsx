import { Component } from 'react'
// import auth from './authService'
import indexedDbService from '../indexedDb/indexedDbService'
import { logout } from './authServiceV2'
class Logout extends Component {
  componentDidMount () {
    indexedDbService.deleteDataBase('hitman')
    // redirectUrl == http%3A%2F%2Flocalhost%3A3000%2Forgs%2Fnull%2Fdashboard
    const redirectURI = '/login'
    console.log('rediredURI', redirectURI)
    logout(redirectURI)
  }

  render () {
    return null
  }
}

export default Logout
