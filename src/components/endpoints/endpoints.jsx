import React, { Component, useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage } from '../common/utility'
import { approveEndpoint, draftEndpoint, pendingEndpoint, rejectEndpoint } from '../publicEndpoint/redux/publicEndpointsActions'
import { closeTab, openInNewTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
import tabStatusTypes from '../tabs/tabStatusTypes'
import './endpoints.scss'
import { deleteEndpoint, duplicateEndpoint, addEndpoint } from './redux/endpointsActions'
// import GlobeIcon from '../../assets/icons/globe-icon.svg'
import AddEntity from '../main/addEntity/addEntity'
import { updataForIsPublished } from '../../store/clientData/clientDataActions'
import SubPageForm from "../subPages/subPageForm.jsx"
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { ReactComponent as Duplicate } from '../../assets/icons/duplicateSign.svg'
import { ReactComponent as Approved } from '../../assets/icons/approvedSign.svg'
import { ReactComponent as MakePublic } from '../../assets/icons/makePublicSign.svg'
import { ReactComponent as CancelRequest } from '../../assets/icons/cancelRequest.svg'
import { ReactComponent as RenamedItem } from '../../assets/icons/renameSign.svg'
import endpointService from './endpointService'
import { bodyTypesEnums } from '../common/bodyTypeEnums'
import IconButtons from '../common/iconButton'
import { BsThreeDots } from "react-icons/bs"
import { GrGraphQl } from 'react-icons/gr'
import '../../../src/components/styles.scss'
import { importPostmanEnvironment } from '../environments/environmentsApiService'

// 0 = pending  , 1 = draft , 2 = approved  , 3 = rejected
const endpointsEnum = {
  PENDING_STATE: 0,
  REJECT_STATE: 3,
  APPROVED_STATE: 2,
  DRAFT_STATE: 1
}

const mapStateToProps = (state) => {
  return {
    endpoints: state.pages,
    tabs: state.tabs,
    clientData: state.clientData
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    delete_endpoint: (endpoint) => dispatch(deleteEndpoint(endpoint)),
    duplicate_endpoint: (endpoint) => dispatch(duplicateEndpoint(endpoint)),
    pending_endpoint: (endpoint) => dispatch(pendingEndpoint(endpoint)),
    approve_endpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
    draft_endpoint: (endpoint) => dispatch(draftEndpoint(endpoint)),
    reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
    add_endpoint: (newEndpoint, groupId, callback) => dispatch(addEndpoint(ownProps.history, newEndpoint, groupId, callback)),
    setIsCheckForParenPage: (payload) => dispatch(updataForIsPublished(payload)),
    import_postman_environment: (openApiObject, importType, website, callback, view) =>
      dispatch(importPostmanEnvironment(openApiObject, importType, website, callback, view))
  }
}

const Endpoints = (props) => {

  const [state, setState] = useState({
    endpointState: 'Make Public',
    theme: '',
    checkboxChecked: false,
    showEndpointForm: {
      addPage: false,
      edit: false,
      share: false,
      delete: false,
    }
  });

  useEffect(() => {
    if (props.theme) {
      setState((prevState) => ({ ...prevState, theme: props.theme }));
    }
  }, [props.theme])

  const handleDelete = async (endpoint) => {
    await props.delete_endpoint(endpoint)
    tabService.removeTab(props.tabs.activeTabId, { ...props })
  }

  const handleDuplicate = (endpoint) => {
    props.duplicate_endpoint(endpoint)
  }

  const openEditEndpointForm = (selectedEndpoint) => {
    setState({
      showEndpointForm: { edit: true },
      selectedEndpoint: {
        ...props.endpoints[selectedEndpoint]
      }
    })
  }

  const openDeleteEndpointModal = (endpointId) => {
    setState({
      showEndpointForm: { delete: true },
      selectedEndpoint: { ...props.endpoints[endpointId] }
    })
  }

  const closeDeleteEndpointModal = () => {
    setState({ showEndpointForm: { delete: false } })
  }

  const handlePublicEndpointState = async (endpoint) => {
    if (isStateDraft(endpoint.id) || isStateReject(endpoint.id)) {
      props.pending_endpoint(endpoint)
    }
  }

  const handleCancelRequest = async (endpoint) => {
    props.draft_endpoint(endpoint)
  }

  const handleApproveRequest = async (endpoint) => {
    props.approve_endpoint(endpoint)
  }

  const handleRejectRequest = async (endpoint) => {
    props.reject_endpoint(endpoint)
  }

  const handleDisplay = (endpoint, groupId, collectionId, previewMode) => {
    window.scroll(0, 0)
    if (isDashboardRoute(props, true)) {
      if (!props.tabs.tabs[endpoint.id]) {
        const previewTabId = Object.keys(props.tabs.tabs).filter((tabId) => props.tabs.tabs[tabId].previewMode === true)[0]
        if (previewTabId) props.close_tab(previewTabId)
        props.open_in_new_tab({
          id: endpoint.id,
          type: 'endpoint',
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false,
          state: {}
        })
      } else if (props.tabs.tabs[endpoint.id].previewMode === true && previewMode === false) {
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

  const extractEndpoints = () => {
    const endpoints = {}
    for (let i = 0; i < Object.keys(props.endpoints).length; i++) {
      if (
        props.endpoints[Object.keys(props.endpoints)[i]].parentId &&
        props.endpoints[Object.keys(props.endpoints)[i]].parentId === props.parent_id
      ) {
        endpoints[Object.keys(props.endpoints)[i]] = props.endpoints[Object.keys(props.endpoints)[i]]
      }
    }

    return endpoints
  }

  const handleCheckboxChange = () => {
    props.setIsCheckForParenPage({
      id: props?.endpointId,
      isChecked: !props?.clientData?.[props?.endpointId]?.checkedForPublished
    })
  }

  const makePositionWiseEndpoints = (endpoints) => {
    const positionWiseEndpoints = []
    for (let i = 0; i < Object.keys(endpoints).length; i++) {
      positionWiseEndpoints[endpoints[Object.keys(endpoints)[i]].position] = Object.keys(endpoints)[i]
    }
    return positionWiseEndpoints
  }

  const isStateApproved = (endpointId) => {
    return props.endpoints[endpointId].state === endpointsEnum.APPROVED_STATE
  }

  const isStatePending = (endpointId) => {
    return props.endpoints[endpointId].state === endpointsEnum.PENDING_STATE
  }

  const isStateDraft = (endpointId) => {
    return props.endpoints[endpointId].state === endpointsEnum.DRAFT_STATE
  }

  const isStateReject = (endpointId) => {
    return props.endpoints[endpointId].state === endpointsEnum.REJECT_STATE
  }

  const displayEndpointName = (endpointId) => {
    let isUserOnPublishedPage = isOnPublishedPage()
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : (isDashboardRoute && props.match.params.endpointId === endpointId ? 'selected' : '')
    return (
      <>
        {props.isPublishData && props.modals.publishData ? (
          <div className='sidebar-accordion-item'>
            <input
              type='checkbox'
              checked={props?.clientData?.[props?.endpointId]?.checkedForPublished || false}
              onChange={handleCheckboxChange}
            />
            {props.endpointContent.protocolType === 1 && <div className={`api-label ${props.endpoints[endpointId].requestType} request-type-bgcolor`}>
              {props.endpoints[endpointId].requestType}
            </div>}
            <div className='end-point-name truncate'>{props.endpoints[endpointId].name}</div>
          </div>
        ) : (
          <div className={`sidebar-accordion-item ${isSelected ? 'Selected' : ''}`}>
            {props?.endpoints[endpointId]?.protocolType === 1 && <div className={`api-label ${props.endpoints[endpointId].requestType} request-type-bgcolor`}>
              {props.endpoints[endpointId].requestType}
            </div>}
            {props?.endpoints[endpointId]?.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
            <div className='end-point-name truncate'>{props.endpoints[endpointId].name}</div>
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

  const displayDuplicateOpt = (endpointId) => {
    return (
      <div className='dropdown-item d-flex' onClick={() => handleDuplicate(props.endpoints[endpointId])}>
        <Duplicate /> Duplicate
      </div>
    )
  }

  const displayApproveOpt = () => {
    return (
      <div className='dropdown-item' disabled>
        <Approved />
        Approved
      </div>
    )
  }

  const displayMakePublicOpt = (endpointId) => {
    return (
      <div id='make_public_btn' className='dropdown-item' onClick={() => handlePublicEndpointState(props.endpoints[endpointId])}>
        <MakePublic />
        Make Public
      </div>
    )
  }

  const displayCancelRequestOpt = (endpointId) => {
    return (
      <div className='dropdown-item' onClick={() => handleCancelRequest(props.endpoints[endpointId])}>
        <CancelRequest /> Cancel Request
      </div>
    )
  }

  const displayOtherOpt = (endpointId) => {
    return (
      <>
        {isStateDraft(endpointId) || isStateReject(endpointId) ? displayMakePublicOpt(endpointId) : null}

        {isStateApproved(endpointId) ? displayApproveOpt() : null}

        {isStatePending(endpointId) ? displayCancelRequestOpt(endpointId) : null}
      </>
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
          {/* {props.endpoints[endpointId]?.isPublished ? displayApproveOpt() : displayOtherOpt(endpointId)} */}
        </div>
      </div>
    )
  }
  const showEditEndpointModal = () => {
    return (
      state.showEndpointForm.edit && (
        <SubPageForm
          {...props}
          title='Rename'
          show={state.showEndpointForm.edit}
          onCancel={() => {
            setState({ showEndpointForm: false })
          }}
          onHide={() => {
            setState({ showEndpointForm: false })
          }}
          selectedEndpoint={props?.endpointId}
          pageType={4}
          isEndpoint={true}
          selectedPage={this.props?.endpointId}
        />
      )
    )
  }

  const displaySingleEndpoint = (endpointId) => {
    const idToCheck = props.location.pathname.split('/')[4] === 'endpoint' ? props.location.pathname.split('/')[5] : null
    let isUserOnPublishedPage = isOnPublishedPage()
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === endpointId ? 'selected' : (isDashboardRoute && props.match.params.endpointId === endpointId ? 'selected' : '')
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
          <div className={props?.endpoints[endpointId]?.state} />
          <div className='sidebar-toggle d-flex justify-content-between mt-1'>
            <button>
              <div className={`side-bar d-flex ${isSelected ? 'Selected' : ''}`}>
                <button
                  tabIndex={-1}
                  onClick={() => {
                    handleDisplay(props.endpoints[endpointId], props.endpointId, props.collection_id, true)
                  }}
                  onDoubleClick={() =>
                    handleDisplay(props.endpoints[endpointId], props.endpointId, props.collection_id, false)
                  }
                >

                  {displayEndpointName(endpointId)}

                </button>
                <div className='d-flex align-items-center'>
                  {isDashboardRoute(props, true) &&
                    !props.collections[props.collection_id]?.importedFromMarketPlace &&
                    displayEndpointOptions(endpointId)}
                  {/* <div className='ml-1 published-icon transition'>
                    {props.endpoints[props.match.params.endpointId]?.isPublished && <img src={GlobeIcon} alt='globe' width='14' />}
                  </div> */}
                </div>
              </div>
            </button>
          </div>
        </div>
      </>
    )
  }

  const addEndpoint = (endpoint) => {
    props.add_endpoint(endpoint, props.parent_id, null)
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
        {/* {endpoints?.map((endpointId) => (
          displaySingleEndpoint(endpointId)
        ))} */}
        {endpointId?.length === 0 && renderForm()}
      </>
    )
  }

  const filterEndpointIdsByGroup = () => {
    const endpointIds = Object.keys(props.endpoints).filter(
      (eId) => props.endpoints[eId].parentId && props.endpoints[eId].parentId === props.parent_id
    )
    return endpointIds
  }

  const extractEndpointsFromIds = (endpointIds) => {
    let endpointsArray = []
    for (let index = 0; index < endpointIds.length; index++) {
      const id = endpointIds[index]
      const endpoint = props.endpoints[id]
      endpointsArray = [...endpointsArray, endpoint]
    }
    endpointsArray.sort(function (a, b) {
      if (a.name < b.name) {
        return -1
      }
      if (a.name > b.name) {
        return 1
      }
      return 0
    })
    return endpointsArray || []
  }

  const getEndpointsEntity = (endpointsArray) => {
    const endpoints = {}
    for (let index = 0; index < endpointsArray.length; index++) {
      const id = endpointsArray[index].id || endpointsArray[index].requestId
      endpoints[id] = props.endpoints[id]
    }
    return endpoints || {}
  }

  const endpointIds = filterEndpointIdsByGroup()
  let endpointsArray = []
  endpointsArray = extractEndpointsFromIds(endpointIds)
  let endpoints = {}
  endpoints = getEndpointsEntity(endpointsArray)
  return (
    <>
      {showEditEndpointModal()}
      {state.showEndpointForm.delete &&
        endpointService.showDeleteEndpointModal(
          props,
          handleDelete.bind(this),
          closeDeleteEndpointModal.bind(this),
          'Delete Endpoint',
          `Are you sure you want to delete this endpoint?`,
          state.selectedEndpoint
        )}
      {displayUserEndpoints(props?.endpointId)}
    </>
  )
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Endpoints))