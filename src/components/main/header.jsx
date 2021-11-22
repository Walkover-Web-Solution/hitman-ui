import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import Environments from '../environments/environments'
// import UserInfo from './userInfo'
// import socketLogo from '../../assets/icons/socketIcon.svg'
/* Commenting cloud icon for now, as no requirement was given for it but was mentioned in the design. */
/* import cloudImage from '../../assets/icons/cloud.svg' */
import { isElectron, openExternalLink, getProfileName, getOrgId } from '../common/utility'
import authService, { getCurrentUser } from '../auth/authService'
import { ReactComponent as CommunityIcon } from '../../assets/icons/community-icon.svg'
// import ArrowIcon from '../../assets/icons/arrow.svg'
import { Header as GenericHeader } from 'common-header-test-punit'
import { connect } from 'react-redux'

import { ReactComponent as HostedApiIcon } from '../../assets/icons/hostedApiIcon.svg'

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

/* Other Product Urls */
// const EBL_UI_URL = process.env.REACT_APP_VIASOCKET_URL
// const FEEDIO_UI_URL = process.env.REACT_APP_FEEDIO_UI_URL
// const SHEETASDB_UI_URL = process.env.REACT_APP_SHEETASDB_UI_URL
const COMMUNITY_URL = process.env.REACT_APP_COMMUNITY_URL

/** Desktop App Download URL */
const DESKTOP_APP_DOWNLOAD_LINK = process.env.REACT_APP_DESKTOP_APP_DOWNLOAD_LINK

// const HitmanBrand = () => {
//   return (
//     <div className='logo black-hover transition d-flex align-items-center'>
//       <SwitchProducts />
//     </div>
//   )
// }

const CommunityButton = () => {
  return (
    <div className='d-flex align-items-center black-hover transition' onClick={() => openExternalLink(COMMUNITY_URL)}>
      <CommunityIcon />
    </div>
  )
}

// const SwitchProducts = () => {
//   const currentOrgId = getCurrentOrg()?.identifier

//   const products = [
//     {
//       name: 'Feedio',
//       link: FEEDIO_UI_URL ? FEEDIO_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/` : '') : ''
//     },
//     {
//       name: 'EBL',
//       link: EBL_UI_URL ? EBL_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/projects` : '') : ''
//     },
//     {
//       name: 'SheetAsDB',
//       link: SHEETASDB_UI_URL ? SHEETASDB_UI_URL + (currentOrgId ? `/orgs/${currentOrgId}/projects` : '') : ''
//     }
//   ]

//   const ProductItem = ({ product }) => {
//     return (
//       <Dropdown.Item onClick={() => openExternalLink(product.link)}>
//         {product.name}
//       </Dropdown.Item>
//     )
//   }

//   return (
//     <div className='switchPrd'>
//       <Dropdown>
//         <Dropdown.Toggle variant='success' id='dropdown-basic'>
//           <img src={socketLogo} alt='' width='22' height='22' />
//           <span>Hitman</span>
//           <img src={ArrowIcon} alt='' className='transition rotate-180 ml-1' />
//         </Dropdown.Toggle>
//         <Dropdown.Menu>
//           <Dropdown.Item disabled>
//             Switch to
//           </Dropdown.Item>
//           {products.map((product, index) => (<ProductItem key={index} product={product} />))}
//         </Dropdown.Menu>
//       </Dropdown>
//     </div>
//   )
// }

const LoginButton = () => {
  return (
    isElectron()
      ? <div className='float-right d-flex btn btn-primary' onClick={() => openExternalLink(BROWSER_LOGIN_ROUTE)}>Login/SignUp</div>
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
      console.log(profile)
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
        <CommunityButton />
      </div>
    )
  }

  renderLoginButton () {
    return getCurrentUser() ? '' : <LoginButton />
  }

  renderProfileOption () {
    return (
      <>{authService.isAdmin() &&
        <Dropdown.Item className='d-flex justify-content-between align-items-center' onClick={() => { this.navigateToPublishDocs() }}>
          <div><HostedApiIcon /><span>Hosted API</span></div>
          {this.getNotificationCount() > 0 &&
            <div className='user-notification-badge'>{this.getNotificationCount()}</div>}
        </Dropdown.Item>}
      </>
    )
  }

  render () {
    console.log(this.props.match.params)
    return (
      <>
        <GenericHeader {...this.props} {...this.state} getNotificationCount={() => this.getNotificationCount()} project_name='' organizations={JSON.parse(window.localStorage.getItem('organisationList')) || []} organizationId={getOrgId()} productName='hitman' renderNavTitle={() => this.renderNavTitle()} renderProfileOption={() => this.renderProfileOption()} handleOpenLink={(link) => openExternalLink(link)} renderLoginButton={() => this.renderLoginButton()} />
      </>
    )
  }
}

export default connect(mapStateToProps, null)(Header)
