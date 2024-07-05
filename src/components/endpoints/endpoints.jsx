import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage, hexToRgb } from '../common/utility'
import { draftEndpoint, pendingEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'
import { deleteEndpoint, duplicateEndpoint } from './redux/endpointsActions'
import AddEntity from '../main/addEntity/addEntity'
import { updataForIsPublished } from '../../store/clientData/clientDataActions'
import SubPageForm from "../subPages/subPageForm.jsx"
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { ReactComponent as Duplicate } from '../../assets/icons/duplicateSign.svg'
import { ReactComponent as RenamedItem } from '../../assets/icons/renameSign.svg'
import endpointService from './endpointService'
import { bodyTypesEnums } from '../common/bodyTypeEnums'
import IconButtons from '../common/iconButton'
import { BsThreeDots } from "react-icons/bs"
import { GrGraphQl } from 'react-icons/gr'
import { background } from '../backgroundColor.js'
import '../../../src/components/styles.scss'

const endpointsEnum = {
  PENDING_STATE: 0,
  REJECT_STATE: 3,
  APPROVED_STATE: 2,
  DRAFT_STATE: 1
}

const Endpoints = (props) => {

  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false)
  const [showEndpointForm, setShowEndpointForm] = useState({
    addPage: false,
    edit: false,
    share: false,
    delete: false,
  })
  const [selectedEndpoint, setSelectedEndpoint] = useState({})

  const endpoints = useSelector((state) => state.pages);
  const tabs = useSelector((state) => state.tabs);
  const clientData = useSelector((state) => state.clientData)

  const handleHover = (isHovered) => {
    setIsHovered(isHovered)
  };

  const handleDelete = async (endpoint) => {
    await dispatch(deleteEndpoint(endpoint))
    tabService.removeTab(tabs.activeTabId, { ...props })
  }

  const handleDuplicate = (endpoint) => {
    dispatch(duplicateEndpoint(endpoint))
  }

  const openEditEndpointForm = (selectedEndpoint) => {
    setShowEndpointForm((prevState) => ({ ...prevState, edit: true }))
    setSelectedEndpoint({ ...endpoints[selectedEndpoint] })
  }

  const openDeleteEndpointModal = (endpointId) => {
    setShowEndpointForm((prevState) => ({ ...prevState, delete: true }))
    setSelectedEndpoint({ ...endpoints[endpointId] })
  }

  const closeDeleteEndpointModal = () => {
    setShowEndpointForm((prevState) => ({ ...prevState, delete: false }))
  }

  const handlePublicEndpointState = async (endpoint) => {
    if (isStateDraft(endpoint.id) || isStateReject(endpoint.id)) {
      dispatch(pendingEndpoint(endpoint))
    }
  }

  const handleCancelRequest = async (endpoint) => {
    dispatch(draftEndpoint(endpoint))
  }

  const handleDisplay = (endpoint, groupId, collectionId, previewMode) => {
    window.scroll(0, 0)
    if (isDashboardRoute(props, true)) {
      if (!tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(tabs.tabs).filter((tabId) => tabs.tabs[tabId].previewMode === true)[0]
        if (previewTabId) dispatch(closeTab(previewTabId))
        dispatch(openInNewTab({
          id: endpoint.id,
          type: 'endpoint',
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false,
          state: {}
        }))
      } else if (tabs.tabs[endpoint.id].previewMode === true && previewMode === false) {
        tabService.disablePreviewMode(endpoint.id)
      }
      props.history.push({
        pathname: `/orgs/${props.match.params.orgId}/dashboard/endpoint/${endpoint.id}`,
        title: 'update endpoint',
        endpoint: endpoint,
        groupId: groupId,
        collectionId
      })
    } else {
      let id = endpoint?.id
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, props.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      props.history.push(pathName)
    }
  }

  const handleCheckboxChange = () => {
    dispatch(updataForIsPublished({
      id: props?.endpointId,
      isChecked: !clientData?.[props?.endpointId]?.checkedForPublished
    }))
  }

  const isStateDraft = (endpointId) => {
    return endpoints[endpointId].state === endpointsEnum.DRAFT_STATE
  }

  const isStateReject = (endpointId) => {
    return endpoints[endpointId].state === endpointsEnum.REJECT_STATE
  }

  function displayEndpointName(endpointId) {
    let isUserOnPublishedPage = isOnPublishedPage()
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : (isDashboardRoute && props.match.params.endpointId === endpointId ? 'selected' : '')
    return (
      <>
        {props.isPublishData && props.modals.publishData ? (
          <div className='sidebar-accordion-item'>
            <input
              type='checkbox'
              checked={clientData?.[props?.endpointId]?.checkedForPublished || false}
              onChange={handleCheckboxChange}
            />
            {props.endpointContent.protocolType === 1 && <div className={`api-label ${endpoints[endpointId].requestType} request-type-bgcolor`}>
              {endpoints[endpointId].requestType}
            </div>}
            <div className='end-point-name truncate'>{endpoints[endpointId].name}</div>
          </div>
        ) : (
          <div className={`sidebar-accordion-item ${isSelected ? 'Selected' : ''}`}>
            {endpoints[endpointId]?.protocolType === 1 && <div className={`api-label ${endpoints[endpointId].requestType} request-type-bgcolor`}>
              {endpoints[endpointId].requestType}
            </div>}
            {endpoints[endpointId]?.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
            <div className='end-point-name truncate'>{endpoints[endpointId].name}</div>
          </div>
        )}
      </>
    )
  }

  const displayDeleteOpt = (endpointId) => {
    return (
      <div className='dropdown-item text-danger d-flex' onClick={() => openDeleteEndpointModal(endpointId)}>
        <DeleteIcon /> Delete
      </div>
    )
  }

  function displaySingleEndpoint(endpointId) {

    let isUserOnPublishedPage = isOnPublishedPage()
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : (isDashboardRoute && props.match.params.endpointId === endpointId ? 'selected' : '')
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW);
    let collectionId = props?.pages?.[idToRender]?.collectionId ?? null
    var collectionTheme = props.collections[collectionId]?.theme
    const dynamicColor = hexToRgb(collectionTheme, 0.15);
    const staticColor = background['background_hover'];
    const backgroundStyle = {
      backgroundImage: isHovered || isSelected ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),linear-gradient(to right, ${staticColor}, ${staticColor})` : ''
    }

    return (
      <>
        <div
          key={endpointId}
          draggable={!isUserOnPublishedPage}
          onDragOver={props.handleOnDragOver}
          onDragStart={() => props.onDragStart(endpointId)}
          onDrop={(e) => props.onDrop(e, endpointId)}
          onDragEnter={(e) => props.onDragEnter(e, endpointId)}
          onDragEnd={(e) => props.onDragEnd(e)}
          style={props.draggingOverId === endpointId ? { borderTop: '3px solid red' } : null}
        >
          <div className={endpoints[endpointId]?.state} />
          <div className='sidebar-toggle d-flex justify-content-between mt-1'>
            <button>
              <div className={`side-bar d-flex align-items-center rounded mr-2 ${isSelected ? 'Selected' : ''}`} style={backgroundStyle}
                onMouseEnter={() => handleHover(true)}
                onMouseLeave={() => handleHover(false)}>
                <button
                  tabIndex={-1}
                  onClick={() => { handleDisplay(endpoints[endpointId], props.endpointId, props.collection_id, true) }}
                  onDoubleClick={() => handleDisplay(endpoints[endpointId], props.endpointId, props.collection_id, false)}
                >
                  {displayEndpointName(endpointId)}
                </button>
                <div className='d-flex align-items-center'>
                  {isDashboardRoute(props, true) && !props.collections[props.collection_id]?.importedFromMarketPlace && displayEndpointOptions(endpointId)}
                </div>
              </div>
            </button>
          </div>
        </div>
      </>
    )
  }

  const displayDuplicateOpt = (endpointId) => {
    return (
      <div className='dropdown-item d-flex' onClick={() => handleDuplicate(endpoints[endpointId])}>
        <Duplicate /> Duplicate
      </div>
    )
  }

  const displayEndpointOptions = (endpointId) => {
    return (
      <div className='sidebar-item-action'>
        <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
          <IconButtons><BsThreeDots /></IconButtons>
        </div>

        <div className='dropdown-menu dropdown-menu-right'>
          <div className='dropdown-item d-flex' onClick={() => openEditEndpointForm(endpointId)}>
            <RenamedItem /> Rename
          </div>
          {displayDuplicateOpt(endpointId)}
          {displayDeleteOpt(endpointId)}
          {/* {endpoints[endpointId]?.isPublished ? displayApproveOpt() : displayOtherOpt(endpointId)} */}
        </div>
      </div>
    )
  }
  const showEditEndpointModal = () => {
    return (
      showEndpointForm.edit && (
        <SubPageForm
          {...props}
          title='Rename'
          show={showEndpointForm.edit}
          onCancel={() => {
            setShowEndpointForm(false)
          }}
          onHide={() => {
            setShowEndpointForm(false)
          }}
          selectedEndpoint={props?.endpointId}
          pageType={4}
          isEndpoint={true}
          selectedPage={props?.endpointId}
        />
      )
    )
  }

  const addEndpoint = (endpoint) => {
    dispatch(addEndpoint(endpoint, props.parent_id, null))
  }

  const renderForm = () => {
    const endpoint = {
      uri: '',
      name: '',
      requestType: 'GET',
      body: { type: bodyTypesEnums['none'], value: null },
      headers: {},
      params: {},
      pathVariables: {},
      BASE_URL: null,
      bodyDescription: {},
    }
    return (
      <>
        {isDashboardRoute(props, true) && (
          <AddEntity placeholder='API Endpoint Name' type='endpoint' endpoint={endpoint} addEndpoint={addEndpoint.bind(this)} />
        )}
      </>
    )
  }

  const displayUserEndpoints = (endpointId) => {
    return (
      <>
        {displaySingleEndpoint(endpointId)}
        {endpointId?.length === 0 && renderForm()}
      </>
    )
  }

  return <>
    {showEditEndpointModal()}
    {showEndpointForm.delete &&
      endpointService.showDeleteEndpointModal(
        props,
        handleDelete,
        closeDeleteEndpointModal,
        'Delete Endpoint',
        `Are you sure you want to delete this endpoint?`,
        selectedEndpoint
      )}
    {displayUserEndpoints(props?.endpointId)}
  </>
}

export default Endpoints