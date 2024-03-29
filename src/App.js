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
    if (currentOrgId && !isOnPublishedPage()) {
      initConn(currentOrgId)
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID, shortid.generate())
  }
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
    // window.addEventListener('beforeunload', this.handleBeforeUnload)
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

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    resetConn(getOrgId())
  }

  handleBeforeUnload = (e) => {
    const tabsOrderArray = this.props?.tabsOrder
    let unsavedChanges = false
    for (let i = 0; i < tabsOrderArray.length; i++) {
      if (this.props.tabs?.[tabsOrderArray[i]]?.isModified === true) {
        unsavedChanges = true
        break
      }
    }
    if (unsavedChanges && window.location.pathname.includes('/dashboard')) {
      const message = 'Changes that you made may not be saved.'
      e.returnValue = message
      return message
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
          {/* Error Page Routes */}
          <Route path='/404_PAGE' component={ERROR_404_PAGE} />
          <Route path='/403_PAGE' component={ERROR_403_PAGE} />

          {/* Logged in Dashboard Routes */}
          <ProtectedRouteV2 exact path='/orgs/:orgId/dashboard/' component={MainV2} />
          {/* <ProtectedRouteV2 path='/orgs/:orgId/admin/publish' component={MainV2} /> */}
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/endpoint/:endpointId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/settings' component={MainV2} />
          {/* <ProtectedRouteV2 path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' component={MainV2} /> */}
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/page/:pageId' component={MainV2} />
          <ProtectedRouteV2 path='/orgs/:orgId/dashboard/history/:historyId' component={MainV2} />
          <Route path='/orgs/:orgId/invite' component={InviteTeam} />

          {/* Not Logged in Dashboard Route */}
          <Route path='/dashboard/' component={MainV2} />

          {/*  Public Page Routes */}
          <Route path='/p/error' component={NotFound} />
          <Route path='/p' component={Public} />

          {/* React App Auth Routes */}
          <Route path='/login' component={LoginV2} />
          <Route path='/logout' component={Logout} />
          <Route path='/' component={AuthServiceV2} />

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
