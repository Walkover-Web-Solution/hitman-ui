import React, { Component } from 'react'
import { useState } from 'react'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import shortId from 'shortid'
import { isDashboardRoute, openExternalLink, isOnPublishedPage } from '../common/utility'
import collectionsService from './collectionsService'
import { addCollection, deleteCollection, duplicateCollection, updateCollection, addCustomDomain } from './redux/collectionsActions'
import './collections.scss'
import PublishDocsModal from '../publicEndpoint/publishDocsModal'
import TagManager from 'react-gtm-module'
import TagManagerModal from './tagModal'
import emptyCollections from '../../assets/icons/emptyCollections.svg'
import hitmanLogo from '../../assets/icons/hitman.svg'
import { addNewTab } from '../tabs/redux/tabsActions'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { addIsExpandedAction } from '../../store/clientData/clientDataActions'
import DefaultViewModal from './defaultViewModal/defaultViewModal1'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { ReactComponent as EditIcon } from '../../assets/icons/editsign.svg'
import { ReactComponent as GoToDocs } from '../../assets/icons/gotodocssign.svg'
import { ReactComponent as AddGoogleTag } from '../../assets/icons/addGoogleTagsign.svg'
import { RiShareForward2Line } from 'react-icons/ri'
import { MdExpandMore } from 'react-icons/md'
import MoveModal from '../common/moveModal/moveModal'
import IconButtons from '../common/iconButton'
import { FiPlus } from 'react-icons/fi'
import { BsThreeDots } from 'react-icons/bs'
import { LuFolder } from 'react-icons/lu'

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
    delete_collection: (collection) => dispatch(deleteCollection(collection)),
    duplicate_collection: (collection) => dispatch(duplicateCollection(collection)),
    add_custom_domain: (collectionId, domain) => dispatch(addCustomDomain(collectionId, domain)),
    add_new_tab: () => dispatch(addNewTab()),
    update_isExpand_for_collection: (payload) => dispatch(addIsExpandedAction(payload))
  }
}
const Collections = (props) => {
  const [showPublishDocsModal, setShowPublishDocsModal] = useState(false)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [collectionFormName, setCollectionFormName] = useState('')
  const [selectedCollection, setSelectedCollection] = useState({})
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [moveCollection, setMoveCollection] = useState(null)
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [TagManagerCollectionId, setTagManagerCollectionId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [expandedIds, setExpandedIds] = useState({})
  const [openSelectedCollection, setOpenSelectedCollection] = useState(false)

  const isOnDashboardPage = isDashboardRoute(props)

  const handleOrgModalClose = () => setShowOrgModal(false)
  const closeCollectionForm = () => setShowCollectionForm(false)

  const handleModalClose = () => {
    setShowAddCollectionModal(false)
  }

  const showAddPageEndpointModal = () => {
    return (
      showAddCollectionModal && (
        <DefaultViewModal
          {...props}
          title='Add Parent Page'
          show={showAddCollectionModal}
          onCancel={handleModalClose}
          onHide={handleModalClose}
          selectedCollection={selectedCollection}
          pageType={1}
        />
      )
    )
  }
  const handleModalHide = () => {
    setTagManagerCollectionId(false)
  }
  const openTagManagerModal = () => {
    return (
      TagManagerCollectionId && (
        <TagManagerModal {...props} show onHide={handleModalHide} title='Google Tag Manager' collection_id={TagManagerCollectionId} />
      )
    )
  }

  const closeDeleteCollectionModal = () => {
    setShowDeleteModal(false)
    setShowRemoveModal(false)
  }

  const showDeleteCollectionModal = () => {
    const title = showRemoveModal ? 'Remove Collection' : 'Delete Collection'
    const message = showRemoveModal
      ? 'Are you sure you wish to remove this public collection?'
      : 'Are you sure you wish to delete this collection? All your pages, versions and endpoints present in this collection will be deleted.'
    return (
      (showDeleteModal || showRemoveModal) &&
      collectionsService.showDeleteCollectionModal({ ...props }, closeDeleteCollectionModal, title, message, selectedCollection)
    )
  }

  const toggleExpanded = (e, id) => {
    e.stopPropagation()
    const isExpanded = props?.clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    props.update_isExpand_for_collection({
      value: !isExpanded,
      id
    })
  }

  const openPublishSettings = async (collectionId) => {
    if (collectionId) {
      props.history.push(`/orgs/${props.match.params.orgId}/dashboard/collection/${collectionId}/settings`)
    }
  }

  const OpenSelectedCollection = (collectionId) => {
    props.empty_filter()
    props.collection_selected(collectionId)
    collectionId = collectionId
    setOpenSelectedCollection(true)
  }

  const openAddPageEndpointModal = (collectionId) => {
    setShowAddCollectionModal(true)
    console.log(props.collections[collectionId])
    setSelectedCollection(props.collections[collectionId])
  }

  const openEditCollectionForm = (collectionId) => {
    setShowCollectionForm(true)
    setCollectionFormName('Edit Collection')
    setSelectedCollection({
      ...props.collections[collectionId]
    })
  }

  const handleGoToDocs = (collection) => {
    const publicDocsUrl = `${process.env.REACT_APP_PUBLIC_UI_URL}/p?collectionId=${collection.id}`
    openExternalLink(publicDocsUrl)
  }

  const TagManagerModal = (id) => {
    setTagManagerCollectionId(id)
  }

  const handleOrgModalOpen = async (collection) => {
    setShowOrgModal(true)
    setMoveCollection(collection)
  }

  const openDeleteCollectionModal = (collectionId) => {
    if (openSelectedCollection) {
      setOpenSelectedCollection(false)
    }
    setShowDeleteModal(true)
    setSelectedCollection({
      ...props.collections[collectionId]
    })
  }
  const removeImportedPublicCollection = (collectionId) => {
    if (openSelectedCollection) {
      setOpenSelectedCollection(false)
    }
    setShowRemoveModal(true)
    setSelectedCollection({
      ...props.collections[collectionId]
    })
  }

  const renderBody = (collectionId, collectionState) => {
    const expanded = props.clientData?.[collectionId]?.isExpanded ?? isOnPublishedPage()
    var isOnDashboardPage = isDashboardRoute(props)
    return (
      <React.Fragment key={collectionId}>
        <div key={collectionId} id='parent-accordion' className={expanded ? 'sidebar-accordion expanded' : 'sidebar-accordion'}>
          <button tabIndex={-1} variant='default' className={`sidebar-hower ${expanded ? 'expanded' : ''}`}>
            <div
              className='inner-container'
              onClick={(e) => {
                openPublishSettings(collectionId)
                if (!expanded) {
                  toggleExpanded(e, collectionId)
                }
              }}
            >
              <div className='d-flex justify-content-between'>
                <div className='w-100 d-flex'>
                  <span
                    className='versionChovron'
                    onClick={(e) => {
                      toggleExpanded(e, collectionId)
                    }}
                  >
                    <MdExpandMore size={13} className='collection-icons-arrow d-none' />
                    <LuFolder size={13} className='collection-icons d-inline ml-1' />
                  </span>
                  {collectionState === 'singleCollection' ? (
                    <div className='sidebar-accordion-item' onClick={() => OpenSelectedCollection(collectionId)}>
                      <div className='text-truncate'>{props.collections[collectionId].name}</div>
                    </div>
                  ) : (
                    <span className='truncate collect-length'> {props.collections[collectionId].name} </span>
                  )}
                </div>
              </div>
            </div>
            {isOnDashboardPage && (
              <div className='d-flex align-items-center'>
                <div className='sidebar-item-action  d-flex align-items-center'>
                  <div className='d-flex align-items-center' onClick={() => openAddPageEndpointModal(collectionId)}>
                    <IconButtons>
                      <FiPlus />
                    </IconButtons>
                  </div>
                  <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <IconButtons>
                      <BsThreeDots />
                    </IconButtons>
                  </div>
                  <div className='dropdown-menu dropdown-menu-right'>
                    {!props.collections[collectionId]?.importedFromMarketPlace && (
                      <>
                        <div className='dropdown-item d-flex' onClick={() => openEditCollectionForm(collectionId)}>
                          <EditIcon /> Rename
                        </div>
                        {props.collections[collectionId].isPublic && (
                          <div className='dropdown-item d-flex' onClick={() => handleGoToDocs(props.collections[collectionId])}>
                            <GoToDocs /> Go to API Documentation
                          </div>
                        )}
                        <div
                          className='dropdown-item d-flex'
                          onClick={() => {
                            TagManagerModal(collectionId)
                          }}
                        >
                          <AddGoogleTag /> Add Google Tag Manager
                        </div>
                        <div className='dropdown-item' onClick={() => handleOrgModalOpen(props.collections[collectionId])}>
                          <RiShareForward2Line size={16} color='grey' /> Move
                        </div>
                        <div
                          className='dropdown-item text-danger d-flex'
                          onClick={() => {
                            openDeleteCollectionModal(collectionId)
                          }}
                        >
                          <DeleteIcon /> Delete
                        </div>
                      </>
                    )}
                    {props.collections[collectionId]?.importedFromMarketPlace && (
                      <div
                        className='dropdown-item d-flex align-items-center justify-content-between'
                        onClick={() => {
                          removeImportedPublicCollection(collectionId)
                        }}
                      >
                        <div className='marketplace-icon mr-2'> M </div>
                        <div> Remove Public Collection </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className='theme-color d-flex transition counts ml-1 f-12'>
                  {props.collections[collectionId]?.importedFromMarketPlace ? <div className='marketplace-icon mr-1'> M </div> : null}
                  <span className={props.collections[collectionId].isPublic ? 'published' : ''}></span>
                </div>
              </div>
            )}
          </button>
          {expanded ? (
            <div id='collection-collapse'>
              <Card.Body>
                {
                  <CombinedCollections
                    {...props}
                    handleOnDragOver={props.handleOnDragOver}
                    onDragEnter={props.onDragEnter}
                    onDragEnd={props.onDragEnd}
                    onDragStart={props.onDragStart}
                    onDrop={props.onDrop}
                    draggingOverId={props.draggingOverId}
                    collection_id={collectionId}
                    selectedCollection
                    rootParentId={props.collections[collectionId].rootParentId}
                  />
                }
              </Card.Body>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    )
  }

  const renderEmptyCollections = () => {
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

  if (isDashboardRoute(props, true)) {
    return (
      <div>
        {showPublishDocsModal && showPublishDocsModal(() => setShowPublishDocsModal(false))}
        <div className='App-Nav'>
          <div className='tabs'>
            {showAddPageEndpointModal()}
            {showCollectionForm &&
              collectionsService.showCollectionForm(props, closeCollectionForm, collectionFormName, selectedCollection)}
            {openTagManagerModal()}
            {showDeleteCollectionModal()}
            {showOrgModal && <MoveModal moveCollection={moveCollection} onHide={handleOrgModalClose} show={showOrgModal} />}
          </div>
        </div>
        {props?.collectionsToRender?.length > 0 ? (
          <div className='App-Side'>
            {props.collectionsToRender.map((collectionId, index) => renderBody(collectionId, 'allCollections'))}
          </div>
        ) : props.filter === '' ? (
          renderEmptyCollections()
        ) : (
          <div className='px-2'>No Collections Found!</div>
        )}
      </div>
    )
  } else {
    return (
      <>
        <div className='App-Side'>{props.collectionsToRender.map((collectionId, index) => renderBody(collectionId, 'allCollections'))}</div>
      </>
    )
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Collections))
