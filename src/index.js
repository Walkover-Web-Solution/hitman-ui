import React from 'react'
import { Route, Switch, BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'

import './index.scss'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import { Provider } from 'react-redux'
import store from './store/store'
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path='/' component={App} />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
