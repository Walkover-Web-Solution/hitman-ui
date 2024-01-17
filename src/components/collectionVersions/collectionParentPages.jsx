import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ShareVersionForm from './shareVersionForm'
import { isDashboardRoute, getParentIds, ADD_VERSION_MODAL_NAME } from '../common/utility'
import './collectionVersions.scss'
import collectionVersionsService from './collectionVersionsService'
import filterService from '../../services/filterService'
import AddEntity from '../main/addEntity/addEntity'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import NoFound from '../../assets/icons/noCollectionsIcon.svg'
import ExpandArrow from '../../assets/icons/expand-arrow.svg'
import { deletePage, duplicatePage } from '../pages/redux/pagesActions'
import { approvePage, draftPage, pendingPage, rejectPage } from '../publicEndpoint/publicPageService'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { addIsExpandedAction } from '../../store/clientData/clientDataActions'
import pageService from '../pages/pageService'

const mapStateToProps = (state) => {
  return {
    endpoints: state.endpoints,
    versions: state.versions,
    pages: state.pages,
    clientData: state.clientData
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    delete_page: (page) => dispatch(deletePage(page)),
    duplicate_page: (page) => dispatch(duplicatePage(page)),
    pending_page: (page) => dispatch(pendingPage(page)),
    approve_page: (page) => dispatch(approvePage(page)),
    draft_page: (page) => dispatch(draftPage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
    update_isExpand_for_pages: (payload) => dispatch(addIsExpandedAction(payload))
  }
}

class CollectionParentPages extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedParentPageIds: {},
      showShareVersionForm: false,
      showDeleteModal: false,
      pageFormName: '',
      selectedPage: {},
      showPageForm: {
        addEndpoint: false,
        addPage: false,
        share: false,
        edit: false
      },
      showVersionForm: false,
      versionFormName: '',
      theme: '',
      filter: '',
      selectedParentPageIndex: '',
      results: {
        pages: [],
        endpoints: []
      },
      value: '',
      searchLoader: false
    }

    this.filterFlag = false
    this.eventkey = {}
    this.scrollRef = {}
  }

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({
        theme: this.props.collections[this.props.collection_id].theme
      })
    }

    const { pageId, endpointId } = this.props.match.params
    if (pageId) this.setParentPageForEntity(pageId, 'page')

    if (endpointId) this.setParentPageForEntity(endpointId, 'endpoint')
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.selectedCollectionId !== this.props.selectedCollectionId) {
      this.setState({ selectedParentPageIds: {} })
    }

    const { pageId, endpointId } = this.props.match.params
    const { pageId: prevPageId, endpointId: prevEndpointId } = prevProps.match.params

    if (pageId && prevPageId !== pageId) {
      this.setParentPageForEntity(pageId, 'page')
    }

    if (endpointId && prevEndpointId !== endpointId) {
      this.setParentPageForEntity(endpointId, 'endpoint')
    }
  }

  setParentPageForEntity(id, type) {
    const { pageId } = getParentIds(id, type, this.props)
  }

  setSelectedVersionId(id, value) {
    if (id && this.state.selectedParentPageIds[id] !== value) {
      this.setState({
        selectedParentPageIds: {
          ...this.state.selectedParentPageIds,
          [id]: value
        }
      })
    }
  }

  handleUpdate(collectionVersion) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/${this.props.collection_id}/pages/${collectionVersion.id}/edit`,
      editCollectionVersion: collectionVersion
    })
  }

  handleAddPage(pageId, collectionId) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/${collectionId}/versions/${pageId}/pages/new`,
      pageId: pageId
    })
  }

  handleDuplicate(page) {
    this.props.duplicate_page(page)
  }
  closeCollectionForm() {
    this.setState({ showCollectionForm: false, showImportVersionForm: false })
  }
  openAddVersionForm(page) {
    this.setState({
      showVersionForm: true,
      versionFormName: 'Add New Version',
      selectedParentPage: page
    })
  }

  openShareParentPageForm(pageId) {
    const showPageForm = { share: true }
    this.setState({
      showPageForm,
      pageFormName: 'Share Parent Page',
      selectedPage: { ...this.props.pages[pageId] }
    })
  }

  openDeletePageModal(pageId) {
    this.setState({
      showDeleteModal: true,
      selectedPage: {
        ...this.props.pages[pageId]
      }
    })
  }

  showShareVersionForm() {
    return (
      this.state.showPageForm.share && (
        <ShareVersionForm
          show={this.state.showPageForm.share}
          onHide={() => this.closePageForm()}
          title={this.state.pageFormName}
          selectedPage={this.state.selectedPage}
        />
      )
    )
  }

  closePageForm() {
    const showPageForm = { share: false, addGroup: false, addPage: false }
    this.setState({ showPageForm })
  }

  closeVersionForm() {
    this.setState({ showVersionForm: false })
  }
  closeDeletePageModal() {
    this.setState({ showDeleteModal: false })
  }
  closeDeletePageModal() {
    this.setState({ showDeleteModal: false })
  }

  setSelectedParentPage(e) {
    this.setState({
      selectedParentPageIndex: e.currentTarget.value
    })
  }

  toggleParentPageIds(id) {
    const isExpanded = this.props?.clientData?.[id]?.isExpanded || false
    this.props.update_isExpand_for_pages({
      value: !isExpanded,
      id: id
    })
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${id}`
    })
  }

  scrolltoPage(pageId) {
    const ref = this.scrollRef[pageId] || null
    if (ref) {
      setTimeout(() => {
        ref.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        })
      }, 100)
    }
  }

  renderBody(pageId, index) {
    const expanded = this.props?.clientData?.[pageId]?.isExpanded || false

    if (this.scrollRef[pageId]) this.scrolltoPage(pageId)
    if (!isDashboardRoute(this.props, true)) return null
    return (
      <div className={['hm-sidebar-outer-block'].join(' ')} key={pageId}>
        <div className='sidebar-accordion versionBoldHeading' id='child-accordion'>
          <button
            tabIndex={-1}
            ref={(newRef) => {
              this.scrollRef[pageId] = newRef
            }}
            className={'pl-3 ' + (expanded ? 'expanded' : '')}
          >
            <div
              className='d-flex align-items-center cl-name'
              onClick={() => {
                this.toggleParentPageIds(this.props.rootParentId)
              }}
            >
              <span className='versionChovron'>
                <img src={ExpandArrow} alt='' />
              </span>
              <div className='sidebar-accordion-item text-truncate d-inline'>{this.props.pages[pageId].name}</div>
            </div>
            {isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
              <div className='sidebar-item-action d-flex align-items-center'>
                <div className='mr-1 d-flex align-items-center' onClick={() => this.openAddVersionForm(this.props.rootParentId)}>
                  <Plus />
                </div>
                <div className='sidebar-item-action-btn' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                  <i className='uil uil-ellipsis-v' />
                </div>
                <div className='dropdown-menu dropdown-menu-right'>
                  <div
                    className='dropdown-item'
                    onClick={() => {
                      this.openDeletePageModal(pageId)
                    }}
                  >
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                      <path
                        d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path d='M7.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M10.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>{' '}
                    Delete
                  </div>
                  <div
                    className='dropdown-item'
                    onClick={() => {
                      this.handleDuplicate(this.props.rootParentId)
                    }}
                  >
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>{' '}
                    Duplicate
                  </div>
                  <div className='dropdown-item' onClick={() => this.openShareParentPageForm(pageId)}>
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M13.5 6C14.7426 6 15.75 4.99264 15.75 3.75C15.75 2.50736 14.7426 1.5 13.5 1.5C12.2574 1.5 11.25 2.50736 11.25 3.75C11.25 4.99264 12.2574 6 13.5 6Z'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M4.5 11.25C5.74264 11.25 6.75 10.2426 6.75 9C6.75 7.75736 5.74264 6.75 4.5 6.75C3.25736 6.75 2.25 7.75736 2.25 9C2.25 10.2426 3.25736 11.25 4.5 11.25Z'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M13.5 16.5C14.7426 16.5 15.75 15.4926 15.75 14.25C15.75 13.0074 14.7426 12 13.5 12C12.2574 12 11.25 13.0074 11.25 14.25C11.25 15.4926 12.2574 16.5 13.5 16.5Z'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M6.4425 10.1323L11.565 13.1173'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M11.5575 4.88232L6.4425 7.86732'
                        stroke='#E98A36'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    Share
                  </div>
                </div>
              </div>
            ) : null}
          </button>
          {expanded ? (
            <div className='version-collapse'>
              <Card.Body>
                <div className='linkWrapper versionPages pl-4'>
                  <CombinedCollections
                    {...this.props}
                    page_id={pageId}
                    // show_filter_pages={this.propsFromParentPage.bind(this)}
                    rootParentId={this.props.rootParentId}
                  />
                </div>
              </Card.Body>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  searchFunction() {
    const value = this.state.value || ''
    const pages = Object.values(this.props.pages)
    const endpoints = Object.values(this.props.endpoints)
    const filteredEndpoints = endpoints.filter((o) => o.name.match(new RegExp(value, 'i')))
    const filteredPages = pages.filter((o) => o.name.match(new RegExp(value, 'i')))
    const results = {
      pages: [],
      endpoints: []
    }
    filteredPages.forEach((page) => {
      results.pages.push({ name: page.name, type: 'page', id: page.id })
    })
    filteredEndpoints.forEach((endpoint) => {
      results.endpoints.push({
        name: endpoint.name,
        type: 'endpoint',
        id: endpoint.id,
        requestType: endpoint.requestType
      })
    })
    this.setState({ results, searchLoader: false })
  }

  renderResponses() {
    return (
      <div className='hm-sidebar-outer-block'>
        {!this.state.searchLoader ? (
          this.state.results.pages.length !== 0 || this.state.results.endpoints.length !== 0 ? (
            <>
              {this.state.results.pages.length !== 0 && (
                <div className='my-3'>
                  <div className='hm-sidebar-label my-3'>Pages</div>
                  {this.state.results.pages.map((result) => this.renderListItem(result))}
                </div>
              )}
              {this.state.results.endpoints.length !== 0 && (
                <div className='my-3'>
                  <div className='hm-sidebar-label my-3'>Endpoints</div>
                  {this.state.results.endpoints.map((result) => this.renderListItem(result))}
                </div>
              )}
            </>
          ) : (
            <div className='d-flex justify-content-center align-items-center h-100 flex-d-col'>
              <img src={NoFound} alt='' />
              <span className='font-weight-700'>No Results</span>
            </div>
          )
        ) : (
          <div className='text-center'>Searching...</div>
        )}
      </div>
    )
  }

  renderListItem(item) {
    switch (item.type) {
      case 'endpoint':
        return (
          <div
            className='hm-sidebar-item'
            onClick={() => {
              this.openLink(item)
            }}
          >
            <div className={`api-label ${item.requestType}`}>
              <div className='endpoint-request-div'>{item.requestType}</div>
            </div>
            <span className='ml-2'>{item.name}</span>
          </div>
        )
      case 'page':
        return (
          <div
            className='hm-sidebar-item'
            onClick={() => {
              this.openLink(item)
            }}
          >
            <i className='uil uil-file-alt' />
            <span className='mx-1'>{item.name}</span>
          </div>
        )
      default:
        break
    }
  }

  openLink(item) {
    const collectionId = this.props.match.params.collectionId
    const collectionName = this.props.collectionName
    let link = ''
    switch (item.type) {
      case 'endpoint':
        link = `/p/${collectionId}/e/${item.id}/${collectionName}`
        break
      case 'page':
        link = `/p/${collectionId}/pages/${item.id}/${collectionName}`
        break
      default:
        break
    }
    if (link.length) {
      this.props.history.push({
        pathname: link
      })
    }
  }

  handleChange(e) {
    clearTimeout(this.typingTimeout)
    this.typingTimeout = setTimeout(this.searchFunction.bind(this), 1000)
    this.setState({
      value: e.target.value,
      results: { pages: [], endpoints: [] },
      searchLoader: true
    })
  }

  renderPublicSearchBar() {
    return (
      <div
        className='search-box'
        onClick={() => {
          this.myInputRef.focus()
          this.setState({ enableSearch: true })
        }}
      >
        <input
          ref={(c) => (this.myInputRef = c)}
          value={this.state.value || ''}
          type='text'
          name='filter'
          id='search'
          placeholder='Search'
          onChange={(e) => this.handleChange(e)}
          autoComplete='off'
          onBlur={() => {
            if (!this.state.value) {
              this.setState({ enableSearch: false })
            }
          }}
        />
      </div>
    )
  }

  getVersionsCount(filteredPages) {
    const versionsCount = Object.keys(filteredPages || {}).filter(
      (pageId) => filteredPages[pageId].collectionId === this.props.collection_id
    ).length

    return versionsCount
  }

  renderForm(versionsCount) {
    return (
      <>
        {versionsCount === 0 && isDashboardRoute(this.props, true) && (
          <AddEntity placeholder='Version 1' type='version' entity={this.props.collection_id} addNewEntity={this.props.addVersion} />
        )}
      </>
    )
  }

  render() {
    if (this.filterFlag === false || this.props.filter === '' || this.state.filter !== this.props.filter) {
      this.filteredPages = { ...this.props.pages }
      this.eventkey = {}
    }

    const versionsCount = this.getVersionsCount(this.filteredPages)
    return (
      <>
        {this.showShareVersionForm()}
        {this.state.showVersionForm &&
          collectionVersionsService.showVersionForm(
            this.props,
            this.closeVersionForm.bind(this),
            this.props.rootParentId,
            ADD_VERSION_MODAL_NAME
          )}
        {this.state.showDeleteModal &&
          pageService.showDeletePageModal(
            this.props,
            this.closeDeletePageModal.bind(this),
            'Delete Page',
            `Are you sure you want to delete this pages?
        All your versions,subpages and endpoints present in this page will be deleted.`,
            this.state.selectedPage
          )}
        {!isDashboardRoute(this.props, true) ? (
          <>
            <div
              className={
                this.filteredPages && Object.keys(this.filteredPages).length > 1
                  ? this.state.enableSearch
                    ? 'versionWrapper versionsAvailable d-flex enableSearch'
                    : 'versionWrapper versionsAvailable d-flex'
                  : 'versionWrapper'
              }
            >
              {this.filteredPages && Object.keys(this.filteredPages).length > 1 ? (
                <select
                  className='selected-version form-control light-orange-bg'
                  onChange={(e) => {
                    this.setSelectedParentPage(e)
                  }}
                >
                  {Object.keys(this.filteredPages)?.map((id, index) => (
                    <option key={index} value={index}>
                      {this.props.pages[id]?.name}
                    </option>
                  ))}
                </select>
              ) : null}
              {this.renderPublicSearchBar()}
            </div>
          </>
        ) : null}
        {isDashboardRoute(this.props, true)
          ? // this.props.pagesToRender.map((pageId, index) => {
            this.renderBody(this.props.rootParentId)
          : // })
            this.state.value
            ? this.renderResponses()
            : this.filteredPages &&
              Object.keys(this.filteredPages) &&
              Object.keys(this.filteredPages)
                .filter((pageId) => this.filteredPages[pageId].collectionId === this.props.collection_id)
                .map((pageId, index) => this.renderBody(pageId, index, versionsCount))}

        <div className='pl-4'>{this.renderForm(versionsCount)}</div>
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollectionParentPages))
