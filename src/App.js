import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import LoginV2 from './components/auth/loginV2'
import Logout from './components/auth/logout'
import collectionsApiService from './components/collections/collectionsApiService'
import NotFound from './components/common/notFound'
import MainV2 from './components/main/MainV2'
import Public from './components/publicEndpoint/publicEndpoint.jsx'
import { ToastContainer } from 'react-toastify'
import { SESSION_STORAGE_KEY, getOrgId, isDashboardRoute, isElectron, isOnPublishedPage, isTechdocOwnDomain } from './components/common/utility'
import { ERROR_403_PAGE, ERROR_404_PAGE } from './components/errorPages'
import ProtectedRouteV2 from './components/common/protectedRouteV2'
import Cookies from 'universal-cookie'
import AuthServiceV2 from './components/auth/authServiceV2'
import InviteTeam from './components/main/inviteTeam/inviteTeam'
import { connect } from 'react-redux'
import { installModal } from './components/modals/redux/modalsActions'
import { initConn, resetConn } from './services/webSocket/webSocketService.js'
import shortid from 'shortid'
import OauthPage from './components/OauthPage/OauthPage.js'
import TrashPage from './components/main/Trash/trashPage.jsx'

const mapDispatchToProps = (dispatch) => {
  return {
    install_modal: (event) => dispatch(installModal(event))
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    tabs: state.tabs.tabs,
    tabsOrder: state.tabs.tabsOrder
  }
}
class App extends Component {
  constructor(props) {
    super(props)
    const currentOrgId = getOrgId() ?? props.location.pathname.split('/')?.[2]
    if (currentOrgId && !isOnPublishedPage()) {initConn(currentOrgId)}
    sessionStorage.setItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID, shortid.generate())
  }
  
  componentDidMount() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.props.install_modal(e)
    })
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('token-transfer-channel', (event, data) => {
        this.props.history.push({
          pathname: '/login',
          search: `?sokt-auth-token=${data}`
        })
      })
    }
  }


  componentWillUnmount() {
    resetConn(getOrgId())
  }

  render = () => {
    return this.renderApp()
  }

  renderApp = () => {
    if (!isElectron() && !isTechdocOwnDomain()) {
      return (
        <Switch>
          <Route path='/' component={Public} />
        </Switch>
      )
    }

    return (
      <>
        <ToastContainer />
        <Switch>
          {/* Error Page Routes */}
          <Route path='/404_PAGE' component={ERROR_404_PAGE} />
          <Route path='/403_PAGE' component={ERROR_403_PAGE} />
          <Route path='/auth/redirect' component={OauthPage} />

          {/* Logged in Dashboard Routes */}
          <ProtectedRouteV2 exact path='/orgs/:orgId/dashboard/' component={MainV2} />
          {/* <ProtectedRouteV2 path='/orgs/:orgId/admin/publish' component={MainV2} /> */}
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/endpoint/:endpointId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/settings' component={MainV2} />
          {/* <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' component={MainV2} /> */}
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/page/:pageId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/history/:historyId' component={MainV2} />
          <Route path='/orgs/:orgId/invite' component={InviteTeam} />
          <ProtectedRouteV2 path='/orgs/:orgId/trash' component={TrashPage} />

          {/* Not Logged in Dashboard Route */}
          <Route path='/dashboard/' component={MainV2} />

          {/*  Public Page Routes */}
          <Route path='/p/error' component={NotFound} />
          <Route path='/p' component={Public} />

          {/* React App Auth Routes */}
          <Route path='/login' component={LoginV2} />
          <Route path='/logout' component={Logout} />
          <Route path='/' component={AuthServiceV2} />

          <Route path='/'>
            <Redirect to='/dashboard' />
          </Route>
        </Switch>
      </>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(App)

// export default App
