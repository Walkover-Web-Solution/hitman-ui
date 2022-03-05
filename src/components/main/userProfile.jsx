import React from 'react'
import { Dropdown } from 'react-bootstrap'
import Avatar from 'react-avatar'
import { FixedSizeList as List } from 'react-window'
import lightArrow from '../../assets/icons/new-arrow.svg'
import User from '../../assets/icons/user.svg'
import RightArrow from '../../assets/icons/right-arrow.svg'
import Power from '../../assets/icons/power.svg'
import { ReactComponent as Users } from '../../assets/icons/users.svg'
import File from '../../assets/icons/file.svg'
import { products } from '../common/constants'
import authService from '../auth/authService'
import HostedApiIcon from '../../assets/icons/hostedApiIcon.svg'
import { isElectron, getProfileName } from '../common/utility'

export class UserProfile extends React.Component {
    state = {
      firstName: '',
      lastName: '',
      email: '',
      orgFilter: '',
      moreFlag: false
    };

    componentDidMount () {
      if (authService.getCurrentUser()) {
        this.setProfile()
      }
    }

    setProfile () {
      const currentUser = authService.getCurrentUser()
      const name = getProfileName(currentUser)?.split(' ')
      this.setState({ firstName: name?.[0] })
      this.setState({ lastName: name?.[1] })
      this.setState({ email: currentUser.email })
    }

    renderAvatarWithOrg (onClick, ref1) {
      // const { getNotificationCount } = this.getNotificationCount()
      return (
        <div
          className='menu-trigger-box d-flex align-items-center justify-content-between w-100' onClick={(e) => {
            e.preventDefault()
            onClick(e)
          }}
        >
          <div className='d-flex align-items-center position-relative'>
            <Avatar className='mr-2' color='#343a40' name={this.getCurrentOrg()?.name} size={40} round='4px' />
            {this.renderOrgName()}
            {/* {getNotificationCount && getNotificationCount() > 0 &&
            <span className='user-notification-badge'>{getNotificationCount()}</span>} */}
          </div>
          <img
            ref={ref1}
            src={lightArrow}
            alt='settings-gear'
            className='transition cursor-pointer'
          />
        </div>
      )
    }

    returnName () {
      const name = this.state.firstName
      const email = this.state.email || ''
      return name === ' ' ? email : name
    }

    renderOrgName () {
      const { name } = this.getUserDetails()
      return (
        <div>
          <div className='org-name'>
            {this.getCurrentOrg()?.name || null}
          </div>
          <span class='profile-details-label-light'>{name}</span>
          {/* {
                this.getNotificationCount() > 0 &&
                  <div className='user-notification-badge'>{this.getNotificationCount()}</div>
            } */}
        </div>
      )
    }

    getCurrentOrg () {
      const organizations = JSON.parse(window.localStorage.getItem('organisationList')) || []
      let filteredOrgsArray = this.getAllOrgs(organizations)
      filteredOrgsArray = filteredOrgsArray.filter((org) => !this.compareOrg(org))
      return filteredOrgsArray[0]
    }

    renderUserDetails () {
      const { name, email } = this.getUserDetails()
      return (
        <div
          className='profile-details d-flex align-items-center'
          onClick={() => { }}
        >
          <div class='user-icon'>
            <img src={User} />
          </div>
          <div className='profile-details-user-name'>
            <span class='profile-details-label-light'>{name}</span>
            <span class='profile-details-label-light'>{email}</span>
          </div>
        </div>
      )
    }

    getUserDetails () {
      const firstName = this.state.firstName || ''
      const lastName = this.state.lastName || ''
      const email = this.state.email || ''
      const name = firstName + ' ' + lastName
      return { email, name }
    }

    renderMenuButton () {
      return this.renderProfileOption()
    }

    renderProfileOption () {
      return (
        authService.isAdmin() &&
          <div className='profile-listing' onClick={() => { this.navigateToPublishDocs() }}>
            <img src={HostedApiIcon} alt='' />
            <span className='label'>Hosted API</span>
            {
                    this.getNotificationCount() > 0 &&
                      <div className='user-notification-badge'>{this.getNotificationCount()}</div>
                    }
          </div>
      )
    }

    navigateToPublishDocs () {
      const collection = this.getFirstPublicCollection()
      this.openPublishDocs(collection)
    }

    getFirstPublicCollection () {
      const allCollections = this.getPublicCollections()
      let firstCollection = {}
      const collectionId = allCollections[0]
      const collection = this.props.collections[collectionId]
      firstCollection = collection
      return firstCollection
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

    dataFetched () {
      return (
        this.props.collections &&
            this.props.versions &&
            this.props.groups &&
            this.props.endpoints &&
            this.props.pages
      )
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

    getNotificationCount () {
      const collections = this.getPublicCollections()
      return collections?.length || 0
    }

    renderInviteTeam () {
      return (
        <div class='profile-listing' onClick={() => { this.openAccountAndSettings() }}>
          <Users />
          <span className='label'>Invite Team</span>
        </div>
      )
    }

    openAccountAndSettings () {
      const { productName, history, organizationId, location } = this.props
      if (productName !== products.EBL) { this.openOptions('/manage/users') } else {
        history.push({
          pathname: `/orgs/${organizationId}/manage`,
          search: location.search
        })
      }
    }

    renderBilling () {
      const { productName, history, organizationId } = this.props
      return (
        <div
          class='profile-listing' onClick={() => {
            if (productName === products.EBL) {
              history.push({
                pathname: `/orgs/${organizationId}/billing/subscription`
              })
            } else {
              this.openOptions('/billing/subscription')
            }
          }}
        >
          <img src={File} />
          <span className='label'>Billing</span>
        </div>
      )
    }

    openOptions (path) {
      const { match, productName, handleOpenLink } = this.props
      const viasocketUrl = process.env.REACT_APP_VIASOCKET_URL
      const currProductUrl = process.env.REACT_APP_UI_BASE_URL || process.env.REACT_APP_UI_URL
      const { orgId } = match.params
      if (orgId) {
        let url = `${viasocketUrl}/orgs/${orgId}${path}?product=${productName}`
        if (path === '/products') {
          url += ''
        } else {
          url += `&redirect_uri=${currProductUrl}`
        }
        if (!handleOpenLink) { window.open(url, '_blank') } else { handleOpenLink(url) }
      } else {
        console.log('Organization ID not found')
      }
    }

    renderOtherProducts () {
      return (
        <div
          class='profile-listing' onClick={() => {
            this.openOptions('/products')
          }}
        >
          <img src={File} />
          <span className='label'>Other Products</span>
        </div>
      )
    }

    renderLogout () {
      return (
        <div
          className='profile-listing' onClick={() => {
            this.props.history.push({
              pathname: '/logout'
            })
          }}
        >
          <img src={Power} />
          <span class='label'>Logout</span>
        </div>
      )
    }

    renderOrgList () {
      const organizations = JSON.parse(window.localStorage.getItem('organisationList')) || []
      const productName = 'hitman'
      const orgsLength = Object.keys(organizations || {})?.length
      let filteredOrgsArray = this.getAllOrgs(organizations)
      filteredOrgsArray = filteredOrgsArray.filter((org) => this.compareOrg(org))
      const orgItem = ({ index, style }) => {
        const item = filteredOrgsArray[index]
        return (
          <Dropdown.Item style={style}>
            <div
              key={item?.id}
              className='org-listing'
              onClick={() => {
                const currentId = productName === products.EBL ? item?.id : item?.identifier
                this.switchOrg(currentId)
              }}
            >
              <span className='org-listing-name'>{item?.name}</span>
              <img src={RightArrow} />
            </div>
          </Dropdown.Item>
        )
      }

      return (
        (orgsLength > 1 &&
          <div className='OrgsBlock'>
            <div className='text-uppercase text-sm-bold'>SWITCH ORGS</div>
            <div className='orgs-listing-container'>
              {this.state.moreFlag &&
                <div className='p-2 search-profile'>
                  <input
                    className='form-control'
                    onChange={(e) => this.setOrgFilter(e.target.value, filteredOrgsArray?.length || 0)}
                    value={this.state.orgFilter}
                    placeholder='Search'
                  />
                </div>}
              {filteredOrgsArray.length === 0
                ? <div className='pb-2 text-center w-100'><small className='body-6'>No Organizations Found</small></div>
                : <List height={filteredOrgsArray.length < 5 ? 36 * filteredOrgsArray.length : 180} itemCount={this.getItemCount(filteredOrgsArray.length)} itemSize={35}> {orgItem} </List>}
            </div>
            {orgsLength > 5 &&
              <div className='ShowMore text-center' onClick={() => this.setShowFlag()}>
                {!this.state.moreFlag ? 'Show more' : 'Show less'}
              </div>}
          </div>
        )
      )
    }

    getAllOrgs (organizations) {
      const orgsArray = Object.values({ ...organizations } || {})
      const { orgFilter } = this.state
      const filteredOrgsArray = orgsArray.filter(org =>
        org.name.toLowerCase().includes(orgFilter.toLowerCase()
        ))
        .sort((a, b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
          else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
          else return 0
        })

      return filteredOrgsArray
    }

    compareOrg (org) {
      const productName = 'hitman'
      const organizationId = this.props.match.params.orgId
      if (productName !== products.EBL) {
        return org.identifier !== organizationId
      } else {
        return org.id !== organizationId
      }
    }

    switchOrg (orgId) {
      if (isElectron()) {
        window.location.hash = `/orgs/${orgId}/dashboard`
        window.location.reload()
      } else {
        window.location.href = `/orgs/${orgId}/dashboard`
      }
    }

    setOrgFilter (orgFilter) {
      this.setState({ orgFilter })
    }

    getItemCount (orgCount) {
      const showFlag = this.state.moreFlag
      if (orgCount > 5 && !showFlag) {
        return 5
      } else {
        return orgCount
      }
    }

    setShowFlag () {
      let orgFilter = this.state.orgFilter
      const moreFlag = !this.state.moreFlag
      if (!moreFlag) {
        orgFilter = ''
      }
      this.setState({ orgFilter, moreFlag })
    }

    render () {
      const productName = 'hitman'
      return (
        <div className='profile-menu'>
          <Dropdown className='menu-dropdown transition d-flex align-items-center'>
            <Dropdown.Toggle
              as={React.forwardRef(({ children, onClick }, ref1) => (
                this.renderAvatarWithOrg(onClick, ref1)
              ))}
              id='dropdown-custom-components'
            />
            <Dropdown.Menu>
              {this.renderUserDetails()}
              <div className='profile-listing-container'>
                <Dropdown.Item>{this.renderMenuButton()}</Dropdown.Item>
                <Dropdown.Item>{this.renderInviteTeam()}</Dropdown.Item>
                <Dropdown.Item>{this.renderBilling()} </Dropdown.Item>
                <Dropdown.Item>{productName !== products.EBL && this.renderOtherProducts()}</Dropdown.Item>
                <Dropdown.Item>{this.renderLogout()}</Dropdown.Item>
              </div>
              {/* {this.renderOrgList()} */}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )
    }
}
