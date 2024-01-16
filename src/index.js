import React from 'react'
import { Route, Switch, Router } from 'react-router-dom'
import ReactDOM from 'react-dom'

import './index.scss'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import '../src/components/main/responsive.scss'
import { Provider } from 'react-redux'
import { store, persistor } from './store/store'
import history from './history.js'
import { addAnalyticsScripts, sentryIntegration } from './components/common/utility'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
addAnalyticsScripts()
// sentryIntegration()
const queryClient = new QueryClient();
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <Switch>
            <Route path='/' component={App} />
          </Switch>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()