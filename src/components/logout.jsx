import React, { Component } from 'react'
import auth from '../services/authService'
//import {logout} from '../services/authService'

class Logout extends Component {
  componentDidMount () {
    auth.logout() //logout()

    window.location = '/'
  }

  render () {
    return null
  }
}

export default Logout
