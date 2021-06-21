import { Component } from 'react'
import auth from './authService'
import indexedDbService from '../indexedDb/indexedDbService'
class Logout extends Component {
  componentDidMount () {
    indexedDbService.deleteDataBase('hitman')
    auth.logout()
  }

  render () {
    return null
  }
}

export default Logout
