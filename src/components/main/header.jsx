import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import Environments from '../environments/environments'
import { isElectron, openExternalLink, getProfileName, getOrgId } from '../common/utility'
import authService, { getCurrentUser } from '../auth/authService'
import { Header as GenericHeader } from 'viasocket-shared-plugins'
import { connect } from 'react-redux'

import HostedApiIcon from '../../assets/icons/hostedApiIcon.svg'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    endpoints: state.endpoints,
    groups: state.groups,
    pages: state.pages,
    versions: state.versions
  }
}

/* Internal Login Routes */
const LOGIN_ROUTE = process.env.REACT_APP_UI_URL + '/login'
const BROWSER_LOGIN_ROUTE = process.env.REACT_APP_UI_URL + '/browser-login'

/** Desktop App Download URL */
const DESKTOP_APP_DOWNLOAD_LINK = process.env.REACT_APP_DESKTOP_APP_DOWNLOAD_LINK

const LoginButton = () => {
  return (
    isElectron()
      ? <div className='float-right d-flex btn btn-primary mr-3' onClick={() => openExternalLink(BROWSER_LOGIN_ROUTE)}>Login/SignUp</div>
      : <div
          id='sokt-sso'
          data-redirect-uri={LOGIN_ROUTE}
          data-source='hitman'
          data-token-key='sokt-auth-token'
          data-view='button'
          data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'
          signup_uri={LOGIN_ROUTE + '?signup=true'}
        />
  )
}

const DownloadDesktopAppButton = () => {
  const handleDownloadClick = () => {
    const link = `${DESKTOP_APP_DOWNLOAD_LINK}?source=header`
    openExternalLink(link)
  }
  return (
    <div className='d-flex align-items-center'>
      <button onClick={handleDownloadClick} className='btn btn-primary download-btn'>Download Desktop App</button>
    </div>
  )
}

class Header extends Component {
  state = { }

  componentDidMount () {
    if (authService.getCurrentUser()) {
      const profile = {}
      const currentUser = authService.getCurrentUser()
      const name = getProfileName(currentUser).split(' ')
      profile.first_name = name[0]
      profile.last_name = name[1]
      profile.email = currentUser.email
      this.setState({ profile })
      // console.log(profile)
    }
  }

  openPublishDocs (collection) {
    if (collection?.id) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collection.id}`
      })
    } else {
      const collection = this.props.collections[
        Object.keys(this.props.collections)[0]
      ]
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collection.id}`
      })
    }
  }

  dataFetched () {
    return (
      this.props.collections &&
      this.props.versions &&
      this.props.groups &&
      this.props.endpoints &&
      this.props.pages
    )
  }

  getPublicCollections () {
    if (this.dataFetched()) {
      const pendingEndpointIds = Object.keys(this.props.endpoints).filter(
        (eId) => this.props.endpoints[eId].state === 'Pending' || (this.props.endpoints[eId].state === 'Draft' && this.props.endpoints[eId].isPublished)
      )
      const pendingPageIds = Object.keys(this.props.pages).filter(
        (pId) => this.props.pages[pId].state === 'Pending' || (this.props.pages[pId].state === 'Draft' && this.props.pages[pId].isPublished)
      )
      const endpointCollections = this.findPendingEndpointsCollections(
        pendingEndpointIds
      )
      const pageCollections = this.findPendingPagesCollections(pendingPageIds)
      const allCollections = [
        ...new Set([...endpointCollections, ...pageCollections])
      ]
      return allCollections
    }
  }

  getNotificationCount () {
    const collections = this.getPublicCollections()
    return collections?.length || 0
  }

  findPendingEndpointsCollections (pendingEndpointIds) {
    const groupsArray = []
    for (let i = 0; i < pendingEndpointIds.length; i++) {
      const endpointId = pendingEndpointIds[i]
      if (this.props.endpoints[endpointId]) {
        const groupId = this.props.endpoints[endpointId].groupId
        groupsArray.push(groupId)
      }
    }

    const versionsArray = []
    for (let i = 0; i < groupsArray.length; i++) {
      const groupId = groupsArray[i]
      if (this.props.groups[groupId]) {
        const versionId = this.props.groups[groupId].versionId
        versionsArray.push(versionId)
      }
    }
    const collectionsArray = []
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i]
      if (this.props.versions[versionId]) {
        const collectionId = this.props.versions[versionId].collectionId
        collectionsArray.push(collectionId)
      }
    }
    return collectionsArray
  }

  findPendingPagesCollections (pendingPageIds) {
    const versionsArray = []
    for (let i = 0; i < pendingPageIds.length; i++) {
      const pageId = pendingPageIds[i]
      if (this.props.pages[pageId]) {
        const versionId = this.props.pages[pageId].versionId
        versionsArray.push(versionId)
      }
    }
    const collectionsArray = []
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i]
      if (this.props.versions[versionId]) {
        const collectionId = this.props.versions[versionId].collectionId
        collectionsArray.push(collectionId)
      }
    }
    return collectionsArray
  }

  openCollection (collectionId) {
    this.collectionId = collectionId
    this.setState({ selectedCollectionId: collectionId, primarySidebar: false, secondarySidebarToggle: false })
  }

  getFirstPublicCollection () {
    const allCollections = this.getPublicCollections()
    let firstCollection = {}
    const collectionId = allCollections[0]
    const collection = this.props.collections[collectionId]
    firstCollection = collection
    return firstCollection
  }

  navigateToPublishDocs () {
    const collection = this.getFirstPublicCollection()
    this.openPublishDocs(collection)
  }

  renderNavTitle () {
    return (
      <div className='float-right d-flex'>
        {!isElectron() && <DownloadDesktopAppButton />}
        {getCurrentUser() ? <Environments {...this.props} /> : null}
      </div>
    )
  }

  renderLoginButton () {
    return getCurrentUser() ? '' : <LoginButton />
  }

  renderProfileOption () {
    return (
      <>{authService.isAdmin() &&
        <Dropdown.Item>
          <div className='profile-listing' onClick={() => { this.navigateToPublishDocs() }}>
            <img src={HostedApiIcon} alt='' />
            <span className='label'>Hosted API</span>
            {
              this.getNotificationCount() > 0 &&
                <div className='user-notification-badge'>{this.getNotificationCount()}</div>
            }
          </div>
        </Dropdown.Item>}
      </>
    )
  }

  switchOrg (orgId) {
    if (isElectron()) {
      window.location.hash = `/orgs/${orgId}/dashboard`
      window.location.reload()
    } else {
      window.location.href = `/orgs/${orgId}/dashboard`
    }
  }

  render () {
    const productLinks = { FEEDIO: process.env.REACT_APP_FEEDIO_UI_URL, HITMAN: process.env.REACT_APP_UI_URL, CONTENTBASE: process.env.REACT_APP_CONTENTBASE_URL, EBL: process.env.REACT_APP_VIASOCKET_URL, HTTPDUMP: process.env.REACT_APP_HTTPDUMP_URL }
    return (
      <>
        <GenericHeader {...this.props} {...this.state} productLinks={productLinks} switchOrg={(id) => this.switchOrg(id)} showCommunityButton getNotificationCount={() => this.getNotificationCount()} project_name='' organizations={JSON.parse(window.localStorage.getItem('organisationList')) || []} organizationId={getOrgId()} productName='hitman' renderNavTitle={() => this.renderNavTitle()} renderProfileOption={() => this.renderProfileOption()} handleOpenLink={(link) => openExternalLink(link)} renderLoginButton={() => this.renderLoginButton()} />
      </>
    )
  }
}

export default connect(mapStateToProps, null)(Header)
