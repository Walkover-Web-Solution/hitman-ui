import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import LoginV2 from './components/auth/loginV2'
import Logout from './components/auth/logout'
import collectionsApiService from './components/collections/collectionsApiService'
import NotFound from './components/common/notFound'
import MainV2 from './components/main/MainV2'
import PublicView from './components/main/publicView'
import Public from './components/publicEndpoint/publicEndpoint.jsx'
import { ToastContainer } from 'react-toastify'
import ClientDoc from './components/publishDocs/clientDoc'
import BrowserLogin from './components/broswerLogin/browserLogin'
import { getOrgId, isElectron } from './components/common/utility'
import { ERROR_403_PAGE, ERROR_404_PAGE } from './components/errorPages'
import ProtectedRouteV2 from './components/common/protectedRouteV2'
import Cookies from 'universal-cookie'
import AuthServiceV2 from './components/auth/authServiceV2'
import InviteTeam from './components/main/inviteTeam/inviteTeam'
import { connect } from 'react-redux'
import { installModal } from './components/modals/redux/modalsActions'

const mapDispatchToProps = (dispatch) => {
  return {
    install_modal: (event) => dispatch(installModal(event))
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals
  }
}
class App extends Component {
  async redirectToClientDomain() {
    const isDesktop = process.env.REACT_APP_IS_DESKTOP
    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
    const currentDomain = window.location.href.split('/')[2]
    if (!domainsList.includes(currentDomain) && window.location.href.split('/')[3] !== 'p' && !isDesktop) {
      const { data: clientCollection } = await collectionsApiService.getCollectionsByCustomDomain(currentDomain)
      if (Object.keys(clientCollection) && Object.keys(clientCollection)[0]) {
        const clientCollectionId = Object.keys(clientCollection)[0]
        this.props.history.push({ pathname: `/p/${clientCollectionId}` })
      } else {
        this.props.history.push({ pathname: '/p/error' })
      }
    }
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
    if (this.props.location.pathname.split('/')?.[1] === 'orgs') {
      const orgId = this.props.location.pathname.split('/')?.[2]
      if (orgId) {
        this.changeSelectedOrg(orgId)
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevOrgId = getOrgId()
    const currentOrgId = this.props.location.pathname.split('/')?.[2]
    if (currentOrgId && prevOrgId !== currentOrgId) {
      this.changeSelectedOrg(currentOrgId)
    }
  }

  changeSelectedOrg(orgId) {
    let orgList = window.localStorage.getItem('organisationList')
    orgList = JSON.parse(orgList)
    let flag = 0
    let organisation
    if (orgList) {
      orgList.forEach((org, index) => {
        if (orgId === org.id) {
          flag = 1
          organisation = org
        }
      })
      if (flag === 1) {
        window.localStorage.setItem('organisation', JSON.stringify(organisation))
      }
    }
  }

  render = () => {
    return this.renderApp()
  }

  renderApp = () => {
    const PUBLIC_URL = process.env.REACT_APP_PUBLIC_UI_URL || ''
    const PUBLIC_DOMAIN = PUBLIC_URL.split('/')[2]
    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
    const currentDomain = window.location.href.split('/')[2]
    const path = window.location.href.split('/')[3]

    if (!isElectron() && !domainsList.includes(currentDomain)) {
      if (currentDomain === PUBLIC_DOMAIN) {
        if (path !== 'p' && path !== 'dashboard') {
          window.localStorage.clear()
          const cookies = new Cookies()
          cookies.remove('token')
          this.props.history.push({ pathname: '/dashboard/' })
          return null
        }
      } else {
        if (path !== 'p') {
          return (
            <Switch>
              <Route path='/' component={ClientDoc} />
            </Switch>
          )
        }
      }
    }

    return (
      <>
        <ToastContainer />
        <Switch>
          {/* Error Page Routes */}
          <Route path='/404_PAGE' component={ERROR_404_PAGE} />
          <Route path='/403_PAGE' component={ERROR_403_PAGE} />

          {/* Logged in Dashboard Routes */}
          <ProtectedRouteV2 exact path='/orgs/:orgId/dashboard/' component={MainV2} />
          {/* <ProtectedRouteV2 path='/orgs/:orgId/admin/publish' component={MainV2} /> */}
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/endpoint/:endpointId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/settings' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/page/:pageId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/history/:historyId' component={MainV2} />
          <Route path='/orgs/:orgId/invite' component={InviteTeam} />

          {/* Not Logged in Dashboard Route */}
          <Route path='/dashboard/' component={MainV2} />

          {/*  Public Page Routes */}
          <Route path='/p/error' component={NotFound} />
          <Route path='/p/:collectionIdentifier' component={Public} />

          {/* React App Auth Routes */}
          <Route path='/login' component={LoginV2} />
          <Route path='/logout' component={Logout} />
          <Route path='/' component={AuthServiceV2} />

          {/* Electron App Auth Routes */}
          <Route path='/browser-login-success' component={BrowserLogin} />
          <Route path='/browser-login' component={BrowserLogin} />

          <Route path='/marketPlace' component={PublicView} />
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
