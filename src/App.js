import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Login from './components/auth/login'
import Logout from './components/auth/logout'
import collectionsApiService from './components/collections/collectionsApiService'
import NotFound from './components/common/notFound'
import Main from './components/main/Main.jsx'
import PublicView from './components/main/publicView'
import Public from './components/publicEndpoint/publicEndpoint.jsx'
import Landing from './components/landing/landing'
import { ToastContainer } from 'react-toastify'
import ClientDoc from './components/publishDocs/clientDoc'
import BrowserLogin from './components/broswerLogin/browserLogin'
import { getOrgId, isElectron } from './components/common/utility'

class App extends Component {
  async redirectToClientDomain () {
    const isDesktop = process.env.REACT_APP_IS_DESKTOP
    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
    const currentDomain = window.location.href.split('/')[2]
    if ((!domainsList.includes(currentDomain) && window.location.href.split('/')[3] !== 'p') && !isDesktop) {
      const { data: clientCollection } = await collectionsApiService.getCollectionsByCustomDomain(currentDomain)
      if (Object.keys(clientCollection) && Object.keys(clientCollection)[0]) {
        const clientCollectionId = Object.keys(clientCollection)[0]
        this.props.history.push({ pathname: `/p/${clientCollectionId}` })
      } else {
        this.props.history.push({ pathname: '/p/error' })
      }
    }
  }

  componentDidMount () {
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

  componentDidUpdate (prevProps, prevState) {
    const prevOrgId = getOrgId()
    const currentOrgId = this.props.location.pathname.split('/')?.[2]
    if (currentOrgId && prevOrgId !== currentOrgId) {
      this.changeSelectedOrg(currentOrgId)
    }
  }

  changeSelectedOrg (orgId) {
    let orgList = window.localStorage.getItem('organisationList')
    orgList = JSON.parse(orgList)
    let flag = 0
    let organisation
    if (!orgList) { this.props.history.push({ pathname: '/logout' }) } else {
      orgList.forEach((org, index) => {
        if (orgId === org.identifier) {
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
      const isDesktop = process.env.REACT_APP_IS_DESKTOP
      const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
      const currentDomain = window.location.href.split('/')[2]
      if (!domainsList.includes(currentDomain) && window.location.href.split('/')[3] !== 'p' && !isDesktop) {
        return (
          <Switch>
            <Route path='/' component={ClientDoc} />
          </Switch>
        )
      }

      return (
        <>
          <ToastContainer />
          <Switch>
            <Route path='/orgs/:orgId/admin/publish' component={Main} />
            <Route path='/orgs/:orgId/dashboard/' component={Main} />
            <Route path='/dashboard/' component={Main} />
            <Route path='/p/error' component={NotFound} />
            <Route path='/p/:collectionIdentifier' component={Public} />
            <Route path='/logout' component={Logout} />
            <Route path='/browser-login-success' component={BrowserLogin} />
            <Route path='/browser-login' component={BrowserLogin} />
            <Route path='/login' component={Login} />
            <Route path='/marketPlace' component={PublicView} />
            <Route path='/' component={Landing} />
          </Switch>
        </>
      )
    }
}

export default App
