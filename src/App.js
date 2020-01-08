import React, { Component } from 'react'
import NavBar from './components/navbar'
import { Route, Switch } from 'react-router-dom'
// import Products from './components/products'
// import Posts from './components/posts'
import Home from './components/home'
// import Dashboard from './components/admin/dashboard'
// import ProductDetails from './components/productDetails'
// import NotFound from './components/notFound'
import './App.css'
import Collectionts from './components/collection'
import Login from './components/login'

class App extends Component {
  render () {
    return (
      <div>
        <div className='content'>
          <Switch>
            {/* <Route path='/products/:id' component={Products} /> */}
            {/* <Route path='/products' component={Products} /> */}
            <Route path='/collections' component={Collectionts} />
            <Route path='/login' component={Login} />
            <Route path='/' component={Home} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App
