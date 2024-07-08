import React, { Component } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { connect } from 'react-redux'
import shortid from 'shortid'
import { ToastContainer } from 'react-toastify'
import { SESSION_STORAGE_KEY, getOrgId, isElectron, isOnPublishedPage, isTechdocOwnDomain } from './components/common/utility'
import LoginV2 from './components/auth/loginV2'
import Logout from './components/auth/logout'
import MainV2 from './components/main/MainV2'
import Public from './components/publicEndpoint/publicEndpoint.jsx'
import { ERROR_403_PAGE, ERROR_404_PAGE } from './components/errorPages'
import ProtectedRouteV2 from './components/common/protectedRouteV2'
import AuthServiceV2 from './components/auth/authServiceV2'
import InviteTeam from './components/main/inviteTeam/inviteTeam'
import { installModal } from './components/modals/redux/modalsActions'
import { initConn, resetConn } from './services/webSocket/webSocketService.js'
import OauthPage from './components/OauthPage/OauthPage.js'
import TrashPage from './components/main/Trash/trashPage.jsx'
import IndexWebsite from './components/indexWebsite/indexWebsite.js'
import Redirections from './components/collections/Redirections.jsx'
import RunAutomation from './components/collections/runAutomation/runAutomation.jsx'
import withRouter from './components/common/withRouter.jsx'

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
    if (currentOrgId && !isOnPublishedPage()) { initConn(currentOrgId) }
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
        this.props.navigate('/login', { search: `?sokt-auth-token=${data}` })
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
        <Routes>
          <Route path='*' element={<Public />} />
        </Routes>
      )
    }

    return (
      <>
        <ToastContainer />
        <Routes>
          <Route exact path='/' element={<IndexWebsite />} />
          {/* Error Page Routes */}
          <Route path='/404_PAGE' element={<ERROR_404_PAGE />} />
          <Route path='/403_PAGE' element={<ERROR_403_PAGE />} />
          <Route path='/auth/redirect' element={<OauthPage />} />

          {/* Logged in Dashboard Routes */}
          <Route element={<ProtectedRouteV2 />}>
            <Route path='/orgs/:orgId/dashboard/' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/endpoint/:endpointId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/settings' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/page/:pageId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/history/:historyId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/trash' element={<TrashPage />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/redirections' element={<Redirections />} />
          </Route>

          <Route path='/orgs/:orgId/invite' element={<InviteTeam />} />

          {/* Not Logged in Dashboard Route */}
          <Route path='/dashboard/' element={<MainV2 />} />

          {/*  Public Page Routes */}
          <Route path='/p' element={<Public />} />

          {/* React App Auth Routes */}
          <Route path='/login' element={<LoginV2 />} />
          <Route path='/logout' element={<Logout />} />
          <Route exact path='/proxy/auth' element={<AuthServiceV2 />} />
          <Route exact path='/orgs/:orgId/automation/:collectionId' element={<RunAutomation />} />
        </Routes>
      </>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App))