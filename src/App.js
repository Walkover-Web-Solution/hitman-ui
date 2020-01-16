import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Collections from './components/collection'
import Home from './components/home'
import Login from './components/login'
import Logout from './components/logout'
import CollectionVersions from './components/collectionVersions'
import './App.css'
class App extends Component {
  render () {
    return (
      <div>
        <div className='content'>
          <Switch>
            <Route path='/collectionVersions' component={CollectionVersions} />
            <Route path='/collections' component={Collections} />
            <Route path='/login' component={Login} />
            <Route path='/logout' component={Logout} />
            <Route path='/' component={Home} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App
