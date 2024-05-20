import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import shortId from 'shortid'
import ImportVersionForm from '../collectionVersions/importVersionForm'
import { isDashboardRoute, openExternalLink, getParentIds, isOnPublishedPage } from '../common/utility'
import collectionsService from './collectionsService'
import { addCollection, deleteCollection, duplicateCollection, updateCollection, addCustomDomain } from './redux/collectionsActions'
import './collections.scss'
import PublishDocsModal from '../publicEndpoint/publishDocsModal'
import TagManager from 'react-gtm-module'
import TagManagerModal from './tagModal'
import emptyCollections from '../../assets/icons/emptyCollections.svg'
import hitmanLogo from '../../assets/icons/hitman.svg'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import { addNewTab } from '../tabs/redux/tabsActions'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { addIsExpandedAction } from '../../store/clientData/clientDataActions'
import DefaultViewModal from './defaultViewModal/defaultViewModal'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { ReactComponent as EditIcon } from '../../assets/icons/editsign.svg'
import { ReactComponent as GoToDocs } from '../../assets/icons/gotodocssign.svg'
import { ReactComponent as AddGoogleTag } from '../../assets/icons/addGoogleTagsign.svg'
import { RiShareForward2Line } from "react-icons/ri";
import { MdExpandMore } from 'react-icons/md'
import MoveModal from '../common/moveModal/moveModal'
import  IconButtons  from '../common/iconButton'
import { FiPlus } from "react-icons/fi"
import { BsThreeDots } from "react-icons/bs"


const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    pages: state.pages,
    endpoints: state.endpoints,
    clientData: state.clientData
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection) => dispatch(addCollection(newCollection)),
    update_collection: (editedCollection) => dispatch(updateCollection(editedCollection)),
    delete_collection: (collection, props) => dispatch(deleteCollection(collection)),
    duplicate_collection: (collection) => dispatch(duplicateCollection(collection)),
    add_custom_domain: (collectionId, domain) => dispatch(addCustomDomain(collectionId, domain)),
    add_new_tab: () => dispatch(addNewTab()),
    update_isExpand_for_collection: (payload) => dispatch(addIsExpandedAction(payload))
  }
}

class CollectionsComponent extends Component {
  constructor(props) {
    super(props)
    this.handleOrgModalClose = this.handleOrgModalClose.bind(this);
    this.state = {
      showCollectionForm: false,
      collectionFormName: '',
      selectedCollection: {},
      showPublishDocsModal: false,
      defaultPublicLogo: hitmanLogo,
      publicLogoError: false,
      showRemoveModal: false,
      selectedCollectionIds: [],
      showOrgModal: false,
    }
    this.names = {}
  }

  closeCollectionForm() {
    this.setState({ showCollectionForm: false, showImportVersionForm: false })
  }

  componentDidMount() {
    const { pageId, endpointId } = this.props.match.params

    if (pageId) this.setCollectionForEntity(pageId, 'page')

    if (endpointId) this.setCollectionForEntity(endpointId, 'endpoint')
  }

  componentDidUpdate(prevProps, prevState) {
    const { pageId, endpointId } = this.props.match.params
    const { pageId: prevPageId, endpointId: prevEndpointId } = prevProps.match.params

    if (pageId && prevPageId !== pageId) this.setCollectionForEntity(pageId, 'page')

    if (endpointId && prevEndpointId !== endpointId) this.setCollectionForEntity(endpointId, 'endpoint')
  }

  setCollectionForEntity(id, type) {
    const { collectionId } = getParentIds(id, type, this.props)
  }

  setSelectedCollectionId(id, value) {
    if (id && this.state.selectedCollectionIds[id] !== value) {
      this.setState({
        selectedCollectionIds: {
          ...this.state.selectedCollectionIds,
          [id]: value
        }
      })
    }
  }

  // async dndMoveEndpoint (endpointId, sourceGroupId, destinationGroupId) {
  //   const groups = { ...this.state.groups }
  //   const endpoints = { ...this.state.endpoints }
  //   const originalEndpoints = { ...this.state.endpoints }
  //   const originalGroups = { ...this.state.groups }
  //   const endpoint = endpoints[endpointId]
  //   endpoint.groupId = destinationGroupId
  //   endpoints[endpointId] = endpoint
  //   groups[sourceGroupId].endpointsOrder = groups[
  //     sourceGroupId
  //   ].endpointsOrder.filter((gId) => gId !== endpointId.toString())
  //   groups[destinationGroupId].endpointsOrder.push(endpointId)
  //   this.setState({ endpoints, groups })
  //   try {
  //     delete endpoint.id
  //     await endpointApiService.updateEndpoint(endpointId, endpoint)
  //   } catch (error) {
  //     this.setState({ endpoints: originalEndpoints, groups: originalGroups })
  //   }
  // }

  async handleAddCollection(newCollection) {
    newCollection.requestId = shortId.generate()
    this.props.add_collection(newCollection)
  }

  async handleUpdateCollection(editedCollection) {
    this.props.update_collection(editedCollection)
  }

  async handleDeleteGroup(deletedGroupId) {
    this.props.delete_group(deletedGroupId)
  }

  async handleDuplicateCollection(collectionCopy) {
    this.props.duplicate_collection(collectionCopy)
  }

  async handleOrgModalOpen(collection) {
    this.setState({ showOrgModal: true })
    this.setState({ moveCollection: collection })
  }

  handleOrgModalClose() {
    this.setState({ showOrgModal: false })
  }

  handleGoToDocs(collection) {
    const publicDocsUrl = `${process.env.REACT_APP_PUBLIC_UI_URL}/p?collectionId=${collection.id}`
    openExternalLink(publicDocsUrl)
  }

  openEditCollectionForm(collectionId) {
    this.setState({
      showCollectionForm: true,
      collectionFormName: 'Edit Collection',
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  openDeleteCollectionModal(collectionId) {
    if (this.state.openSelectedCollection === true) {
      this.setState({ openSelectedCollection: false })
    }
    this.setState({
      showDeleteModal: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  openImportVersionForm(collectionId) {
    this.setState({
      showImportVersionForm: true,
      collectionFormName: 'Import Version',
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  showImportVersionForm() {
    return (
      this.state.showImportVersionForm && (
        <ImportVersionForm
          {...this.props}
          show={this.state.showImportVersionForm}
          onHide={() => this.closeCollectionForm()}
          title={this.state.collectionFormName}
          selected_collection={this.state.selectedCollection}
        />
      )
    )
  }

  handlePublicCollectionDescription(collection) {
    this.props.history.push({
      pathname: `/p/${collection.id}/description/${collection.name}`,
      collection
    })
  }

  handlePublic(collection) {
    collection.isPublic = !collection.isPublic
    this.props.update_collection({ ...collection })
  }

  closeDeleteCollectionModal() {
    this.setState({ showRemoveModal: false, showDeleteModal: false })
  }

  openSelectedCollection(collectionId) {
    this.props.empty_filter()
    this.props.collection_selected(collectionId)
    this.collectionId = collectionId
    this.setState({ openSelectedCollection: true })
    // this.openPublishSettings(collectionId)
  }

  openAllCollections() {
    this.props.empty_filter()
    this.collectionId = null
    this.setState({ openSelectedCollection: false })
  }

  TagManagerModal(collectionId) {
    this.setState({ TagManagerCollectionId: collectionId })
  }

  openTagManagerModal() {
    return (
      this.state.TagManagerCollectionId && (
        <TagManagerModal
          {...this.props}
          show
          onHide={() => this.setState({ TagManagerCollectionId: false })}
          title='Google Tag Manager'
          collection_id={this.state.TagManagerCollectionId}
        />
      )
    )
  }

  dataFetched() {
    return this.props.collections && this.props.endpoints && this.props.pages
  }

  // findEndpointCount (collectionId) {
  //   if (this.dataFetched()) {
  //     const pageIds = Object.keys(this.props.pages).filter(
  //       (pId) => this.props.pageIds[pId].collectionId === collectionId
  //     )
  //     const groupIds = Object.keys(this.props.groups)
  //     const groupsArray = []
  //     for (let i = 0; i < groupIds.length; i++) {
  //       const groupId = groupIds[i]
  //       const group = this.props.groups[groupId]

  //       if (pageIds.includes(group.versionId)) {
  //         groupsArray.push(groupId)
  //       }
  //     }

  //     const endpointIds = Object.keys(this.props.endpoints)
  //     const endpointsArray = []

  //     for (let i = 0; i < endpointIds.length; i++) {
  //       const endpointId = endpointIds[i]
  //       const endpoint = this.props.endpoints[endpointId]

  //       if (groupsArray.includes(endpoint.groupId)) {
  //         endpointsArray.push(endpointId)
  //       }
  //     }
  //     return endpointsArray.length
  //   }
  // }

  removeImporedPublicCollection(collectionId) {
    if (this.state.openSelectedCollection === true) {
      this.setState({ openSelectedCollection: false })
    }
    this.setState({
      showRemoveModal: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  toggleSelectedColelctionIds(id) {
    const isExpanded = this.props?.clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    this.props.update_isExpand_for_collection({
      value: !isExpanded,
      id
    })
    this.openPublishSettings(id)
  }

  async openPublishSettings(collectionId) {
    if (collectionId) {
      this.props.history.push(`/orgs/${this.props.match.params.orgId}/dashboard/collection/${collectionId}/settings`)
    }
    const activeTab = this.props.tabs.activeTabId
    // store.dispatch(updateTab(activeTab, { state: { pageType: 'SETTINGS' } }))
  }

  openAddPageEndpointModal(collectionId) {
    this.setState({
      showAddCollectionModal: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }
  showAddPageEndpointModal() {
    return (
      this.state.showAddCollectionModal && (
        <DefaultViewModal
          {...this.props}
          title='Add Parent Page'
          show={this.state.showAddCollectionModal}
          onCancel={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          onHide={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          selectedCollection={this.state.selectedCollection}
          pageType={1}
        />
      )
    )
  }

  renderBody(collectionId, collectionState) {
    const expanded = this.props.clientData?.[collectionId]?.isExpanded ?? isOnPublishedPage()
    var isOnDashboardPage = isDashboardRoute(this.props)

    return (
      <React.Fragment key={collectionId}>
        <div key={collectionId} id='parent-accordion' className={expanded ? 'sidebar-accordion expanded' : 'sidebar-accordion'}>
          <button tabIndex={-1} variant='default' className={`sidebar-hower ${expanded ? 'expanded' : ''}`}>
            <div className='inner-container' onClick={() => this.toggleSelectedColelctionIds(collectionId)}>
              <div className='d-flex justify-content-between'>
                <div className='w-100 d-flex'>
                  <span className='versionChovron'>
                  <MdExpandMore className='fs-4'/>
                  </span>
                  {collectionState === 'singleCollection' ? (
                    <div className='sidebar-accordion-item' onClick={() => this.openSelectedCollection(collectionId)}>
                      <div className='text-truncate'>{this.props.collections[collectionId].name}</div>
                    </div>
                  ) : (
                    <span className='truncate collect-length'> {this.props.collections[collectionId].name} </span>
                  )}
                </div>
              </div>
            </div>
            {
              //  [info] options not to show on publihsed page
              isOnDashboardPage && (
                <div className='d-flex align-items-center'>
                  <div className='sidebar-item-action  d-flex align-items-center'>
                    <div className='d-flex align-items-center' onClick={() => this.openAddPageEndpointModal(collectionId)}>
                      <IconButtons><FiPlus /></IconButtons>
                    </div>
                    <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <IconButtons><BsThreeDots /></IconButtons>
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      {!this.props.collections[collectionId]?.importedFromMarketPlace && (
                        <>
                          <div className='dropdown-item d-flex' onClick={() => this.openEditCollectionForm(collectionId)}>
                            <EditIcon /> Rename
                          </div>
                          {this.props.collections[collectionId].isPublic && (
                            <div className='dropdown-item d-flex' onClick={() => this.handleGoToDocs(this.props.collections[collectionId])}>
                              <GoToDocs /> Go to API Documentation
                            </div>
                          )}
                           <div
                            className='dropdown-item d-flex'
                            onClick={() => {
                              this.TagManagerModal(collectionId)
                            }}
                          >
                            <AddGoogleTag /> Add Google Tag Manager
                          </div>
                          <div
                            className='dropdown-item text-danger d-flex'
                            onClick={() => {
                              this.openDeleteCollectionModal(collectionId)
                            }}
                          >
                            <DeleteIcon /> Delete
                          </div>

                          {/* {!this.props.collections[collectionId].isPublic && ( */}
                            <div className='dropdown-item' onClick={() => this.handleOrgModalOpen(this.props.collections[collectionId])}>
                              <RiShareForward2Line size={16} color='grey' /> Move
                            </div>
                          {/* )} */}
                        </>
                      )}
                      {this.props.collections[collectionId]?.importedFromMarketPlace && (
                        <div
                          className='dropdown-item d-flex align-items-center justify-content-between'
                          onClick={() => {
                            this.removeImporedPublicCollection(collectionId)
                          }}
                        >
                          <div className='marketplace-icon mr-2'> M </div>
                          <div> Remove Public Collection </div>
                        </div>
                      )}
                      {/* <div
                    className="dropdown-item"
                    onClick={() => {
                      this.navigateToMembersModule(collectionId);
                    }}
                  >
                    <ShareBold/>
                    Share
                  </div> */}
                    </div>
                  </div>
                  <div className='theme-color d-flex transition counts ml-1 f-12'>
                    {this.props.collections[collectionId]?.importedFromMarketPlace ? (
                      <div className='marketplace-icon mr-1'> M </div>
                    ) : null}
                    <span className={this.props.collections[collectionId].isPublic ? 'published' : ''}>
                      {/* {this.findEndpointCount(collectionId) === 0 ? '' : this.findEndpointCount(collectionId)} */}
                    </span>
                  </div>
                  {/* <span className='ml-1 globe-img'>{this.props.collections[collectionId]?.isPublic && <img src={GlobeIcon} alt='globe' width='14' />}</span> */}
                </div>
              )
            }
          </button>
          {expanded ? (
            <div id='collection-collapse'>
              <Card.Body>
                {isOnDashboardPage && (
                  // <PublishCollectionInfo
                  //   {...this.props}
                  //   collectionId={collectionId}
                  //   getTotalEndpointsCount={this.props.getTotalEndpointsCount.bind(this)}
                  // />
                  <></>
                )}

                {
                  <CombinedCollections
                    {...this.props}
                    collection_id={collectionId}
                    selectedCollection
                    rootParentId={this.props.collections[collectionId].rootParentId}
                    // isPublishData={false}
                  />
                }
              </Card.Body>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    )
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

  showPublishDocsModal(onHide) {
    return <PublishDocsModal {...this.props} show onHide={onHide} collection_id={this.state.selectedCollection} />
  }

  addGTM(gtmId) {
    if (gtmId) {
      const tagManagerArgs = {
        gtmId: gtmId
      }
      TagManager.initialize(tagManagerArgs)
    }
  }

  renderEmptyCollections() {
    return (
      <div className='empty-collections text-center mt-4'>
        <div>
          <img src={emptyCollections} alt='' />
        </div>
        <div className='content'>
          <h5>Your collection is Empty.</h5>
        </div>
      </div>
    )
  }

  showDeleteCollectionModal() {
    const title = this.state.showRemoveModal ? 'Remove Collection' : 'Delete Collection'
    const message = this.state.showRemoveModal
      ? 'Are you sure you wish to remove this public collection?'
      : 'Are you sure you wish to delete this collection? All your pages, versions and endpoints present in this collection will be deleted.'
    return (
      (this.state.showDeleteModal || this.state.showRemoveModal) &&
      collectionsService.showDeleteCollectionModal(
        { ...this.props },
        this.closeDeleteCollectionModal.bind(this),
        title,
        message,
        this.state.selectedCollection
      )
    )
  }

  comparison(a, b) {
    if (this.props.collections[a].name.toLowerCase() < this.props.collections[b].name.toLowerCase()) {
      return -1
    } else if (this.props.collections[a].name.toLowerCase() > this.props.collections[b].name.toLowerCase()) {
      return 1
    } else {
      return 0
    }
  }

  render() {
    if (isDashboardRoute(this.props, true)) {
      return (
        <div>
          {this.state.showPublishDocsModal &&
            this.showPublishDocsModal(() =>
              this.setState({
                showPublishDocsModal: false
              })
            )}
          <div className='App-Nav'>
            <div className='tabs'>
              {this.showAddPageEndpointModal()}
              {this.state.showCollectionForm &&
                collectionsService.showCollectionForm(
                  this.props,
                  this.closeCollectionForm.bind(this),
                  this.state.collectionFormName,
                  this.state.selectedCollection
                )}
              {this.showImportVersionForm()}
              {this.openTagManagerModal()}
              {this.showDeleteCollectionModal()}
              {this.state.showOrgModal && <MoveModal moveCollection={this.state.moveCollection} onHide={this.handleOrgModalClose} show={this.state.showOrgModal} />}
            </div>
          </div>
          {this.props.collectionsToRender.length > 0 ? (
            <div className='App-Side'>
              {this.props.collectionsToRender.map((collectionId, index) => this.renderBody(collectionId, 'allCollections'))}
            </div>
          ) : this.props.filter === '' ? (
            this.renderEmptyCollections()
          ) : (
            <div className='px-2'>No Collections Found!</div>
          )}
        </div>
      )
    } else {
      return (
        <>
          <div className='App-Side'>
            {this.props.collectionsToRender.map((collectionId, index) => this.renderBody(collectionId, 'allCollections'))}
          </div>
        </>
      )
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CollectionsComponent))
