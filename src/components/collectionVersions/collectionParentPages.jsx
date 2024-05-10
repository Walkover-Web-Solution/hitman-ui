import React, { Component } from 'react'
import { Card, Dropdown, Accordion, DropdownButton, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ShareVersionForm from './shareVersionForm'
import collectionVersionsService from './collectionVersionsService'
import {
  isDashboardRoute,
  getParentIds,
  getUrlPathById,
  isTechdocOwnDomain,
  SESSION_STORAGE_KEY,
  isOnPublishedPage,
  ADD_VERSION_MODAL_NAME
} from '../common/utility'
import './collectionVersions.scss'
import AddEntity from '../main/addEntity/addEntity'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import NoFound from '../../assets/icons/noCollectionsIcon.svg'
import ExpandArrow from '../../assets/icons/expand-arrow.svg'
import { deletePage, duplicatePage } from '../pages/redux/pagesActions'
import { approvePage, draftPage, pendingPage, rejectPage } from '../publicEndpoint/publicPageService'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { addIsExpandedAction, setDefaultversionId, updataForIsPublished } from '../../store/clientData/clientDataActions'
import pageService from '../pages/pageService'
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal'
import { onDefaultVersion } from '../publishDocs/redux/publishDocsActions'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { toast } from 'react-toastify'
import SubPageForm from '../groups/subPageForm'
import { ReactComponent as Rename } from '../../assets/icons/renameSign.svg'
import SelectVersion from './selectVersion/selectVersion'
import CustomModal from '../customModal/customModal'
import { MdOutlineSettings } from 'react-icons/md'
import PublishedVersionDropDown from './publishedVersionDropDown/publishedVersionDropDown'
import { MdExpandMore } from "react-icons/md"
import  IconButtons  from '../common/iconButton'
import { FiPlus } from "react-icons/fi"
import { BsThreeDots } from "react-icons/bs"
import { IoMdDocument } from "react-icons/io"

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
    update_isExpand_for_pages: (payload) => dispatch(addIsExpandedAction(payload)),
    set_Default_version_Id: (payload) => dispatch(setDefaultversionId(payload)),
    set_Default_Version: (orgId, versionData) => dispatch(onDefaultVersion(orgId, versionData)),
    setIsCheckForParenPage: (payload) => dispatch(updataForIsPublished(payload))
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
      searchLoader: false,
      selectedVersionId: '',
      selectedVersionName: '',
      defaultVersionName: '',
      defaultVersionId: '',
      publishDefaultVersionName: '',
      clickedList: [],
      selectedCheckbox: null,
      isListVisible: false,
      publishVersion: ''
    }
    this.filterFlag = false
    this.eventkey = {}
    this.versionDropDownRef = React.createRef();
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
    const defaultVersion = this.findDefaultVersion()
    if (defaultVersion) {
      this.setState({
        defaultVersionName: defaultVersion.name,
        selectedVersionId: defaultVersion.id,
        defaultVersionId: defaultVersion.id,
        selectedVersionName: defaultVersion.name,
        selectedCheckbox: defaultVersion.name || null
      })
    }
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

    if (prevProps?.pages?.[this.props?.rootParentId]?.child !== this.props?.pages?.[this.props?.rootParentId]?.child) {
      let check = this.checkIfSelectedVersionIdIsPresent()
      if (!check) {
        for (let index = 0; index < this.props?.pages?.[this.props?.rootParentId]?.child?.length; index++) {
          const versionId = this.props?.pages?.[this.props?.rootParentId]?.child?.[index]
          if (this.props?.pages?.[versionId]?.state === 1) {
            this.setState({ selectedVersionId: versionId, selectedVersionName: this.props?.pages?.[versionId]?.name, defaultVersionId: versionId, defaultVersionName: this.props?.pages?.[versionId]?.name })
            break;
          }
        }
      }
    }

    if (this.props?.pages?.[this.state.selectedVersionId] && this.props?.pages?.[this.state.selectedVersionId]?.name !== prevState.selectedVersionName) {
      if (prevState.selectedVersionId === prevState.defaultVersionId) {
        this.setState({ selectedVersionName: this.props.pages?.[this.state.selectedVersionId]?.name, defaultVersionName: this.props.pages?.[this.state.selectedVersionId]?.name })
      }
      else {
        this.setState({ selectedVersionName: this.props.pages?.[this.state.selectedVersionId]?.name })
      }
    }
  }

  checkIfSelectedVersionIdIsPresent() {
    for (let index = 0; index < this.props?.pages?.[this.props?.rootParentId]?.child.length; index++) {
      const elementId = this.props?.pages?.[this.props?.rootParentId]?.child?.[index];
      if (elementId === this.state.selectedVersionId) {
        return true
      }
    }
    return false
  }

  findDefaultVersion = () => {
    const { pages, rootParentId } = this.props
    const children = pages[rootParentId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1)
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

  manageVersion() {
    this.setState({
      showVersionForm: true
    })
  }

  hideModalVersion() {
    this.setState({
      showVersionForm: false
    })
  }

  openManageVersionModal() {
    return (
      this.state.showVersionForm && (
        <CustomModal modalShow={this.state.showVersionForm} setModal={() => this.hideModalVersion()}>
          <SelectVersion parentPageId={this.props?.rootParentId} />
        </CustomModal>
      )
    )
  }

  openAddPageEndpointModal(pageId) {
    this.setState({
      showAddCollectionModal: true,
      selectedPage: {
        ...this.props.pages[pageId]
      }
    })
  }

  openShareParentPageForm(pageId) {
    this.setState({
      showPageForm: { share: true },
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

  showAddPageEndpointModal() {
    return (
      this.state.showAddCollectionModal && (
        <DefaultViewModal
          {...this.props}
          title='Add Page'
          show={this.state.showAddCollectionModal}
          onCancel={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          onHide={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          selectedVersion={this.state.selectedVersionId ? this.state.selectedVersionId : this.state.defaultVersionId}
          pageType={3}
        />
      )
    )
  }

  showEditPageModal() {
    return (
      this.state.showPageForm.edit && (
        <SubPageForm
          {...this.props}
          title='Rename'
          show={this.state.showPageForm.edit}
          onCancel={() => {
            this.setState({ showPageForm: false })
          }}
          onHide={() => {
            this.setState({ showPageForm: false })
          }}
          selectedPage={this.props?.rootParentId}
          pageType={1}
        />
      )
    )
  }

  openEditPageForm(pageId) {
    this.setState({
      showPageForm: { edit: true },
      selectedPage: pageId
    })
  }

  closePageForm() {
    this.setState({ showPageForm: { share: false, addEndpoint: false, addPage: false } })
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
  handleRedirect(id){
    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${id}`
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, this.props.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      this.props.history.push(pathName)
    }
  }

  handleToggle(e,id) {
    e.stopPropagation();
    const isExpanded = this.props?.clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    this.props.update_isExpand_for_pages({
      value: !isExpanded,
      id: id
    })
  }

  handleDropdownItemClick(id, rootId) {
    const selectedVersionName = this.props?.pages[id]?.name
    const defaultVersionId = this.state.defaultVersionId
    const defaultVersionName = this.state.defaultVersionName
    this.setState({ selectedVersionName: selectedVersionName })
    this.props.set_Default_version_Id({
      value: id,
      defaultVersionId: defaultVersionId,
      selectedVersionName: selectedVersionName,
      defaultVersionName: defaultVersionName,
      rootId: rootId
    })
    this.setState({ selectedVersionId: id })
  }

  handleButton(rootparentId) {
    const object = this.props.pages
    const list = object[rootparentId].child
    this.renderListButtons(list)
  }
  renderListButtons(list) {
    const object = this.props.pages
    const namesAndIds = list.map((itemId) => ({
      id: object[itemId].id,
      name: object[itemId].name
    }))
    this.setState({ clickedList: namesAndIds })
    this.toggleListVisibility()
  }

  handleListButton(name) {
    this.setState({ publishVersion: name })
    // You can perform other actions here
  }

  openEditVersionForm(pageId) {
    this.setState({
      selectedVersion: {
        ...this.props.pages[pageId]
      }
    })
  }

  toggleListVisibility() {
    this.setState((prevState) => ({
      isListVisible: !prevState.isListVisible
    }))
  }
  closeDefaultVersionForm() {
    this.setState({ setDefaultVersion: false })
  }

  closeDeleteVersionModal() {
    this.setState({ showDeleteVersion: false })
  }

  openDeleteVersionModal(versionId) {
    this.setState({
      showDeleteVersion: true,
      selectedVersion: {
        ...this.props.pages[versionId]
      }
    })
  }

  handleDeleteVersion(id) {
    if (this.state.defaultVersionId === id) {
      toast.error("Default version can't be deleted")
    } else {
      this.openDeleteVersionModal(id)
    }
  }
  versionName() {
    const versionName = this.state.defaultVersionName.length > 10 ? `${this.state.defaultVersionName.substring(0, 7)} ... ` : this.state.defaultVersionName;
    return (this.props.pages?.[this.props.rootParentId]?.child?.length === 1) ? versionName : (this.state.selectedVersionName.length > 10 ? `${this.state.selectedVersionName.substring(0, 7)} ... ` : this.state.selectedVersionName);
  }

  versionDropDown(rootId) {
    return (
      <DropdownButton
        className='version-dropdown'
        ref={this.versionDropDownRef}
        id='dropdown-basic-button'
        onClick={(e) => e.stopPropagation()}
        title={this.versionName()}
      >
        {this.props.pages[rootId].child.map((childId, index) => (
          <Dropdown.Item key={index} onClick={(e) => this.handleDropdownItemClick(childId, rootId)}>
            {this.props.pages[childId]?.name}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    )
  }

  renderBody(pageId, index) {
    let isUserOnPublishedPage = isOnPublishedPage()
    const expanded = this.props?.clientData?.[pageId]?.isExpanded ?? isUserOnPublishedPage
    const publishData = this.props.modals.publishData
    const rootId = pageId
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === pageId ? 'selected' : (isDashboardRoute && this.props.match.params.pageId === pageId ? 'selected' : '')
    return (
      <>
        <div className={['hm-sidebar-outer-block'].join(' ')} key={pageId}>
          <div className='sidebar-accordion versionBoldHeading' id='child-accordion'>
            <button tabIndex={-1} className={`pl-3 ${expanded ? 'expanded' : ''}`}>
          <div className={`active-select d-flex align-items-center justify-content-between ${isSelected ? ' selected' : ''}`}>
              <div
                className={`d-flex align-items-center cl-name ` }
                onClick={(e) => {
                  this.handleRedirect(this.props.rootParentId)
                  if(!expanded){
                  this.handleToggle(e,this.props.rootParentId)
                  }
                }}
              >
                <div className='d-flex align-items-center cl-name'>
                  <span className='versionChovron'>
                  <MdExpandMore size={13} className='collection-icons-arrow d-none '/>
                  <IoMdDocument size={13} className='collection-icons d-inline  ml-1 mb-1'/>
                  </span>
                  <div
                    className='d-flex justify-content-between align-items-center name-parent-page'
                    draggable={!isUserOnPublishedPage}
                    onDragOver={this.props.handleOnDragOver}
                    onDragStart={() => this.props.onDragStart(pageId)}
                    onDrop={(e) => this.props.onDrop(e, pageId)}
                    onDragEnter={(e) => this.props.onDragEnter(e, pageId)}
                    onDragEnd={(e) => this.props.onDragEnd(e)}
                    style={this.props.draggingOverId === pageId ? { border: '3px solid red' } : null}
                  >
                    <div className='text-truncate d-inline'>{this.props.pages[pageId]?.name}</div>
                    {!isUserOnPublishedPage ? (
                      this.versionDropDown(rootId)
                    ) : (
                      <PublishedVersionDropDown
                        handleDropdownItemClick={this.handleDropdownItemClick.bind(this)}
                        rootParentId={this.props?.rootParentId}
                        defaultVersionName={this.state.defaultVersionName}
                        selectedVersionName={this.state.selectedVersionName}
                      />
                    )}
                  </div>
                </div>
              </div>
             

              {
                // [info] options not to show on publihsed page
                isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
                  <div className='sidebar-item-action d-flex align-items-center'>
                    <div
                      className='d-flex align-items-center'
                      onClick={() => this.openAddPageEndpointModal(this.state.selectedVersionId || this.state.defaultVersionId)}
                    >
                      <IconButtons><FiPlus /></IconButtons>
                    </div>
                    <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <IconButtons><BsThreeDots /></IconButtons>
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      <div className='dropdown-item d-flex' onClick={() => this.openEditPageForm(pageId)}>
                        <Rename /> Rename
                      </div>                     
                      <div
                        className='dropdown-item d-flex'
                        onClick={() => {
                          this.manageVersion(true)
                        }}
                      >
                        <MdOutlineSettings size={20} color='#f2994a' />
                        <span data-toggle='modal' data-target='#exampleModalCenter'> Manage Version
                        </span>
                      </div>
                      <div
                        className='dropdown-item text-danger d-flex'
                        onClick={() => {
                          this.openDeletePageModal(pageId)
                        }}
                      >
                        <DeleteIcon /> Delete
                      </div>
                    </div>
                  </div>
                ) : null
              }
              </div>
            </button>
            {expanded ? (
              <div className='version-collapse'>
                <Card.Body>
                  <div className='linkWrapper versionPages'>
                    <CombinedCollections
                      {...this.props}
                      page_id={pageId}
                      rootParentId={
                        this.props.pages[this.props.rootParentId].child.length === 1
                          ? this.state.defaultVersionId
                          : this.state.selectedVersionId
                      }
                    />
                  </div>
                </Card.Body>
              </div>
            ) : null}
          </div>
        </div>
      </>
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
        {(versionsCount === 0 && isDashboardRoute(this.props, true)) ||
          (!this.props.isPublishData && !this.props.modals.publishData && (
            <AddEntity placeholder='Version 1' type='version' entity={this.props.collection_id} addNewEntity={this.props.addVersion} />
          ))}
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
        {this.showAddPageEndpointModal()}

        {this.state.showVersionForm && this.openManageVersionModal()}
        {this.showEditPageModal()}

        {this.state.showDeleteVersion &&
          pageService.showDeletePageModal(
            this.props,
            this.closeDeleteVersionModal.bind(this),
            'Delete Version',
            `Are you sure you want to delete this Version?
        All your subpages and endpoints present in this version will be deleted.`,
            this.state.selectedVersion
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
        {this.renderBody(this.props.rootParentId)}
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollectionParentPages))
