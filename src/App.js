import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import LoginV2 from './components/auth/loginV2'
import Logout from './components/auth/logout'
import MainV2 from './components/main/MainV2'
import Public from './components/publicEndpoint/publicEndpoint1.jsx'
import { ToastContainer } from 'react-toastify'
import { SESSION_STORAGE_KEY, getOrgId, isElectron, isOnPublishedPage, isTechdocOwnDomain } from './components/common/utility'
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
import IndexWebsite from './components/indexWebsite/indexWebsite.js'
import Redirections from './components/collections/Redirections.jsx'

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

const App = (props) => {
  useEffect(() => {
    const currentOrgId = getOrgId() ?? props.location.pathname.split('/')?.[2]
    if (currentOrgId && !isOnPublishedPage()) {
      initConn(currentOrgId)
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID, shortid.generate())

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      props.install_modal(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('token-transfer-channel', (event, data) => {
        props.history.push({
          pathname: '/login',
          search: `?sokt-auth-token=${data}`
        })
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      resetConn(getOrgId())
    }
  }, [props])

  const renderApp = () => {
    if (!isElectron() && !isTechdocOwnDomain()) {
      return (
        <Switch>
          <Route path='*' component={Public} />
        </Switch>
      )
    }

    return (
      <>
        <ToastContainer />
        <Switch>
          <Route exact path='/' component={IndexWebsite} />
          <Route path='/404_PAGE' component={ERROR_404_PAGE} />
          <Route path='/403_PAGE' component={ERROR_403_PAGE} />
          <Route path='/auth/redirect' component={OauthPage} />
          <ProtectedRouteV2 exact path='/orgs/:orgId/dashboard/' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/endpoint/:endpointId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/settings' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/page/:pageId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/history/:historyId' component={MainV2} />
          <Route path='/orgs/:orgId/invite' component={InviteTeam} />
          <ProtectedRouteV2 path='/orgs/:orgId/trash' component={TrashPage} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/redirections' component={Redirections} />

          {/* Not Logged in Dashboard Route */}
          <Route path='/dashboard/' component={MainV2} />
          <Route path='/p' component={Public} />
          <Route path='/login' component={LoginV2} />
          <Route path='/logout' component={Logout} />
          <Route exact path='/proxy/auth' component={AuthServiceV2} />
        </Switch>
      </>
    )
  }

  // export default App
  return renderApp()
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
