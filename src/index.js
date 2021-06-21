import React from 'react'
import { Route, Switch, Router } from 'react-router-dom'
import ReactDOM from 'react-dom'

import './index.scss'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import { Provider } from 'react-redux'
import store from './store/store'
import history from './history.js'

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <Route path='/' component={App} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
