import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import CollectionVersionForm from '../collectionVersions/collectionVersionForm'
import { deleteVersion, duplicateVersion } from '../collectionVersions/redux/collectionVersionsActions'
import ShareVersionForm from '../collectionVersions/shareVersionForm'
import { isDashboardRoute, ADD_GROUP_MODAL_NAME, getParentIds } from '../common/utility'
import './collectionVersions.scss'
import collectionVersionsService from './collectionVersionsService'
import AddEntity from '../main/addEntity/addEntity'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import NoFound from '../../assets/icons/noCollectionsIcon.svg'
import ExpandArrow from '../../assets/icons/expand-arrow.svg'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { addIsExpandedAction } from '../../store/clientData/clientDataActions'
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal'
import { ReactComponent as EditIcon } from '../../assets/icons/editsign.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { ReactComponent as ShareIcon } from '../../assets/icons/sharesign.svg'
// import {ReactComponent as Duplicate} from '../../assets/icons/duplicateSign.svg'

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
    delete_version: (version, props) => dispatch(deleteVersion(version, props)),
    duplicate_version: (version) => dispatch(duplicateVersion(version)),
    update_isExpand_for_versions: (payload) => dispatch(addIsExpandedAction(payload))
  }
}

class CollectionVersions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedVersionIds: {},
      showShareVersionForm: false,
      versionFormName: '',
      selectedVersion: {},
      showVersionForm: {
        addGroup: false,
        addPage: false,
        share: false,
        edit: false
      },
      theme: '',
      filter: '',
      selectedVersionIndex: '',
      results: {
        pages: [],
        endpoints: []
      },
      value: '',
      searchLoader: false
    }

    this.filterFlag = false
    this.eventkey = {}
    this.filteredOnlyVersions = {}
  }

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({ theme: this.props.collections[this.props.collection_id].theme })
    }

    const { pageId, endpointId } = this.props.match.params

    if (pageId) {
      this.setVersionForEntity(pageId, 'page')
    }

    if (endpointId) {
      this.setVersionForEntity(endpointId, 'endpoint')
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.selectedCollectionId !== this.props.selectedCollectionId) {
      this.setState({ selectedVersionIds: {} })
    }

    const { pageId, endpointId } = this.props.match.params
    const { pageId: prevPageId, endpointId: prevEndpointId } = prevProps.match.params

    if (pageId && prevPageId !== pageId) {
      this.setVersionForEntity(pageId, 'page')
    }

    if (endpointId && prevEndpointId !== endpointId) {
      this.setVersionForEntity(endpointId, 'endpoint')
    }
  }
  openAddPageEndpointModal(versionId) {
    this.setState({
      showAddCollectionModal: true,
      selectedVersion: {
        ...this.props.pages[versionId]
      }
    })
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
          selectedVersion={this.props?.rootParentId}
          pageType={3}
        />
      )
    )
  }

  setVersionForEntity(id, type) {
    const { versionId } = getParentIds(id, type, this.props)
  }

  setSelectedVersionId(id, value) {
    if (id && this.state.selectedVersionIds[id] !== value) {
      this.setState({ selectedVersionIds: { ...this.state.selectedVersionIds, [id]: value } })
    }
  }

  handleUpdate(collectionVersion) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/${this.props.collection_id}/versions/${collectionVersion.id}/edit`,
      editCollectionVersion: collectionVersion
    })
  }

  handleAddPage(versionId, collectionId) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/${collectionId}/versions/${versionId}/pages/new`,
      versionId: versionId
    })
  }

  handleDuplicate(version) {
    this.props.duplicate_version(version)
  }

  openShareVersionForm(version) {
    const showVersionForm = { share: true }
    this.setState({
      showVersionForm,
      versionFormName: 'Share Version',
      selectedVersion: version
    })
  }

  openAddVersionPageForm(version) {
    const showVersionForm = { addPage: true }
    this.setState({
      showVersionForm,
      versionFormName: 'Add New Version Page',
      selectedVersion: version
    })
  }

  openEditVersionForm(versionId) {
    this.setState({
      showCollectionForm: true,
      selectedVersion: {
        ...this.props.pages[versionId]
      }
    })
  }

  openDeleteVersionModal(versionId) {
    this.setState({
      showDeleteModal: true,
      selectedVersion: {
        ...this.props.versions[versionId]
      }
    })
  }

  showShareVersionForm() {
    return (
      this.state.showVersionForm.share && (
        <ShareVersionForm
          show={this.state.showVersionForm.share}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    )
  }

  showEditVersionForm() {
    return (
      this.state.showCollectionForm && (
        <CollectionVersionForm
          {...this.props}
          show
          onHide={() => {
            this.setState({ showCollectionForm: false })
          }}
          title='Edit Collection Version'
          selectedVersion={this.state.selectedVersion}
        />
      )
    )
  }

  closeVersionForm() {
    const showVersionForm = { share: false, addGroup: false, addPage: false }
    this.setState({ showVersionForm })
  }

  closeDeleteVersionModal() {
    this.setState({ showDeleteModal: false })
  }

  setSelectedVersion(e) {
    this.setState({
      selectedVersionIndex: e.currentTarget.value
    })
  }

  toggleVersionIds(id) {
    const isExpanded = this.props?.clientData?.[id]?.isExpanded || false
    this.props.update_isExpand_for_versions({
      value: !isExpanded,
      id: id
    })
  }

  renderBody(versionId, index) {
    const expanded = this.props?.clientData?.[this?.props?.rootParentId]?.isExpanded || false
    if (!isDashboardRoute(this.props, true)) return null
    return (
      <div className={['hm-sidebar-outer-block'].join(' ')} key={versionId}>
        <div className='sidebar-accordion versionBoldHeading' id='child-accordion'>
          <button tabIndex={-1} className={'pl-3 ' + (expanded ? 'expanded' : '')}>
            <div
              className='d-flex align-items-center cl-name'
              onClick={() => {
                this.toggleVersionIds(versionId)
              }}
            >
              {this.props?.defaultVersion === this.props?.defaultVersionId ? (
                <>
                  <span className='versionChovron'>
                    <img src={ExpandArrow} alt='' />
                  </span>
                  <div className='sidebar-accordion-item text-truncate d-inline'>{this.props.pages[this.props.defaultVersionId]?.name}</div>
                </>
              ) : (
                <>
                  <span className='versionChovron'>
                    <img src={ExpandArrow} alt='' />
                  </span>
                  <div className='sidebar-accordion-item text-truncate d-inline'>{this.props.pages[this.props.defaultVersionId]?.name}</div>
                </>
              )}
              {/* <div className='sidebar-accordion-item text-truncate d-inline'>{this.props.pages[this.props.defaultVersionId].name}</div> */}
            </div>
            {isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
              <div className='sidebar-item-action d-flex align-items-center'>
                <div className='mr-1 d-flex align-items-center' onClick={() => this.openAddPageEndpointModal(versionId)}>
                  <Plus />
                </div>
                <div className='sidebar-item-action-btn' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                  <i className='uil uil-ellipsis-v' />
                </div>
                <div className='dropdown-menu dropdown-menu-right'>
                  <div className='dropdown-item' onClick={() => this.openEditVersionForm(versionId)}>
                    <EditIcon /> Edit
                  </div>
                  <div
                    className='dropdown-item'
                    onClick={() => {
                      this.openDeleteVersionModal(versionId)
                    }}
                  >
                    <DeleteIcon /> Delete
                  </div>
                  {/* <div
                    className='dropdown-item'
                    onClick={() => {
                      this.handleDuplicate(this.props.versions[versionId])
                    }}
                  >
                    <Duplicate/> {' '}
                    Duplicate
                  </div> */}
                  <div className='dropdown-item' onClick={() => this.openShareVersionForm(this.props.versions[versionId])}>
                    <ShareIcon />
                    Share
                  </div>
                </div>
              </div>
            ) : null}
          </button>
          {expanded ? (
            <div className='version-collapse'>
              <Card.Body>
                <div className='versionPages pl-3'>
                  <CombinedCollections
                    {...this.props}
                    // pagesToRender={pagesToRender}
                    version_id={this.props.defaultVersionId}
                    show_filter_version={this.propsFromVersion.bind(this)}
                    // isPublishData={false}
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
      results.endpoints.push({ name: endpoint.name, type: 'endpoint', id: endpoint.id, requestType: endpoint.requestType })
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
    this.setState({ value: e.target.value, results: { pages: [], endpoints: [] }, searchLoader: true })
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

  getVersionsCount(filteredVersions) {
    const versionsCount = Object.keys(filteredVersions || {}).filter(
      (versionId) => filteredVersions[versionId].collectionId === this.props.collection_id
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
      this.filteredVersions = { ...this.props.versions }
      this.eventkey = {}
    }

    const versionsCount = this.getVersionsCount(this.filteredVersions)
    return (
      <>
        {this.showShareVersionForm()}
        {this.showEditVersionForm()}
        {this.showAddPageEndpointModal()}
        {this.state.showDeleteModal &&
          collectionVersionsService.showDeleteVersionModal(
            this.props,
            this.closeDeleteVersionModal.bind(this),
            'Delete Version',
            `Are you sure you want to delete this versions?
        All your groups, pages and endpoints present in this version will be deleted.`,
            this.state.selectedVersion
          )}
        {!isDashboardRoute(this.props, true) ? (
          <>
            <div>
              {/* {this.filteredVersions && Object.keys(this.filteredVersions).length > 1
                    ? (
                      <select
                        className='selected-version form-control light-orange-bg'
                        onChange={(e) => this.setSelectedVersion(e)}
                      >
                        {Object.keys(this.filteredVersions).map((id, index) => (
                          <option key={index} value={index}>
                            {this.props.versions[id]?.number}
                          </option>
                        ))}
                      </select>
                      )
                    : null} */}
              {this.renderPublicSearchBar()}
            </div>
          </>
        ) : null}
        {isDashboardRoute(this.props, true)
          ? // this.props.versionsToRender.map((versionId, index) => (
            this.renderBody(this.props.rootParentId)
          : // ))
            this.state.value
            ? this.renderResponses()
            : this.filteredVersions &&
              Object.keys(this.filteredVersions) &&
              Object.keys(this.filteredVersions)
                .filter((versionId) => this.filteredVersions[versionId].collectionId === this.props.collection_id)
                .map((versionId, index) => this.renderBody(versionId, index, versionsCount))}

        <div className='pl-4'>{this.renderForm(versionsCount)}</div>
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollectionVersions))
