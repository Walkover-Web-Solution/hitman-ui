import React, { Component } from 'react'
import { Button, Dropdown, Modal } from 'react-bootstrap'
import Avatar from 'react-avatar'
import lightArrow from '../../assets/icons/new-arrow.svg'
import User from '../../assets/icons/user.svg'
import SwitchRight from '../../assets/icons/switchRight.svg'
import Power from '../../assets/icons/power.svg'
import File from '../../assets/icons/file.svg'
import { products } from '../common/constants'
import HostedApiIcon from '../../assets/icons/hostedApiIcon.svg'
import { getCurrentUser } from '../auth/authServiceV2'
import GenericModal from './GenericModal'
import { switchOrg, createOrg } from '../../services/orgApiService'
import './userProfile.scss'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { closeAllTabs } from '../tabs/redux/tabsActions'
import { onHistoryRemoved } from '../history/redux/historyAction'
import { ReactComponent as Users } from '../../assets/icons/users.svg'

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
    historySnapshot: state.history,
    tabs: state.tabs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    close_all_tabs: (tabs) => dispatch(closeAllTabs(tabs)),
    remove_history: (data) => dispatch(onHistoryRemoved(data))
  }
}

class UserProfileV2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      orgFilter: '',
      moreFlag: false,
      showModal: false,
      loading: false,
      orgName: '',
      modalForTabs: 'false',
      tabsClosed: 'false',
      selectedOrg: '',
      currentOrg: ''
    }
  }

  componentDidMount() {
    if (getCurrentUser()) {
      this.setProfile()
    }
  }

  setProfile() {
    const currentUser = getCurrentUser()
    // const name = getProfileName(currentUser)
    this.setState({ name: currentUser.name })
    this.setState({ email: currentUser.email })
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal })
  }

  renderAvatarWithOrg(onClick, ref1) {
    // const { getNotificationCount } = this.getNotificationCount()
    return (
      <div
        className='menu-trigger-box d-flex align-items-center justify-content-between w-100'
        onClick={(e) => {
          e.preventDefault()
          onClick(e)
        }}
      >
        <div className='d-flex align-items-center position-relative'>
          <Avatar className='mr-2' color='#343a40' name={this.getCurrentOrg()?.name} size={30} round='4px' />
          {this.renderOrgName()}
          {/* {getNotificationCount && getNotificationCount() > 0 &&
            <span className='user-notification-badge'>{getNotificationCount()}</span>} */}
        </div>
        <img ref={ref1} src={lightArrow} alt='settings-gear' className='transition cursor-pointer' />
      </div>
    )
  }

  renderOrgName() {
    const { name } = this.getUserDetails()
    return (
      <div>
        <div className='org-name'>{this.getCurrentOrg()?.name || null}</div>
        {/* <span className='profile-details-label-light'>{name}</span> */}
        {/* {
                this.getNotificationCount() > 0 &&
                  <div className='user-notification-badge'>{this.getNotificationCount()}</div>
            } */}
      </div>
    )
  }

  getCurrentOrg() {
    const organizations = JSON.parse(window.localStorage.getItem('organisationList')) || []
    // const filteredOrgsArray = this.getAllOrgs(organizations)
    return organizations[0]
  }

  renderUserDetails() {
    const { name, email } = this.getUserDetails()
    return (
      <div className='profile-details plr-3 d-flex align-items-center' onClick={() => {}}>
        <div className='user-icon mr-2'>
          <img src={User} alt='user' />
        </div>
        <div className='profile-details-user-name'>
          {/* <span className='org-name'>{name}</span> */}
          <span className='profile-details-label-light'>{email}</span>
        </div>
      </div>
    )
  }

  renderInviteTeam() {
    return (
      <div
        className='mb-2 cursor-pointer'
        onClick={() => {
          this.openAccountAndSettings()
        }}
      >
        <Users className='mr-2' />
        <span>Invite User</span>
      </div>
    )
  }

  openAccountAndSettings = () => {
    const { history } = this.props
    const orgId = this.getCurrentOrg()?.id
    history.push({ pathname: `/orgs/${orgId}/invite` })
  }

  getUserDetails() {
    const email = this.state.email || ''
    const name = this.state.name
    return { email, name }
  }

  renderMenuButton() {
    return '' // this.renderProfileOption()   //Hosted API doc is not needed anymore
  }

  renderProfileOption() {
    return (
      // isAdmin() &&
      <div
        className='profile-listing'
        onClick={() => {
          this.navigateToPublishDocs()
        }}
      >
        <img src={HostedApiIcon} alt='apiIcon' />
        <span className='label'>Hosted API</span>
        {this.getNotificationCount() > 0 && <div className='user-notification-badge'>{this.getNotificationCount()}</div>}
      </div>
    )
  }

  navigateToPublishDocs() {
    const collection = this.getFirstPublicCollection()
    this.openPublishDocs(collection)
  }

  getFirstPublicCollection() {
    const allCollections = this.getPublicCollections()
    let firstCollection = {}
    const collectionId = allCollections[0]
    const collection = this.props.collections[collectionId]
    firstCollection = collection
    return firstCollection
  }

  getPublicCollections() {
    if (this.dataFetched()) {
      const pendingEndpointIds = Object.keys(this.props.endpoints).filter(
        (eId) =>
          this.props.endpoints[eId].state === 'Pending' ||
          (this.props.endpoints[eId].state === 'Draft' && this.props.endpoints[eId].isPublished)
      )
      const pendingPageIds = Object.keys(this.props.pages).filter(
        (pId) => this.props.pages[pId].state === 'Pending' || (this.props.pages[pId].state === 'Draft' && this.props.pages[pId].isPublished)
      )
      const endpointCollections = this.findPendingEndpointsCollections(pendingEndpointIds)
      const pageCollections = this.findPendingPagesCollections(pendingPageIds)
      const allCollections = [...new Set([...endpointCollections, ...pageCollections])]
      return allCollections
    }
  }

  dataFetched() {
    return this.props.collections && this.props.versions && this.props.groups && this.props.endpoints && this.props.pages
  }

  findPendingEndpointsCollections(pendingEndpointIds) {
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

  findPendingPagesCollections(pendingPageIds) {
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

  openPublishDocs(collection) {
    if (collection?.id) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collection.id}`
      })
    } else {
      const collection = this.props.collections[Object.keys(this.props.collections)[0]]
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collection.id}`
      })
    }
  }

  getNotificationCount() {
    const collections = this.getPublicCollections()
    return collections?.length || 0
  }

  openAccountAndSettings() {
    const { productName, history, organizationId, location } = this.props
    if (productName !== products.EBL) {
      this.openOptions('/manage/users')
    } else {
      history.push({
        pathname: `/orgs/${organizationId}/manage`,
        search: location.search
      })
    }
  }

  renderBilling() {
    return (
      <div
        className='profile-listing'
        onClick={() => {
          this.openOptions('/billing/subscription')
        }}
      >
        <img src={File} alt='file-icon' />
        <span className='label'>Billing</span>
      </div>
    )
  }

  openOptions(path) {
    const { match, handleOpenLink } = this.props
    const currProductUrl = process.env.REACT_APP_UI_BASE_URL || process.env.REACT_APP_UI_URL
    const { orgId } = match.params
    if (orgId) {
      let url = `${currProductUrl}/orgs/${orgId}${path}?product=hitman`
      if (path !== '/products') {
        url += `&redirect_uri=${currProductUrl}`
      }
      if (!handleOpenLink) {
        window.open(url, '_blank')
      } else {
        handleOpenLink(url)
      }
    } else {
      console.log('Organization ID not found')
    }
  }

  renderLogout() {
    return (
      <div
        className='profile-details'
        onClick={() => {
          this.handleLogout()
        }}
      >
        <img src={Power} className='mr-2' alt='power-icon' />
        <span className='mr-2'>Logout</span>
      </div>          
    )
  }

  handleLogout() {
    this.removeFromLocalStorage(this.props.tabs.tabsOrder)
    this.props.close_all_tabs(this.props.tabs.tabsOrder)
    this.props.remove_history(this.props.historySnapshot)
    this.props.history.push({
      pathname: '/logout'
    })
  }

  removeFromLocalStorage(tabIds) {
    tabIds.forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  handleTabsandHistory(value) {
    const tabIdsToClose = this.props.tabs.tabsOrder
    const history = this.props.historySnapshot

    if (value === 'yes') {
      this.props.close_all_tabs(tabIdsToClose)
      this.removeFromLocalStorage(tabIdsToClose)
      this.props.remove_history(history)
      // window.removeEventListener('beforeunload', this.handleBeforeUnload)
      switchOrg(this.state.currentOrg.id)
    } else if (value === 'no') {
      this.setState({ modalForTabs: false, showModal: false })
      // window.addEventListener('beforeunload', this.handleBeforeUnload)
    }
  }

  handleClose() {
    this.setState({ modalForTabs: false, showModal: false })
  }

  showModalForTabs() {
    if (this.state.modalForTabs === 'false') {
      return null
    }
    return (
      <Modal show={this.state.modalForTabs} onHide={()=>{this.handleClose()}} className='mt-4'>
        <Modal.Header
          closeButton
          onClick={() => {
            this.handleClose()
          }}
        >
          <Modal.Title>Save Tabs!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontWeight: '500' }}>If you switch organization all the tabs and history will be deleted!</Modal.Body>
        <Modal.Footer>
          <button
            className='btn btn-danger btn-lg mr-2'
            onClick={() => {
              this.handleTabsandHistory('yes')
            }}
          >
            Yes
          </button>
          <Button
            className='btn btn-secondary outline btn-lg'
            variant='secondary'
            onClick={() => {
              this.handleTabsandHistory('no')
            }}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  handleOrgClick(org, selectedOrg) {
    this.toggleModal()
    const tabIdsToClose = this.props.tabs.tabsOrder
    this.setState({ selectedOrg: selectedOrg, currentOrg: org })
    if (org.id === selectedOrg.id) {
      this.setState({ modalForTabs: false })
      toast.error('This organization is already selected')
    } else if (org.id !== selectedOrg.id && (tabIdsToClose.length === 1 || tabIdsToClose.length === 0)) {
      this.setState({ modalForTabs: false })
      switchOrg(org.id)
      this.removeFromLocalStorage(tabIdsToClose)
      this.props.close_all_tabs(tabIdsToClose)
      this.props.remove_history(this.props.historySnapshot)
    } else {
      this.setState({ modalForTabs: true })
    }
  }

  renderOrgListDropdown() {
    const organizations = JSON.parse(window.localStorage.getItem('organisationList')) || []
    const selectedOrg = organizations[0]
    return (
      <div className='org-listing-container '>
        <div className='org-listing-column d-flex flex-column'>
          {organizations.map((org, key) => (
            <Button
              className={`mb-2 p-2 ${org === selectedOrg ? 'active' : ''} `}
              id='publish_collection_btn'
              // variant= 'btn btn-outline'
              key={key}
              onClick={() => {
                this.handleOrgClick(org, selectedOrg)
              }}
            >
              {org.name}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  getAllOrgs(organizations) {
    const orgsArray = Object.values({ ...organizations } || {})
    const { orgFilter } = this.state
    const filteredOrgsArray = orgsArray
      .filter((org) => org.name.toLowerCase().includes(orgFilter.toLowerCase()))
      .sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
        else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
        else return 0
      })

    return filteredOrgsArray
  }

  setOrgFilter(orgFilter) {
    this.setState({ orgFilter })
  }

  getItemCount(orgCount) {
    const showFlag = this.state.moreFlag
    if (orgCount > 5 && !showFlag) {
      return 5
    } else {
      return orgCount
    }
  }

  setShowFlag() {
    let orgFilter = this.state.orgFilter
    const moreFlag = !this.state.moreFlag
    if (!moreFlag) {
      orgFilter = ''
    }
    this.setState({ orgFilter, moreFlag })
  }

  setName = (orgName) => {
    this.setState({ orgName })
  }

  validateName = (orgName) => {
    const regex = /^[a-zA-Z0-9_]+$/
    if (orgName && regex.test(orgName) && orgName.length >= 3 && orgName.length <= 50) {
      return true
    } else {
      return false
    }
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleAddOrg()
    }
  }

  handleAddOrg = async () => {
    try {
      if (!this.validateName(this.state.orgName)) {
        toast.error('Only alphanumeric and underscores are allowed')
        return
      }
      await createOrg(this.state.orgName)
    } catch (e) {
      toast.error('Something went wrong')
    }
  }

  render() {
    return (
      <>
        <div className='profile-menu'>
          <Dropdown className='d-flex align-items-center'>
            <Dropdown.Toggle
              as={React.forwardRef(({ children, onClick }, ref1) => this.renderAvatarWithOrg(onClick, ref1))}
              id='dropdown-custom-components'
            />
            <Dropdown.Menu>
              {this.renderUserDetails()}
              <div className='profile-listing-container'>
                {/* <Dropdown.Item>{this.renderMenuButton()}</Dropdown.Item> */}
                {/* <Dropdown.Item>{this.renderBilling()} </Dropdown.Item> */}
                <Dropdown.Item className='mt-2'>{this.renderInviteTeam()}</Dropdown.Item>
                <Dropdown.Item>{this.renderLogout()}</Dropdown.Item>
                {/* <Dropdown.Divider /> */}
                <Dropdown.Item>
                  {/* <div className='profile-menu'> */}
                  <span className='profile-details' onClick={this.toggleModal} type='button'>
                    <img className='user-icon mr-2' src={SwitchRight} alt='icon' />
                    Switch Organization
                  </span>
                  <GenericModal
                    orgName={this.state.orgName}
                    validateName={this.validateName}
                    handleKeyPress={this.handleKeyPress}
                    inputRef={this.inputRef}
                    setName={this.setName}
                    handleCloseModal={this.toggleModal}
                    showModal={this.state.showModal}
                    title='Switch Organization'
                    modalBody={this.renderOrgListDropdown()}
                    keyboard={false}
                    showInput
                    handleAddOrg={this.handleAddOrg}
                  />
                  {/* </div> */}
                </Dropdown.Item>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {this.state.modalForTabs ? this.showModalForTabs() : ''}
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserProfileV2))
