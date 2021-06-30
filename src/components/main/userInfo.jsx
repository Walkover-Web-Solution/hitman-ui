import React, { Component } from 'react'
import { connect } from 'react-redux'
import authService from '../auth/authService'
import { Dropdown } from 'react-bootstrap'
import { getProfileName, openExternalLink } from '../common/utility'
import { ReactComponent as HostedApiIcon } from '../../assets/icons/hostedApiIcon.svg'
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-orange.svg'
import { ReactComponent as SignOutIcon } from '../../assets/icons/signOutIcon.svg'
import { ReactComponent as SocketIcon } from '../../assets/icons/socketIcon.svg'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    endpoints: state.endpoints,
    groups: state.groups,
    pages: state.pages,
    versions: state.versions
  }
}

class UserInfo extends Component {
  state = {}

  componentDidMount () {
    if (authService.getCurrentUser()) {
      const user = {}
      const currentUser = authService.getCurrentUser()
      user.name = getProfileName(currentUser)
      user.email = currentUser.email
      this.setState({ user })
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

  navigateToViaSocket (path) {
    const orgId = authService.getCurrentOrg()?.identifier
    if (orgId) {
      let viaSocketUrl = `${process.env.REACT_APP_VIASOCKET_URL}/orgs/${orgId}${path}?product=hitman`
      if (path === '/products') {
        viaSocketUrl += ''
      } else {
        viaSocketUrl += `&redirect_uri=${process.env.REACT_APP_UI_URL}`
      }
      openExternalLink(viaSocketUrl)
    }
  }

  renderMenuHeading () {
    return (
      <div className='menu-heading'>Profile</div>
    )
  }

  renderProfileDetails () {
    return (
      <div className='profile'>
        <div className='user-profile-circle'><i class='fas fa-user' /></div>
        <div className='user-profile-data text-truncate'>
          <div className='username'>{this.state.user?.name}</div>
          <div className='email'>{this.state.user?.email}</div>
        </div>
      </div>
    )
  }

  handleLogout () {
    this.props.history.push({
      pathname: '/logout'
    })
  }

  renderBilling () {
    return (
      <div>Billing</div>
    )
  }

  renderCurrentOrgName () {
    const orgName = authService.getCurrentOrg()?.name
    return (
      <div className='text-center'>{orgName}</div>
    )
  }

  renderProfileHeader () {
    return (
      <div className='d-flex align-items-center'>
        <i class='fas fa-user' />
        {this.renderCurrentOrgName()}
        <i className='uil uil-ellipsis-v' />
      </div>
    )
  }

  renderOrgsList () {
    const orgsList = JSON.parse(window.localStorage.getItem('organisationList')) || []
    return (
      <div>
        <div className='text-uppercase'>Switch Accounts</div>
        <div>
          {orgsList.map((org, index) => (
            <div onClick={() => this.switchOrg(org?.identifier)} key={index}>{org?.name}</div>
          ))}
        </div>
      </div>
    )
  }

  switchOrg (orgId) {
    window.location.href = `/orgs/${orgId}/dashboard`
  }

  userDropdown () {
    return (
      <Dropdown bsPrefix='dropdown user-info-dropdown'>
        <Dropdown.Toggle variant=''>
          {this.renderProfileHeader()}
          {this.getNotificationCount() > 0 &&
            <span className='user-notification-badge'>{this.getNotificationCount()}</span>}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.renderCurrentOrgName()}
          <Dropdown.Divider />
          {this.renderProfileDetails()}
          <Dropdown.Item onClick={() => this.navigateToViaSocket('/manage/users')}>
            <SettingsIcon /><span>Invite Team</span>
          </Dropdown.Item>
          {authService.isAdmin() &&
            <Dropdown.Item className='d-flex justify-content-between align-items-center' onClick={() => { this.navigateToPublishDocs() }}>
              <div><HostedApiIcon /><span>Hosted API</span></div>
              {this.getNotificationCount() > 0 &&
                <div className='user-notification-badge'>{this.getNotificationCount()}</div>}
            </Dropdown.Item>}
          <Dropdown.Item onClick={() => this.navigateToViaSocket('/billing/subscription/hitman')}>
            {this.renderBilling()}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.navigateToViaSocket('/products')}>
            <SocketIcon className='socket-icon' /><span>Other Products</span>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.handleLogout()}>
            <SignOutIcon /><span>Logout</span>
          </Dropdown.Item>
          {this.renderOrgsList()}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  render () {
    return (
      <div className='d-flex'>
        {this.userDropdown()}
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(UserInfo)
