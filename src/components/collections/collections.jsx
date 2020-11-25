import React, { Component } from 'react'
import { Accordion, Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import shortId from 'shortid'
import CollectionVersions from '../collectionVersions/collectionVersions'
import collectionVersionsService from '../collectionVersions/collectionVersionsService'
import ImportVersionForm from '../collectionVersions/importVersionForm'
import { isDashboardRoute } from '../common/utility'
import endpointApiService from '../endpoints/endpointApiService'
import collectionsService from './collectionsService'
import {
  addCollection,
  deleteCollection,
  duplicateCollection,
  updateCollection,
  addCustomDomain
} from './redux/collectionsActions'
import './collections.scss'
import PublishDocsModal from '../publicEndpoint/publishDocsModal'
import { isAdmin } from '../auth/authService'
import TagManager from 'react-gtm-module'
import TagManagerModal from './tagModal'
import UserNotification from './userNotification'

const mapStateToProps = state => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = dispatch => {
  return {
    add_collection: newCollection => dispatch(addCollection(newCollection)),
    update_collection: editedCollection =>
      dispatch(updateCollection(editedCollection)),
    delete_collection: (collection, props) =>
      dispatch(deleteCollection(collection, props)),
    duplicate_collection: collection =>
      dispatch(duplicateCollection(collection)),
    add_custom_domain: (collectionId, domain) =>
      dispatch(addCustomDomain(collectionId, domain))
  }
}

class CollectionsComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showCollectionForm: false,
      collectionFormName: '',
      selectedCollection: {},
      showPublishDocsModal: false
    }

    this.keywords = {}
    this.names = {}
  }

  closeCollectionForm () {
    this.setState({ showCollectionForm: false, showImportVersionForm: false })
  }

  async dndMoveEndpoint (endpointId, sourceGroupId, destinationGroupId) {
    const groups = { ...this.state.groups }
    const endpoints = { ...this.state.endpoints }
    const originalEndpoints = { ...this.state.endpoints }
    const originalGroups = { ...this.state.groups }
    const endpoint = endpoints[endpointId]
    endpoint.groupId = destinationGroupId
    endpoints[endpointId] = endpoint
    groups[sourceGroupId].endpointsOrder = groups[
      sourceGroupId
    ].endpointsOrder.filter(gId => gId !== endpointId.toString())
    groups[destinationGroupId].endpointsOrder.push(endpointId)
    this.setState({ endpoints, groups })
    try {
      delete endpoint.id
      await endpointApiService.updateEndpoint(endpointId, endpoint)
    } catch (error) {
      this.setState({ endpoints: originalEndpoints, groups: originalGroups })
    }
  }

  async handleAddCollection (newCollection) {
    newCollection.requestId = shortId.generate()
    this.props.add_collection(newCollection)
  }

  async handleUpdateCollection (editedCollection) {
    this.props.update_collection(editedCollection)
  }

  async handleDeleteGroup (deletedGroupId) {
    this.props.delete_group(deletedGroupId)
  }

  async handleAddVersionPage (versionId, newPage) {
    newPage.requestId = shortId.generate()
    this.props.add_page(versionId, newPage)
  }

  async handleDuplicateCollection (collectionCopy) {
    this.props.duplicate_collection(collectionCopy)
  }

  async handleGoToDocs (collection) {
    const publicDocsUrl = `${process.env.REACT_APP_UI_URL}/p/${collection.id}`
    window.open(publicDocsUrl, '_blank')
  }

  openAddCollectionForm () {
    this.setState({
      showCollectionForm: true,
      collectionFormName: 'Add new Collection'
    })
  }

  openEditCollectionForm (collectionId) {
    this.setState({
      showCollectionForm: true,
      collectionFormName: 'Edit Collection',
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  openAddVersionForm (collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  openImportVersionForm (collectionId) {
    this.setState({
      showImportVersionForm: true,
      collectionFormName: 'Import Version',
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    })
  }

  openDeleteCollectionModal (collectionId) {
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

  showImportVersionForm () {
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

  handlePublicCollectionDescription (collection) {
    this.props.history.push({
      pathname: `/p/${collection.id}/description/${collection.name}`,
      collection
    })
  }

  closeVersionForm () {
    this.setState({ showVersionForm: false })
  }

  handlePublic (collection) {
    collection.isPublic = !collection.isPublic
    this.props.update_collection({ ...collection })
  }

  closeDeleteCollectionModal () {
    this.setState({ showDeleteModal: false })
  }

  openSelectedCollection (collectionId) {
    this.props.empty_filter()
    this.props.collection_selected(collectionId)
    this.collectionId = collectionId
    this.setState({ openSelectedCollection: true })
  }

  openAllCollections () {
    this.props.empty_filter()
    this.collectionId = null
    this.setState({ openSelectedCollection: false })
  }

  TagManagerModal (collectionId) {
    this.setState({ TagManagerCollectionId: collectionId })
  }

  openTagManagerModal () {
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

  dataFetched () {
    return (
      this.props.collections &&
      this.props.versions &&
      this.props.groups &&
      this.props.endpoints &&
      this.props.pages
    )
  }

  findEndpointCount (collectionId) {
    if (this.dataFetched()) {
      const versionIds = Object.keys(this.props.versions).filter(
        vId => this.props.versions[vId].collectionId === collectionId
      )
      const groupIds = Object.keys(this.props.groups)
      const groupsArray = []
      for (let i = 0; i < groupIds.length; i++) {
        const groupId = groupIds[i]
        const group = this.props.groups[groupId]

        if (versionIds.includes(group.versionId)) {
          groupsArray.push(groupId)
        }
      }

      const endpointIds = Object.keys(this.props.endpoints)
      const endpointsArray = []

      for (let i = 0; i < endpointIds.length; i++) {
        const endpointId = endpointIds[i]
        const endpoint = this.props.endpoints[endpointId]

        if (groupsArray.includes(endpoint.groupId)) {
          endpointsArray.push(endpointId)
        }
      }
      return endpointsArray.length
    }
  }

  // findEndpointCount(collectionId){
  //   if(this.dataFetched()){
  //     return Object.keys(this.props.endpoints).filter(eId => this.props.endpoints[eId].collectionId === collectionId).length
  //     }
  //   }

  renderBody (collectionId, collectionState) {
    let eventkeyValue = ''
    if (this.props.filter !== '') {
      eventkeyValue = '0'
    } else {
      eventkeyValue = null
    }

    if (document.getElementById('collection-collapse')) {
      if (
        document
          .getElementById('collection-collapse')
          .className.split(' ')[1] !== 'show' &&
        this.props.filter
      ) {
        document.getElementById('collection-collapse').className =
          'collapse show'
      }
    }

    return (
      <React.Fragment key={collectionId}>
        {
          collectionState === 'singleCollection'
            ? (
              <button
                id='back-to-all-collections-button'
                className='btn'
                onClick={() => this.openAllCollections()}
              >
                <i className='fas fa-arrow-left' />
                <label>All Collections</label>
              </button>
              )
            : null
        }

        <Accordion
          defaultActiveKey='0'
          key={collectionId}
          id='parent-accordion'
          className='sidebar-accordion'
        >
          {/* <Card> */}
          {/* <Card.Header> */}
          <Accordion.Toggle
            variant='default'
            eventKey={eventkeyValue !== null ? eventkeyValue : '0'}
          >
            {
              collectionState === 'singleCollection'
                ? (
                  <div>
                    <div>
                      {this.props.collections[collectionId].name}
                    </div>
                  </div>
                  )
                : (
                  <div
                    className='sidebar-accordion-item'
                    onClick={() => this.openSelectedCollection(collectionId)}
                  >
                    <i className='uil uil-parcel' />
                    <div>
                      {this.props.collections[collectionId].name}
                    </div>
                  </div>
                  )
            }
            <div class='show-endpoint-count'>
              {this.findEndpointCount(collectionId)}
            </div>
            <div className='sidebar-item-action'>
              <div
                className='sidebar-item-action-btn '
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                <i className='uil uil-ellipsis-v' />
              </div>
              <div className='dropdown-menu dropdown-menu-right'>
                <a
                  className='dropdown-item'
                  onClick={() => this.openEditCollectionForm(collectionId)}
                >
                  Edit
                </a>
                <a
                  className='dropdown-item'
                  onClick={() => {
                    this.openDeleteCollectionModal(collectionId)
                  }}
                >
                  Delete
                </a>
                <a
                  className='dropdown-item'
                  onClick={() => this.openAddVersionForm(collectionId)}
                >
                  Add Version
                </a>
                <a
                  className='dropdown-item'
                  onClick={() =>
                    this.handleDuplicateCollection(
                      this.props.collections[collectionId]
                    )}
                >
                  Duplicate
                </a>
                <a
                  className='dropdown-item'
                  onClick={() => this.openImportVersionForm(collectionId)}
                >
                  Import Version
                </a>
                {this.props.collections[collectionId].isPublic && (
                  <a
                    className='dropdown-item'
                    onClick={() =>
                      this.handleGoToDocs(this.props.collections[collectionId])}
                  >
                    Go to Docs
                  </a>
                )}
                {
                  isAdmin()
                    ? (
                      <a
                        className='dropdown-item'
                        onClick={() => {
                          this.props.collection_selected(null)
                          this.openPublishDocs(this.props.collections[collectionId])
                        }}
                      >
                        Publish Docs
                      </a>
                      )
                    : null
                }

                <a
                  className='dropdown-item'
                  onClick={() => {
                    this.TagManagerModal(collectionId)
                  }}
                >
                  Add Google Tag Manager
                </a>
              </div>
            </div>
          </Accordion.Toggle>
          {/* </Card.Header> */}
          {collectionState === 'singleCollection'
            ? (
              <Accordion.Collapse id='collection-collapse' eventKey='0'>
                <Card.Body>
                  <CollectionVersions
                    {...this.props}
                    collection_id={collectionId}
                    selectedCollection
                  />
                </Card.Body>
              </Accordion.Collapse>
              )
            : null}
          {/* </Card> */}
        </Accordion>
      </React.Fragment>
    )
  }

  openPublishDocs (collection) {
    if (collection.id) {
      this.props.history.push({
        pathname: '/admin/publish',
        search: `?collectionId=${collection.id}`
      })
    } else {
      const collection = this.props.collections[
        Object.keys(this.props.collections)[0]
      ]
      this.props.history.push({
        pathname: '/admin/publish',
        search: `?collectionId=${collection.id}`
      })
    }
    // this.setState({
    //   showPublishDocsModal: true,
    //   selectedCollection: collection.id,
    // });
  }

  showPublishDocsModal (onHide) {
    return (
      <PublishDocsModal
        {...this.props}
        show
        onHide={onHide}
        collection_id={this.state.selectedCollection}
      // add_new_endpoint={this.handleAddEndpoint.bind(this)}
      // open_collection_form={this.openCollectionForm.bind(this)}
      // open_environment_form={this.openEnvironmentForm.bind(this)}
      />
    )
  }

  addGTM (gtmId) {
    if (gtmId) {
      const tagManagerArgs = {
        gtmId: gtmId
      }
      TagManager.initialize(tagManagerArgs)
    }
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

  getPublicCollections () {
    if (this.dataFetched()) {
      const pendingEndpointIds = Object.keys(this.props.endpoints).filter(
        eId => this.props.endpoints[eId].state === 'Pending'
      )
      const pendingPageIds = Object.keys(this.props.pages).filter(
        pId => this.props.pages[pId].state === 'Pending'
      )

      const endpointCollections = this.findPendingEndpointsCollections(
        pendingEndpointIds
      )
      const pageCollections = this.findPendingPagesCollections(pendingPageIds)

      const allCollections = [
        ...new Set([...endpointCollections, ...pageCollections])
      ]
      const finalCollections = []
      for (let i = 0; i < allCollections.length; i++) {
        const collectionId = allCollections[i]
        if (this.props.collections[collectionId]?.isPublic) {
          finalCollections.push(collectionId)
        }
      }
      return finalCollections
    }
  }

  getNotificationCount () {
    const collections = this.getPublicCollections()

    return collections.length || 0
  }

  render () {
    if (isDashboardRoute(this.props, true)) {
      let finalCollections = []
      this.names = {}
      let finalnames = []
      this.keywords = {}
      let finalKeywords = []
      const collections = { ...this.props.collections }
      const CollectionIds = Object.keys(collections)

      for (let i = 0; i < CollectionIds.length; i++) {
        const { keyword } = this.props.collections[CollectionIds[i]]
        const splitedKeywords = keyword.split(',')

        for (let j = 0; j < splitedKeywords.length; j++) {
          const keyword = splitedKeywords[j]

          if (keyword !== '') {
            if (this.keywords[keyword]) {
              const ids = this.keywords[keyword]
              if (ids.indexOf(CollectionIds[i]) === -1) {
                this.keywords[keyword] = [...ids, CollectionIds[i]]
              }
            } else {
              this.keywords[keyword] = [CollectionIds[i]]
            }
          }
        }
      }
      const keywords = Object.keys(this.keywords)
      finalKeywords = keywords.filter(key => {
        console.log(this.props.filter)
        return key.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
      })

      let keywordFinalCollections = []
      for (let i = 0; i < finalKeywords.length; i++) {
        keywordFinalCollections = [
          ...keywordFinalCollections,
          ...this.keywords[finalKeywords[i]]
        ]
      }
      keywordFinalCollections = [...new Set(keywordFinalCollections)]

      for (let i = 0; i < CollectionIds.length; i++) {
        const { name } = this.props.collections[CollectionIds[i]]
        this.names[name] = CollectionIds[i]
      }
      const names = Object.keys(this.names)
      finalnames = names.filter(name => {
        return (
          name.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        )
      })
      let namesFinalCollections = finalnames.map(name => this.names[name])
      namesFinalCollections = [...new Set(namesFinalCollections)]
      finalCollections = [...keywordFinalCollections, ...namesFinalCollections]

      finalCollections = [...new Set(finalCollections)]
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
              {this.state.showVersionForm &&
                collectionVersionsService.showVersionForm(
                  this.props,
                  this.closeVersionForm.bind(this),
                  this.state.selectedCollection.id,
                  'Add new Collection Version'
                )}
              {this.state.showCollectionForm &&
                collectionsService.showCollectionForm(
                  this.props,
                  this.closeCollectionForm.bind(this),
                  this.state.collectionFormName,
                  this.state.selectedCollection
                )}
              {this.showImportVersionForm()}
              {this.openTagManagerModal()}
              {this.state.showDeleteModal &&
                collectionsService.showDeleteCollectionModal(
                  { ...this.props },
                  this.closeDeleteCollectionModal.bind(this),
                  'Delete Collection',
                  `Are you sure you wish to delete this collection? All your versions,
                   groups, pages and endpoints present in this collection will be deleted.`,
                  this.state.selectedCollection
                )}
            </div>
          </div>

          <div className='App-Side'>
            <div className='add-collection-btn-wrap'>
              <button
                className='add-collection-btn'
                onClick={() => this.openAddCollectionForm()}
              >
                <i className='uil uil-plus' />
                New Collection
              </button>
            </div>
            {/* {this.state.openSelectedCollection &&
              this.renderBody(this.collectionId, "singleCollection")} */}
            {/* {!this.state.openSelectedCollection &&
              finalCollections.map((collectionId, index) =>
                this.renderBody(collectionId, "allCollections")
              )} */}
            {finalCollections.map((collectionId, index) =>
              this.renderBody(collectionId, 'allCollections')
            )}

            <div className='fixed'>
              <UserNotification
                {...this.props}
                get_notification_count={this.getNotificationCount.bind(this)}
                get_public_collections={this.getPublicCollections.bind(this)}
                open_publish_docs={this.openPublishDocs.bind(this)}
              />
              {/* Notifications
            <div>count : {this.getNotificationCount()}</div> */}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <>
          {Object.keys(this.props.collections).map((collectionId, index) => (
            <div key={collectionId}>
              {this.addGTM(this.props.collections[collectionId].gtmId)}
              <div
                className='hm-sidebar-header'
                onClick={() =>
                  this.handlePublicCollectionDescription(
                    this.props.collections[collectionId]
                  )}
              >
                <div className='hm-sidebar-logo'>
                  <img
                    src={`//logo.clearbit.com/${this.props.collections[collectionId].name}.com`}
                    onClick={() =>
                      window.open(this.props.collections[collectionId].website)}
                  />
                </div>
                <h4 className='hm-sidebar-title'>
                  {this.props.collections[collectionId].name}
                </h4>
              </div>
              <div id='parent-accordion' key={index}>
                <CollectionVersions
                  {...this.props}
                  collection_id={collectionId}
                />
              </div>
            </div>
          ))}
        </>
      )
    }
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionsComponent)
)
