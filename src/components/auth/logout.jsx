import { Component } from 'react'
import auth from './authService'
import indexedDbService from '../indexedDb/indexedDbService'
class Logout extends Component {
  componentDidMount () {
    indexedDbService.deleteDataBase('hitman')
    const resiredtURI = new URLSearchParams(this.props.location.search).get('redirect_uri') || '/login'
    auth.logout(resiredtURI)
  }

  render () {
    return null
  }
}

export default Logout
