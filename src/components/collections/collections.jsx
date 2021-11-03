import React, { Component } from 'react'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import shortId from 'shortid'
import CollectionVersions from '../collectionVersions/collectionVersions'
import collectionVersionsService from '../collectionVersions/collectionVersionsService'
import ImportVersionForm from '../collectionVersions/importVersionForm'
import { isDashboardRoute, ADD_VERSION_MODAL_NAME, openExternalLink, getParentIds } from '../common/utility'
import collectionsService from './collectionsService'
import {
  addCollection,
  deleteCollection,
  duplicateCollection,
  updateCollection,
  addCustomDomain,
  removePublicCollection
} from './redux/collectionsActions'
import './collections.scss'
import PublishDocsModal from '../publicEndpoint/publishDocsModal'
import { isAdmin } from '../auth/authService'
import TagManager from 'react-gtm-module'
import TagManagerModal from './tagModal'
import emptyCollections from '../../assets/icons/emptyCollections.svg'
import hitmanLogo from '../../assets/icons/hitman.svg'
import PublishColelctionInfo from '../main/publishCollectionInfo'
import sidebarActions from '../main/sidebar/redux/sidebarActions'

const EMPTY_STRING = ''

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection) => dispatch(addCollection(newCollection)),
    update_collection: (editedCollection) =>
      dispatch(updateCollection(editedCollection)),
    delete_collection: (collection, props) =>
      dispatch(deleteCollection(collection, props)),
    duplicate_collection: (collection) =>
      dispatch(duplicateCollection(collection)),
    add_custom_domain: (collectionId, domain) =>
      dispatch(addCustomDomain(collectionId, domain)),
    remove_public_collection: (collection, props) =>
      dispatch(removePublicCollection(collection, props))
  }
}

class CollectionsComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showCollectionForm: false,
      collectionFormName: '',
      selectedCollection: {},
      showPublishDocsModal: false,
      defaultPublicLogo: hitmanLogo,
      publicLogoError: false,
      showRemoveModal: false,
      selectedCollectionIds: []
    }

    this.keywords = {}
    this.names = {}
    this.scrollRef = {}
  }

  closeCollectionForm () {
    this.setState({ showCollectionForm: false, showImportVersionForm: false })
  }

  componentDidMount () {
    const { pageId, endpointId } = this.props.match.params

    if (pageId) {
      this.setColelctionForEntity(pageId, 'page')
    }

    if (endpointId) {
      this.setColelctionForEntity(endpointId, 'endpoint')
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { pageId, endpointId } = this.props.match.params
    const { pageId: prevPageId, endpointId: prevEndpointId } = prevProps.match.params

    if (pageId && prevPageId !== pageId) {
      this.setColelctionForEntity(pageId, 'page')
    }

    if (endpointId && prevEndpointId !== endpointId) {
      this.setColelctionForEntity(endpointId, 'endpoint')
    }
  }

  setColelctionForEntity (id, type) {
    const { collectionId } = getParentIds(id, type, this.props)
    this.setSelectedCollectionId(collectionId, true)
  }

  setSelectedCollectionId (id, value) {
    if (id && this.state.selectedCollectionIds[id] !== value) {
      this.setState({ selectedCollectionIds: { ...this.state.selectedCollectionIds, [id]: value } })
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
    const publicDocsUrl = `${process.env.REACT_APP_PUBLIC_UI_URL}/p/${collection.id}`
    openExternalLink(publicDocsUrl)
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
    this.setState({ showRemoveModal: false, showDeleteModal: false })
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
        (vId) => this.props.versions[vId].collectionId === collectionId
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

  removeImporedPublicCollection (collectionId) {
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

  toggleSelectedColelctionIds (id) {
    sidebarActions.toggleItem('collections', id)
  }

  scrollToCollection (collectionId) {
    const ref = this.scrollRef[collectionId] || null
    if (ref) {
      setTimeout(() => {
        ref.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }, 100)
    }
  }

  renderBody (collectionId, collectionState) {
    const { expanded, focused, firstChild } = this.props.sidebar.navList[`collections_${collectionId}`]
    const { focused: sidebarFocused } = this.props.sidebar

    if (focused && this.scrollRef[collectionId]) {
      this.scrollToCollection(collectionId)
    }
    const versionsToRender = []
    if (firstChild) {
      let childVersion = this.props.sidebar.navList[firstChild]
      while (childVersion) {
        versionsToRender.push(childVersion.id)
        childVersion = this.props.sidebar.navList[childVersion.nextSibling]
      }
    }

    return (
      <React.Fragment key={collectionId}>

        <div
          key={collectionId}
          id='parent-accordion'
          className={expanded ? 'sidebar-accordion expanded' : 'sidebar-accordion'}
        >
          <button
            tabIndex={-1}
            ref={(newRef) => { this.scrollRef[collectionId] = newRef }}
            variant='default'
            className={[focused && sidebarFocused ? 'focused' : ''].join(' ')}
          >
            <div className='row w-100 align-items-center' onClick={() => this.toggleSelectedColelctionIds(collectionId)}>
              <div className='col-9 fixwidth'>
                {collectionState === 'singleCollection'
                  ? (
                    <div
                      className='sidebar-accordion-item'
                      onClick={() => this.openSelectedCollection(collectionId)}
                    >
                      <div className='text-truncate'>{this.props.collections[collectionId].name}</div>
                    </div>
                    )
                  : (
                    <div>
                      <div>{this.props.collections[collectionId].name}</div>
                    </div>
                    )}
              </div>
              <div class='show-endpoint-count col-3 pr-0 align-items-center d-flex justify-content-between'>
                <div>{this.props.collections[collectionId]?.importedFromMarketPlace
                  ? <div className='marketplace-icon ml-3'> M </div>
                  : <span>&nbsp;</span>}
                </div>
                {this.findEndpointCount(collectionId)}
              </div>
            </div>
            <div className='sidebar-item-action'>
              <div
                className='sidebar-item-action-btn'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                <i className='uil uil-ellipsis-v' />
              </div>
              <div className='dropdown-menu dropdown-menu-right'>
                {!this.props.collections[collectionId]?.importedFromMarketPlace &&
                  <>
                    <div
                      className='dropdown-item'
                      onClick={() => this.openEditCollectionForm(collectionId)}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M12.75 2.25023C12.947 2.05324 13.1808 1.89699 13.4382 1.79038C13.6956 1.68378 13.9714 1.62891 14.25 1.62891C14.5286 1.62891 14.8044 1.68378 15.0618 1.79038C15.3192 1.89699 15.553 2.05324 15.75 2.25023C15.947 2.44721 16.1032 2.68106 16.2098 2.93843C16.3165 3.1958 16.3713 3.47165 16.3713 3.75023C16.3713 4.0288 16.3165 4.30465 16.2098 4.56202C16.1032 4.81939 15.947 5.05324 15.75 5.25023L5.625 15.3752L1.5 16.5002L2.625 12.3752L12.75 2.25023Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg> Edit
                    </div>
                    <div
                      className='dropdown-item'
                      onClick={() => {
                        this.openDeleteCollectionModal(collectionId)
                      }}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M7.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M10.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg> Delete
                    </div>
                    <div
                      className='dropdown-item'
                      onClick={() => this.openAddVersionForm(collectionId)}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M2 2L2 16' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M9 2L9 8' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M12 5L6 5' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M2 15.25C1.58579 15.25 1.25 15.5858 1.25 16C1.25 16.4142 1.58579 16.75 2 16.75V15.25ZM16 16.75C16.4142 16.75 16.75 16.4142 16.75 16C16.75 15.5858 16.4142 15.25 16 15.25V16.75ZM2 16.75H16V15.25H2V16.75Z' fill='#E98A36' />
                        <path d='M2 10.25C1.58579 10.25 1.25 10.5858 1.25 11C1.25 11.4142 1.58579 11.75 2 11.75V10.25ZM16 11.75C16.4142 11.75 16.75 11.4142 16.75 11C16.75 10.5858 16.4142 10.25 16 10.25V11.75ZM2 11.75H16V10.25H2V11.75Z' fill='#E98A36' />
                      </svg> Add Version
                    </div>
                    <div
                      className='dropdown-item'
                      onClick={() =>
                        this.handleDuplicateCollection(
                          this.props.collections[collectionId]
                        )}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg> Duplicate
                    </div>
                    <div
                      className='dropdown-item'
                      onClick={() => this.openImportVersionForm(collectionId)}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M2 2L2 16' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M2 15.25C1.58579 15.25 1.25 15.5858 1.25 16C1.25 16.4142 1.58579 16.75 2 16.75V15.25ZM16 16.75C16.4142 16.75 16.75 16.4142 16.75 16C16.75 15.5858 16.4142 15.25 16 15.25V16.75ZM2 16.75H16V15.25H2V16.75Z' fill='#E98A36' />
                        <path d='M2 10.25C1.58579 10.25 1.25 10.5858 1.25 11C1.25 11.4142 1.58579 11.75 2 11.75V10.25ZM16 11.75C16.4142 11.75 16.75 11.4142 16.75 11C16.75 10.5858 16.4142 10.25 16 10.25V11.75ZM2 11.75H16V10.25H2V11.75Z' fill='#E98A36' />
                        <path d='M6.5 5.5L9.25 8L12 5.5' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M9.25 7.25L9.25 2' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg> Import Version
                    </div>
                    {this.props.collections[collectionId].isPublic && (
                      <div
                        className='dropdown-item'
                        onClick={() =>
                          this.handleGoToDocs(this.props.collections[collectionId])}
                      >
                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path d='M10.5 1.5H4.5C4.10218 1.5 3.72064 1.65804 3.43934 1.93934C3.15804 2.22064 3 2.60218 3 3V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V6L10.5 1.5Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path d='M12 9.75H6' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path d='M12 12.75H6' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path d='M7.5 6.75H6.75H6' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        </svg> Go to Docs
                      </div>
                    )}
                    {
                  isAdmin()
                    ? (
                      <div
                        className='dropdown-item'
                        onClick={() => {
                          this.openPublishDocs(this.props.collections[collectionId])
                        }}
                      >
                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path d='M12 12.5L9.25 10L6.5 12.5' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path d='M9.25 11.75L9.25 17' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path fill-rule='evenodd' clip-rule='evenodd' d='M4.5 0.75C3.90326 0.75 3.33097 0.987053 2.90901 1.40901C2.48705 1.83097 2.25 2.40326 2.25 3V13.9393C2.25 14.5361 2.48705 15.1084 2.90901 15.5303C3.33097 15.9523 3.90326 16.1893 4.5 16.1893H6V14.6893H4.5C4.30109 14.6893 4.11032 14.6103 3.96967 14.4697C3.82902 14.329 3.75 14.1383 3.75 13.9393V3C3.75 2.80109 3.82902 2.61032 3.96967 2.46967C4.11032 2.32902 4.30109 2.25 4.5 2.25H9.43934L14.25 7.06066V13.9393C14.25 14.1383 14.171 14.329 14.0303 14.4697C13.8897 14.6103 13.6989 14.6893 13.5 14.6893H12V16.1893H13.5C14.0967 16.1893 14.669 15.9523 15.091 15.5303C15.5129 15.1084 15.75 14.5361 15.75 13.9393V6.75C15.75 6.55109 15.671 6.36032 15.5303 6.21967L10.2803 0.96967C10.1397 0.829018 9.94891 0.75 9.75 0.75H4.5Z' fill='#E98A36' />
                        </svg>  Publish Docs
                      </div>
                      )
                    : null
                }

                    <div
                      className='dropdown-item'
                      onClick={() => {
                        this.TagManagerModal(collectionId)
                      }}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M1.82189 8.02724L8.10274 1.74639C8.59828 1.25084 9.40172 1.25084 9.89726 1.74639L16.1781 8.02724C16.6737 8.52278 16.6737 9.32622 16.1781 9.82176L9.89726 16.1026C9.40172 16.5982 8.59828 16.5982 8.10274 16.1026L1.82189 9.82176C1.32634 9.32622 1.32634 8.52278 1.82189 8.02724Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <line x1='0.75' y1='-0.75' x2='7.32538' y2='-0.75' transform='matrix(-0.707107 0.707107 0.707107 0.707107 12.2629 3.70117)' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' />
                        <line x1='11.8551' y1='8.97961' x2='7.20558' y2='13.6291' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' />
                        <line x1='6.79772' y1='8.5957' x2='9.00001' y2='10.798' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' />
                        <line x1='9.24493' y1='6.14844' x2='11.8182' y2='8.7217' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' />
                      </svg>
                      Add Google Tag Manager
                    </div>
                  </>}
                {this.props.collections[collectionId]?.importedFromMarketPlace &&
                  <div
                    className='dropdown-item d-flex align-items-center justify-content-between'
                    onClick={() => {
                      this.removeImporedPublicCollection(collectionId)
                    }}
                  >
                    <div className='marketplace-icon mr-2'> M </div>
                    <div> Remove Public Collection </div>
                  </div>}
                <div
                  className='dropdown-item'
                  onClick={() => {
                    this.navigateToMembersModule(collectionId)
                  }}
                >
                  <svg fill='#E98A36' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='18px' height='18px'><path d='M 40 0 C 34.53125 0 30.066406 4.421875 30 9.875 L 15.90625 16.9375 C 14.25 15.71875 12.207031 15 10 15 C 4.488281 15 0 19.488281 0 25 C 0 30.511719 4.488281 35 10 35 C 12.207031 35 14.25 34.28125 15.90625 33.0625 L 30 40.125 C 30.066406 45.578125 34.53125 50 40 50 C 45.511719 50 50 45.511719 50 40 C 50 34.488281 45.511719 30 40 30 C 37.875 30 35.902344 30.675781 34.28125 31.8125 L 20.625 25 L 34.28125 18.1875 C 35.902344 19.324219 37.875 20 40 20 C 45.511719 20 50 15.511719 50 10 C 50 4.488281 45.511719 0 40 0 Z M 40 2 C 44.429688 2 48 5.570313 48 10 C 48 14.429688 44.429688 18 40 18 C 38.363281 18 36.859375 17.492188 35.59375 16.65625 C 35.46875 16.238281 35.089844 15.949219 34.65625 15.9375 C 34.652344 15.933594 34.628906 15.941406 34.625 15.9375 C 33.230469 14.675781 32.292969 12.910156 32.0625 10.9375 C 32.273438 10.585938 32.25 10.140625 32 9.8125 C 32.101563 5.472656 35.632813 2 40 2 Z M 30.21875 12 C 30.589844 13.808594 31.449219 15.4375 32.65625 16.75 L 19.8125 23.1875 C 19.472656 21.359375 18.65625 19.710938 17.46875 18.375 Z M 10 17 C 11.851563 17 13.554688 17.609375 14.90625 18.65625 C 14.917969 18.664063 14.925781 18.679688 14.9375 18.6875 C 14.945313 18.707031 14.957031 18.730469 14.96875 18.75 C 15.054688 18.855469 15.160156 18.9375 15.28125 19 C 15.285156 19.003906 15.308594 18.996094 15.3125 19 C 16.808594 20.328125 17.796875 22.222656 17.96875 24.34375 C 17.855469 24.617188 17.867188 24.925781 18 25.1875 C 17.980469 25.269531 17.96875 25.351563 17.96875 25.4375 C 17.847656 27.65625 16.839844 29.628906 15.28125 31 C 15.1875 31.058594 15.101563 31.132813 15.03125 31.21875 C 13.65625 32.332031 11.914063 33 10 33 C 5.570313 33 2 29.429688 2 25 C 2 20.570313 5.570313 17 10 17 Z M 19.8125 26.8125 L 32.65625 33.25 C 31.449219 34.5625 30.589844 36.191406 30.21875 38 L 17.46875 31.625 C 18.65625 30.289063 19.472656 28.640625 19.8125 26.8125 Z M 40 32 C 44.429688 32 48 35.570313 48 40 C 48 44.429688 44.429688 48 40 48 C 35.570313 48 32 44.429688 32 40 C 32 37.59375 33.046875 35.433594 34.71875 33.96875 C 34.742188 33.949219 34.761719 33.929688 34.78125 33.90625 C 34.785156 33.902344 34.808594 33.910156 34.8125 33.90625 C 34.972656 33.839844 35.113281 33.730469 35.21875 33.59375 C 36.554688 32.597656 38.199219 32 40 32 Z' /></svg>
                  Share
                </div>
              </div>
            </div>
          </button>
          {collectionState === 'singleCollection'
            ? (null)
            : expanded
              ? (
                <div id='collection-collapse'>
                  <Card.Body>
                    <PublishColelctionInfo
                      {...this.props}
                      collectionId={collectionId}
                      // getTotalEndpointsCount={this.props.getTotalEndpointsCount.bind(this)}
                    />
                    <CollectionVersions
                      {...this.props}
                      versionsToRender={versionsToRender}
                      collection_id={collectionId}
                      addVersion={this.openAddVersionForm.bind(this)}
                      selectedCollection
                    />
                  </Card.Body>
                </div>
                )
              : null}
        </div>
      </React.Fragment>
    )
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

  showPublishDocsModal (onHide) {
    return (
      <PublishDocsModal
        {...this.props}
        show
        onHide={onHide}
        collection_id={this.state.selectedCollection}
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

  renderEmptyCollections () {
    return (
      <div className='empty-collections'>
        <div>
          <img src={emptyCollections} alt='' />
        </div>
        <div className='content'>
          <h5>  Your collection is Empty.</h5>
        </div>
      </div>
    )
  }

  showDeleteCollectionModal () {
    const title = this.state.showRemoveModal ? 'Remove Collection' : 'Delete Collection'
    const message = this.state.showRemoveModal
      ? 'Are you sure you wish to remove this public collection?'
      : `Are you sure you wish to delete this collection? All your versions,
    groups, pages and endpoints present in this collection will be deleted.`
    return (
      (this.state.showDeleteModal || this.state.showRemoveModal) && collectionsService.showDeleteCollectionModal(
        { ...this.props },
        this.closeDeleteCollectionModal.bind(this),
        title,
        message,
        this.state.selectedCollection
      )
    )
  }

  comparison (a, b) {
    if (this.props.collections[a].name.toLowerCase() < this.props.collections[b].name.toLowerCase()) { return -1 } else if (this.props.collections[a].name.toLowerCase() > this.props.collections[b].name.toLowerCase()) { return 1 } else { return 0 }
  }

  navigateToMembersModule (collectionId) {
    const orgId = this.props.match.params.orgId
    if (orgId && collectionId) {
      const viaSocketUrl = `${process.env.REACT_APP_VIASOCKET_URL}/orgs/${orgId}/manage/users?product=hitman&productItem=${collectionId}&redirect_uri=${process.env.REACT_APP_UI_URL}`
      openExternalLink(viaSocketUrl)
    }
  }

  render () {
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
              {this.state.showVersionForm &&
                collectionVersionsService.showVersionForm(
                  this.props,
                  this.closeVersionForm.bind(this),
                  this.state.selectedCollection.id,
                  ADD_VERSION_MODAL_NAME
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
              {this.showDeleteCollectionModal()}
            </div>
          </div>
          {this.props.collectionsToRender.length > 0
            ? (
              <div className='App-Side'>
                {this.props.collectionsToRender.map((collectionId, index) =>
                  this.renderBody(collectionId, 'allCollections')
                )}
              </div>)
            : (this.props.filter === ''
                ? this.renderEmptyCollections()
                : <div className='px-2'>No Collections Found!</div>
              )}
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
                onClick={() => window.open(this.props.collections[collectionId].website)}
              >
                {!this.state.publicLogoError &&
                  <div className='hm-sidebar-logo'>
                    <img
                      id='publicLogo'
                      alt='public-logo'
                      src={
                        (this.props.collections[collectionId]?.favicon)
                          ? `data:image/png;base64,${this.props.collections[collectionId]?.favicon}`
                          : this.props.collections[collectionId]?.docProperties
                            ?.defaultLogoUrl || EMPTY_STRING
                      }
                      onError={() => {
                        this.setState({ publicLogoError: true })
                      }}
                      width='60' height='60'
                    />
                  </div>}
                {this.props.collections[collectionId]?.docProperties?.defaultTitle && (
                  <h4 className='hm-sidebar-title'>
                    {this.props.collections[collectionId].docProperties.defaultTitle}
                    <span>API Documenation</span>
                  </h4>
                )}
              </div>
              <div id='parent-accordion' key={index}>
                <CollectionVersions
                  {...this.props}
                  collection_id={collectionId}
                  addVersion={this.openAddVersionForm.bind(this)}
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
