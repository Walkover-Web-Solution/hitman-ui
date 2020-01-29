import React, { Component } from 'react'
import { Switch } from 'react-router-dom'
import ProtectedRoute from './common/protectedRoute'
import Collections from './collections'
class SideBar extends Component {
  state = {}
  render () {
    return (
      <nav className='col-md-3 d-none d-md-block bg-light sidebar'>
        <div className='sidebar-sticky'>
          <Switch>
            <ProtectedRoute path='/collections' component={Collections} />
          </Switch>
        </div>
      </nav>
    )
  }
}

export default SideBar
