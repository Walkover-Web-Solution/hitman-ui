import React, { Component, createRef } from 'react'
import { Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import moment from 'moment'
import Collections from '../collections/collections'
import './main.scss'
import {
  isDashboardRoute,
  isElectron,
  getOnlyUrlPathById,
  SESSION_STORAGE_KEY,
  getUrlPathById,
  isTechdocOwnDomain,
  isOnPublishedPage,
  hexToRgb,
  modifyDataForBulkPublish,
  isOnRedirectionPage
} from '../common/utility'
import { getCurrentUser, getOrgList, getCurrentOrg } from '../auth/authServiceV2'
import { ReactComponent as HitmanIcon } from '../../assets/icons/hitman.svg'
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'
import { ReactComponent as NoInvocationsIcon } from '../../assets/icons/emptyrandom.svg'
import NoFound, { ReactComponent as NoCollectionsIcon } from '../../assets/icons/noCollectionsIcon.svg'
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg'
import './main.scss'
import './sidebar.scss'
import PageForm from '../pages/pageForm'
import CollectionModal from '../collections/collectionsModal'
import DeleteSidebarEntityModal from './sidebar/deleteEntityModal'
import { DELETE_CONFIRMATION } from '../modals/modalTypes'
import { openModal } from '../modals/redux/modalsActions'
import UserProfileV2 from './userProfileV2'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { TbLogin2 } from "react-icons/tb"
import { updateDragDrop } from '../pages/redux/pagesActions'
import {background} from '../backgroundColor.js'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    endpoints: state.pages,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    historySnapshot: state.history,
    filter: '',
    modals: state.modals
  }
}

/** Desktop App Download URL */
// const DESKTOP_APP_DOWNLOAD_LINK = process.env.REACT_APP_DESKTOP_APP_DOWNLOAD_LINK

const mapDispatchToProps = (dispatch) => {
  return {
    open_modal: (modal, data) => dispatch(openModal(modal, data)),
    update_drag_and_drop: (draggedId, droppedOnId, pageIds) => dispatch(updateDragDrop(draggedId, droppedOnId, pageIds))
  }
}

function compareByCreatedAt(a, b) {
  const t1 = a?.createdAt
  const t2 = b?.createdAt
  let comparison = 0
  if (t1 < t2) {
    comparison = 1
  } else if (t1 > t2) {
    comparison = -1
  }
  return comparison
}

class SideBarV2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        filter: ''
      },
      name: '',
      email: '',
      endpoint: [],
      historySnapshot: null,
      selectedCollectionId: null,
      secondarySidebarToggle: false,
      primarySidebar: null,
      totalEndpointsCount: 0,
      showInviteTeam: false,
      search: false,
      endpoints: '',
      draggingOverId: null,
      draggedIdSelected: null,
      isHovered: false,
      thene: ''
    }
    this.inputRef = createRef()
    this.sidebarRef = createRef()
    // this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  // handleClickOutside(event) {
  //   const { focused: sidebarFocused } = this.props.sidebar
  //   if (sidebarFocused && this.sidebarRef && !this.sidebarRef.current.contains(event.target)) {
  //     store.dispatch({ type: sidebarActionTypes.DEFOCUS_SIDEBAR })
  //     document.removeEventListener('click', this.handleClickOutside)
  //   }
  // }
  handleHover = (isHovered) => {
    this.setState({ isHovered });
  };
  handleHovers = (isHover) => {
    this.setState({ isHover });
  };
  componentDidMount() {
    const pages = this.props.pages
    const endpoint = []
    Object.keys(pages).forEach((key) => {
      const page = pages[key]
      if (page && page.type === 4) {
        endpoint.push(page)
      }
    })
    this.setState({ endpoint: endpoint })
    if (getCurrentUser()) {
      const user = getCurrentUser()
      const name = user.first_name + user.last_name
      const email = user.email
      this.setState({ name, email })
    }
    if (this.props.historySnapshot) {
      this.setState({
        historySnapshot: Object.values(this.props.historySnapshot)
      })
    }
    if (this.props.endpoints) {
      this.setState({
        endpoints: Object.values(this.props.endpoints)
      })
    }
    if (this.props.pages) {
      this.setState({
        pages: Object.values(this.props.pages)
      })
    }
    if (this.props.location.collectionId) {
      this.collectionId = this.props.location.collectionId
    }

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('SIDEBAR_SHORTCUTS_CHANNEL', this.handleShortcuts)
      document.addEventListener('keydown', this.preventDefaultBehavior.bind(this), false)
    }
    document.addEventListener('keydown', this.handleShortcutKeys)
    if (isOnPublishedPage()) {
      this.inputRef.focus();
    }
  }

  handleShortcutKeys = (event) => {
    if (event.key === '/' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault()
      this.inputRef.focus()
    }
  }

  preventDefaultBehavior(e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
      e.preventDefault()
    }
  }

  componentWillUnmount() {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('SIDEBAR_SHORTCUTS_CHANNEL', this.handleShortcuts)
      document.removeEventListener('keydown', this.preventDefaultBehavior, false)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.historySnapshot !== prevProps.historySnapshot) {
      this.setState({
        historySnapshot: Object.values(this.props.historySnapshot)
      })
    }
    if (this.props.endpoints !== prevProps.endpoints) {
      this.setState({
        endpoints: Object.values(this.props.endpoints)
      })
    }
  }

  handleDeleteEntity(focusedNode) {
    this.props.open_modal(DELETE_CONFIRMATION, { nodeAddress: focusedNode })
  }

  handleOnChange = (e) => {
    this.setState({ data: { ...this.state.data, filter: e.target.value } })
    let obj1 = Object.values(this.props.historySnapshot)
    let obj2 = []
    let obj3 = []
    let searchData = e.target.value.toLowerCase()
    if (this.props.historySnapshot) {
      obj1 = obj1.filter(
        (o) =>
          o.endpoint?.name?.toLowerCase().includes(searchData) ||
          o.endpoint?.BASE_URL?.toLowerCase().includes(searchData) ||
          o.endpoint?.uri?.toLowerCase().includes(searchData)
      )
    }
    let sideBarData = this.props.pages

    for (let key in sideBarData) {
      let o = sideBarData[key]
      if (
        o.name?.toLowerCase().includes(searchData) ||
        o.BASE_URL?.toLowerCase().includes(searchData) ||
        o.uri?.toLowerCase().includes(searchData)
      ) {
        sideBarData[key]?.type == 4 ? obj2.push(sideBarData[key]) : obj3.push(sideBarData[key])
      }
    }

    this.setState({ historySnapshot: obj1, endpoints: obj2, pages: obj3 })
  }

  emptyFilter() {
    const data = { ...this.state.data }
    data.filter = ''
    this.setState({ data })
  }

  openCollection(collectionId) {
    this.collectionId = collectionId
    this.setState({ selectedCollectionId: collectionId, primarySidebar: false, secondarySidebarToggle: false })
  }

  openApiForm() {
    this.setState({ showOpenApiForm: true })
  }

  closeOpenApiFormModal() {
    this.setState({ showOpenApiForm: false })
  }

  openHistorySnapshot(id) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/history/${id}`,
      historySnapshotId: id
    })
  }

  openEndpoint(id) {
    if (isDashboardRoute(this.props) ) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/endpoint/${id}`
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, this.props?.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      this.props.history.push(pathName)
    }
  }

  openPage(id) {
    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${id}`
      })
    } else{
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, this.props?.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      this.props.history.push(pathName)
    }
  }

  renderPath(id, type) {
    let path = ''
    let collectionId = this.props.pages[id]?.collectionId
    switch (type) {
      case 'endpoint':
        path = this.props.collections[collectionId]?.name + ' > ' + getOnlyUrlPathById(id, this.props.pages)
        break
      case 'page':
        path = this.props.collections[collectionId]?.name + '>' + getOnlyUrlPathById(id, this.props.pages)
        break
      default:
        path = ''
        break
    }
    if (path) {
      return (
        <div style={{ fontSize: '11px' }} className='text-muted'>
          {path}
        </div>
      )
    } else return <p />
  }

  renderHistoryList() {
    return (
      <div className='mt-3'>
        {this.state.historySnapshot && this.state.historySnapshot.length > 0 ? (
          this.state.historySnapshot.sort(compareByCreatedAt).map((history) => this.renderHistoryItem(history))
        ) : (
          <div className='empty-collections'>
            <div>
              <EmptyHistory />
            </div>
            <div className='content'>
              <h5> No History available.</h5>
              <p />
            </div>
          </div>
        )}
      </div>
    )
  }

  renderEndpointsList() {
    return (
      <div>
        {this.state.endpoints.length > 0 && <div className='px-3'>Endpoints</div>}
        <div className='py-3'>
          {this.state.endpoints.length > 0 &&
            this.state.endpoints.map(
              (endpoint, index) =>
                Object.keys(endpoint).length !== 0 && (
                  <div
                    className='btn d-flex align-items-center mb-2'
                    onClick={() => {
                      this.openEndpoint(endpoint.id)
                    }}
                    key={index}
                  >
                    <div className={`api-label lg-label ${endpoint.requestType}`}>
                      <div className='endpoint-request-div'>{endpoint.requestType}</div>
                    </div>
                    <div className='ml-3'>
                      <div className='sideBarListWrapper'>
                        <div className='text-left'>
                          <p> {endpoint.name || endpoint.BASE_URL + endpoint.uri}</p>
                        </div>
                        {this.renderPath(endpoint.id, 'endpoint')}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
    )
  }

  renderPagesList() {
    return (
      <div>
        <div className='px-3'>Pages</div>
        <div className='py-3'>
          {this.props.pages &&
            this.state.pages &&
            this.state.pages.map(
              (page, index) =>
                Object.keys(page).length !== 0 &&
                !(page?.type === 2 || page?.type === 0) && (
                  <div
                    className='btn d-flex align-items-center mb-2'
                    onClick={() => {
                      this.openPage(page.id)
                    }}
                    key={index}
                  >
                    <div>
                      <i className='uil uil-file-alt' aria-hidden='true' />
                    </div>
                    <div className='ml-3'>
                      <div className='sideBarListWrapper'>
                        <div className='text-left'>
                          <p> {page.name}</p>
                        </div>
                        {this.renderPath(page.id, 'page')}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
    )
  }

  getAllChildIds = async (pageId) => {
    let pageObject = this.props.pages?.[pageId]
    let childIds = []
    if (pageObject?.child && pageObject?.child?.length > 0) {
      for (const childId of pageObject.child) {
        childIds.push(childId)
        childIds = childIds.concat(await this.getAllChildIds(childId))
      }
    }
    return childIds
  }

  handleOnDragOver = async (e) => {
    e.preventDefault()
  }

  onDragEnter = async (e, draggingOverId) => {
    e.preventDefault()
    this.setState({ draggingOverId })
  }

  onDragEnd = async (e) => {
    e.preventDefault()
    this.setState({ draggingOverId: null })
  }

  onDragStart = async (draggedId) => {
    this.setState({ draggedIdSelected: draggedId })
  }

  onDrop = async (e, droppedOnId) => {
    let pageIds = []
    e.preventDefault()

    if (this.state.draggedIdSelected === droppedOnId) return

    let draggedIdParent = this.props.pages?.[this.state.draggedIdSelected].parentId
    let droppedOnIdParent = this.props.pages?.[droppedOnId]?.parentId

    //now I want all ids of child of all draggedId
    const draggedIdChilds = await this.getAllChildIds(this.state.draggedIdSelected)

    pageIds.push(...draggedIdChilds, draggedIdParent, droppedOnIdParent)

    this.props.update_drag_and_drop(this.state?.draggedIdSelected, droppedOnId, pageIds)
  }

  renderHistoryItem(history) {
    return (
      Object.keys(history).length !== 0 && (
        <div
          key={history.id}
          className='btn d-flex align-items-center mb-2'
          onClick={() => {
            this.openHistorySnapshot(history?.id)
          }}
        >
          <div className={`api-label lg-label ${history?.endpoint?.requestType}`}>
            <div className='endpoint-request-div'>{history?.endpoint?.requestType}</div>
          </div>
          <div className='ml-3'>
            <div className='sideBarListWrapper'>
              <div className='text-left'>
                <p>{history?.endpoint?.name || history?.endpoint?.BASE_URL + history?.endpoint?.uri || 'Random Trigger'}</p>
              </div>
              <small className='text-muted'>{moment(history.createdAt).format('ddd, Do MMM h:mm a')}</small>
            </div>
          </div>
        </div>
      )
    )
  }

  renderTriggerList() {
    return (
      <div className='mt-3'>
        {this.state.historySnapshot && this.state.historySnapshot.filter((o) => o.endpoint.status === 'NEW').length > 0 ? (
          this.state.historySnapshot
            .filter((o) => o.endpoint.status === 'NEW')
            .sort(compareByCreatedAt)
            .map((history) => this.renderHistoryItem(history))
        ) : (
          <div className='empty-collections'>
            <div>
              <NoInvocationsIcon />
            </div>
            <div className='content'>
              <h5> No invocation made</h5>
            </div>
          </div>
        )}
      </div>
    )
  }

  renderSearchList() {
    if (this.state.data.filter !== '') {
      return this.state.pages.length > 0 || this.state.endpoint.length > 0 || this.state.historySnapshot.length > 0 ? (
        <div className='searchResult'>
          {this.state.pages.length > 0 ? this.renderPagesList() : null}
          {this.state.endpoint.length > 0 ? this.renderEndpointsList() : null}
          {this.state.historySnapshot.length > 0 ? (
            <div>
              <div className='px-3'>History</div>
              {this.renderHistoryList()}
            </div>
          ) : null}
        </div>
      ) : (
        <div className='d-flex justify-content-center align-items-center h-100 flex-d-col'>
          <img src={NoFound} alt='' />
          <span className='font-weight-700'>No Results</span>
        </div>
      )
    }
  }

  renderEmptyCollectionsIfNotLoggedIn() {
    return (
      <div className='text-center'>
        <div className='empty-collections mt-5'>
          <div>
            <NoCollectionsIcon />
          </div>
          <div className='content'>
            <h5> Your collection is Empty.</h5>
          </div>
          <Button className='btn-lg mt-2' variant='primary' onClick={() => this.setState({ showLoginSignupModal: true })}>
            + Add here
          </Button>{' '}
        </div>
      </div>
    )
  }

  renderCollections() {
    const collectionsToRender = Object.keys(this.props?.collections)
    return (
      <Collections
        {...this.props}
        handleOnDragOver={this.handleOnDragOver}
        onDragEnter={this.onDragEnter}
        onDragEnd={this.onDragEnd}
        onDragStart={this.onDragStart}
        onDrop={this.onDrop}
        draggingOverId={this.state.draggingOverId}
        collectionsToRender={collectionsToRender}
        selectedCollectionId={this.state.selectedCollectionId}
        empty_filter={this.emptyFilter.bind(this)}
        disable_secondary_sidebar={() => {
          this.setState({ secondarySidebarToggle: true })
        }}
        collection_selected={this.openCollection.bind(this)}
        filter={this.state.data.filter}
      />
    )
  }

  getTotalEndpointsCount(count) {
    this.setState({ totalEndpointsCount: count })
  }

  showAddCollectionModal() {
    return (
      this.state.showAddCollectionModal && (
        <CollectionModal
          {...this.props}
          title='Add Collection'
          onHide={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          show={this.state.showAddCollectionModal}
          // open_selected_collection={this.openSelectedCollection.bind(this)}
        />
      )
    )
  }

  openSelectedCollection(collectionId) {
    this.empty_filter()
    this.openCollection(collectionId)
  }

  handleOpenLink(link, current = false) {
    const { handleOpenLink } = this.props
    if (!handleOpenLink) {
      current ? window.open(link, '_self') : window.open(link, '_blank')
    } else {
      handleOpenLink(link)
    }
  }

  renderSearch() {
    return (
      <div tabIndex={0} className='d-flex align-items-center my-1 search-container'>
        <SearchIcon className='mr-2' />
        <input
          ref={(element) => {
            this.inputRef = element
          }}
          value={this.state.data.filter}
          className='search-input'
          placeholder='Type / to search'
          autoComplete='off'
          type='text'
          name='filter'
          id='search'
          onChange={(e) => this.handleOnChange(e)}
        />
      </div>
    )
  }
  renderSidebarContent() {
    const selectedCollectionName = this.props.collections[this.collectionId]?.name || ' '
    const collectionId = Object.keys(this.props?.collections)?.[0]
    return (
      <div
        ref={this.sidebarRef}
        className={[''].join(' ')}
      >
        {this.showAddCollectionModal()}
        {isOnPublishedPage() || isOnRedirectionPage() ? (
          <div className='sidebar-accordion'>
            <CombinedCollections
              {...this.props}
              collection_id={collectionId}
              rootParentId={this.props.collections?.[collectionId]?.rootParentId}
              setLatestUrl ={this.props.latestUrl}
            />
          </div>
        ) : (
          this.renderCollections()
        )}
      </div>
    )
  }

  renderSidebarHeader() {
    return (
      <div className='m-3 d-flex align-items-center'>
        <div>
          <HitmanIcon />
        </div>
        <div className='w-50 flex-grow-1 mx-3'>
          <div className='HITMAN-TITLE'>HITMAN</div>
        </div>
      </div>
    )
  }

  renderCollectionName() {
    let collectionKeys = Object.keys(this.props?.collections || {})
    const collectionName = this.props?.collections?.[collectionKeys[0]]?.name
    const publishedCollectionTitle = this.props?.collections?.[collectionKeys[0]]?.docProperties?.defaultTitle || ''
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) || this.state.idToRenderState;
    let collectionId = this.props?.pages?.[idToRender]?.collectionId ?? null
    var collectionTheme = this.props.collections[collectionId]?.theme
    const dynamicColor = hexToRgb(collectionTheme, 0.15);
    const staticColor = background['background_hover'] ;


    const backgroundStyle = {
      backgroundImage: this.state.isHovered
        ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})`
        : ''
    };
    return (
      <div className='hm-sidebar-header align-items-start pl-1'>
         {(this.props.collections[collectionKeys[0]]?.favicon ||
  this.props.collections[collectionKeys[0]]?.docProperties?.defaultLogoUrl) && (
  <div className='hm-sidebar-logo'>
    <img
      id='publicLogo'
      alt='public-logo'
      src={
        this.props.collections[collectionKeys[0]]?.favicon
          ? `data:image/png;base64,${this.props.collections[collectionKeys[0]]?.favicon}`
          : this.props.collections[collectionKeys[0]]?.docProperties?.defaultLogoUrl
      }
      width='60'
      height='60'
    />
  </div>
)}

        <h4 className='hm-sidebar-title'>
          {publishedCollectionTitle || collectionName || ''}
          <span>API Documentation</span>
        </h4>
        {isTechdocOwnDomain() && (
          <a href='/login' target='_blank' className='login-button position-fixed d-flex gap-5 ps-5 align-items-center' style={backgroundStyle} onMouseEnter={() => this.handleHover(true)} onMouseLeave={() => this.handleHover(false)}>
            <TbLogin2 className='text-black' />
            <button
              type='button'
              class='btn btn-lg'
              data-bs-toggle='tooltip'
              data-bs-placement='top'
              data-bs-title='Login to manage this docs'
            >
              Login to manage this docs
            </button>
          </a>
        )}
      </div>
    )
  }

  renderDashboardSidebar() {
    var isOnDashboardPage = isDashboardRoute(this.props)
    return (
      <>
        {isOnDashboardPage && getCurrentUser() && getOrgList() && getCurrentOrg() && <UserProfileV2 {...this.props} />}
        <div className='pr-2 pl-2 pt-3'>
          {isOnPublishedPage() && this.renderCollectionName()}
          {this.renderSearch()}
          {/* {this.renderDownloadDesktopApp()} */}
          {isOnDashboardPage && this.renderGlobalAddButton()}
        </div>
        <div className='sidebar-content'>
          {this.state.data.filter !== '' && this.renderSearchList()}
          {this.state.data.filter === '' && this.renderSidebarContent()}
        </div>
      </>
    )
  }

  renderGlobalAddButton() {
    const { filter } = this.state.data
    const isMarketplaceImported = this.props.collections[this.collectionId]?.importedFromMarketPlace
    const title = this.collectionId
      ? isMarketplaceImported
        ? 'Cannot add Entities to a Marketplace Collection.'
        : 'Add Entities to Collection'
      : 'Add/Import Collection'
    return (
      getCurrentUser() && (
        <div className='d-flex align-items-center justify-content-end'>
          {/* <span className='f-12 font-weight-700'>{filter === '' ? 'COLLECTION' : 'SEARCH RESULTS'}</span> */}
        </div>
      )
    )
  }

  handleAdd() {
    if (this.collectionId) {
      this.setState({ openAddEntitySelectionModal: true })
    } else {
      this.setState({ showAddCollectionModal: true })
    }
  }

  getSidebarInteractionClass() {
    return isDashboardRoute(this.props, true) ? 'sidebar' : 'sidebar'
  }

  openAddVersionForm(collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  closeVersionForm() {
    this.setState({ showVersionForm: false })
  }

  openAddEntitySelectionModal() {
    this.setState({ openAddEntitySelectionModal: true })
  }

  closeAddEntitySelectionModal() {
    this.setState({ openAddEntitySelectionModal: false })
  }

  openAddEntityModal(entity) {
    this.setState({ openAddEntitySelectionModal: false, entity })
  }

  closeAddEntityModal(entity) {
    this.setState({ entity: false })
  }

  showAddEntityModal() {
    if (this.state.entity === 'page') {
      return (
        <PageForm
          {...this.props}
          show
          onHide={() => this.closeAddEntityModal()}
          title='Add New Page'
          selectedCollection={this.collectionId}
          addEntity
        />
      )
    }
  }

  showDeleteEntityModal() {
    const { activeModal, modalData } = this.props.modals

    return activeModal === DELETE_CONFIRMATION && <DeleteSidebarEntityModal show {...modalData} />
  }

  render() {
    return (
      <>
        <nav className={this.getSidebarInteractionClass()}>
          {this.showAddEntityModal()}
          {this.showDeleteEntityModal()}
          <div className='primary-sidebar'>
            {/* [info] for publishedPage only this part is important */}

            {this.renderDashboardSidebar()}
          </div>
        </nav>
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SideBarV2))