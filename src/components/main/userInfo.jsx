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
        <div className='d-flex align-items-center'>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21' stroke='#212224' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z' stroke='#212224' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' />
          </svg>
        </div>
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
      <div>
        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M9.75 1.5H4.5C4.10217 1.5 3.72064 1.65804 3.43934 1.93934C3.15804 2.22064 3 2.60218 3 3V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10217 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V6.75L9.75 1.5Z' stroke='#000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M9.75 1.5V6.75H15' stroke='#000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          <path d='M8.2983 14.7273H8.96875L8.97443 14.071C10.2045 13.9773 10.9176 13.3239 10.9205 12.3381C10.9176 11.3693 10.1875 10.8551 9.17614 10.6278L9.00852 10.5881L9.01989 9.16761C9.39773 9.25568 9.62784 9.49716 9.66193 9.85511H10.8409C10.8267 8.91477 10.125 8.24148 9.03125 8.12216L9.03693 7.45455H8.36648L8.3608 8.11648C7.25 8.22443 6.46591 8.89489 6.47159 9.86364C6.46875 10.7216 7.07386 11.2131 8.05682 11.4489L8.32955 11.517L8.31534 13.0199C7.85227 12.9318 7.53977 12.6477 7.50852 12.1733H6.31818C6.34659 13.321 7.09943 13.9631 8.30398 14.0682L8.2983 14.7273ZM8.9858 13.0199L8.99716 11.6932C9.4375 11.8324 9.67614 12.0114 9.67898 12.3352C9.67614 12.679 9.41477 12.9347 8.9858 13.0199ZM8.33807 10.4148C7.98295 10.2926 7.72727 10.108 7.73295 9.78125C7.73295 9.47727 7.94886 9.24148 8.34943 9.15909L8.33807 10.4148Z' fill='#000' />
        </svg>
        <span>Billing</span>
      </div>

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
        <div className='text-uppercase text-sm-bold'>Switch Orgs</div>
        <div className='profile-sm-dropdown'>
          {orgsList.map((org, index) => (
            <div className='dropdown-item d-flex justify-space-between' onClick={() => this.switchOrg(org?.identifier)} key={index}><span className='pl-0'>{org?.name}</span>

              <div className='orgs-icon'>
                <svg width='18' height='18' className='mr-0' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M6.75 13.5L11.25 9L6.75 4.5' stroke='#4F4F4F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                </svg>
              </div>
            </div>
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
      <Dropdown bsPrefix='dropdown user-info-dropdown profile-dropdown'>
        <Dropdown.Toggle variant=''>
          {this.renderProfileHeader()}
          {this.getNotificationCount() > 0 &&
            <span className='user-notification-badge'>{this.getNotificationCount()}</span>}
        </Dropdown.Toggle>
        <Dropdown.Menu className='profile-drop-display'>
          {this.renderCurrentOrgName()}
          <Dropdown.Divider />
          {this.renderProfileDetails()}
          <div className='profile-sm-dropdown'>
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
          </div>
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
