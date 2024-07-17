import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { connect, useDispatch, useSelector } from 'react-redux'
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
import NavigationSetter from './history.js'

const App = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const currentOrgId = getOrgId() ?? window.location.pathname.split('/')?.[2]
    if (currentOrgId && !isOnPublishedPage()) {
      initConn(currentOrgId)
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID, shortid.generate())

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      dispatch(installModal(e))
    })

    return () => {
      resetConn(getOrgId())
    }
  }, [])

  useEffect(() => {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('token-transfer-channel', (event, data) => {
        navigate('/login', { search: `?sokt-auth-token=${data}` })
      })
    }
  }, [navigate])

  const renderApp = () => {
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
        <NavigationSetter />
        <Routes>
          <Route exact path='/' element={<IndexWebsite />} />
          <Route exact path='/login' element={<LoginV2 />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/proxy/auth' element={<AuthServiceV2 />} />
          <Route path='/orgs/:orgId/automation/:collectionId' element={<RunAutomation />} />
          <Route path='/404_PAGE' element={<ERROR_404_PAGE />} />
          <Route path='/403_PAGE' element={<ERROR_403_PAGE />} />
          <Route path='/auth/redirect' element={<OauthPage />} />

          <Route element={<ProtectedRouteV2 />}>
            <Route path='/orgs/:orgId/dashboard/' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/endpoint/:endpointId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/endpoint/:endpointId/edit' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/settings' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/page/:pageId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/page/:pageId/edit' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/history/:historyId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/history/:historyId/edit' element={<MainV2 />} />
            <Route path='/orgs/:orgId/trash' element={<TrashPage />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/redirections' element={<Redirections />} />
          </Route>

          <Route path='/orgs/:orgId/invite' element={<InviteTeam />} />

          <Route path='/dashboard/' element={<MainV2 />} />

          <Route path='/p/*' element={<Public />} />
        </Routes>
      </>
    )
  }

  return renderApp()
}

export default App
