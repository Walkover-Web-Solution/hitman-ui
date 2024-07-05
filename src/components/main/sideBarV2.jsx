import React, { useState, useRef, useEffect, useCallback, useSelector } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import Collections from '../collections/collections'
import './main.scss'
import {
  isDashboardRoute,
  ADD_VERSION_MODAL_NAME,
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
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'
import NoFound, { ReactComponent as NoCollectionsIcon } from '../../assets/icons/noCollectionsIcon.svg'
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
// import collectionVersionsService from '../collectionVersions/collectionVersionsService'
import './main.scss'
import './sidebar.scss'
import CollectionModal from '../collections/collectionsModal'
import { openModal } from '../modals/redux/modalsActions'
import UserProfileV2 from './userProfileV2'
import CombinedCollections from '../combinedCollections/combinedCollections'
import { TbLogin2 } from 'react-icons/tb'
import { updateDragDrop } from '../pages/redux/pagesActions'
import { background } from '../backgroundColor.js'

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

const SideBar = (props) => {
  const [collectionId, setCollectionId] = useState(null)
  const [isShowAddCollectionModal, setIsShowAddCollectionModal] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState(null)
  const [secondarySidebarToggle, setSecondarySidebarToggle] = useState(false)
  const inputRef = useRef(null)
  const sidebarRef = useRef(null)
  const [data, setData] = useState({ filter: '' })
  const [historySnapshot, setHistorySnapshot] = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [pages, setPages] = useState([])
  const [draggingOverId, setDraggingOverId] = useState(null)
  const [draggedIdSelected, setDraggedIdSelected] = useState(null)
  const getSidebarInteractionClass = () => {
    return isDashboardRoute(props, true) ? 'sidebar' : 'sidebar'
  }

  const renderCollectionName = () => {
    const collectionKeys = Object.keys(props.collections || {})
    const firstCollection = props?.collections?.[collectionKeys[0]] || {}
    const collectionName = firstCollection.name
    const publishedCollectionTitle = firstCollection.docProperties?.defaultTitle || ''

    return (
      <div className='hm-sidebar-header d-flex align-items-center'>
        {(props.collections[collectionKeys[0]]?.favicon || props.collections[collectionKeys[0]]?.docProperties?.defaultLogoUrl) && (
          <div className='hm-sidebar-logo'>
            <img
              id='publicLogo'
              alt='public-logo'
              src={
                props.collections[collectionKeys[0]]?.favicon
                  ? `data:image/png;base64,${props.collections[collectionKeys[0]]?.favicon}`
                  : props.collections[collectionKeys[0]]?.docProperties?.defaultLogoUrl
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
          <a href='/login' target='_blank' className='login-button position-fixed d-flex gap-5 ps-5'>
            <TbLogin2 className='text-black' />
            <button
              type='button'
              className='btn btn-lg'
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

  const handleOnChange = (e) => {
    const searchData = e.target.value.toLowerCase()
    const newData = { ...data, filter: e.target.value }
    let filteredHistorySnapshot = []
    if (props.historySnapshot) {
      filteredHistorySnapshot = Object.values(props.historySnapshot).filter(
        (o) =>
          o.endpoint?.name?.toLowerCase().includes(searchData) ||
          o.endpoint?.BASE_URL?.toLowerCase().includes(searchData) ||
          o.endpoint?.uri?.toLowerCase().includes(searchData)
      )
    }
    let filteredEndpoints = []
    let filteredPages = []
    const sideBarData = props.pages
    for (let key in sideBarData) {
      let o = sideBarData[key]
      if (
        o.name?.toLowerCase().includes(searchData) ||
        o.BASE_URL?.toLowerCase().includes(searchData) ||
        o.uri?.toLowerCase().includes(searchData)
      ) {
        sideBarData[key]?.type === 4 ? filteredEndpoints.push(sideBarData[key]) : filteredPages.push(sideBarData[key])
      }
    }
    setData(newData)
    setHistorySnapshot(filteredHistorySnapshot)
    setEndpoints(filteredEndpoints)
    setPages(filteredPages)
  }

  const renderSearch = () => {
    return (
      <div tabIndex={0} className='d-flex align-items-center my-1 search-container'>
        <SearchIcon className='mr-2' />
        <input
          ref={inputRef}
          value={data.filter}
          className='search-input'
          placeholder='Type / to search'
          autoComplete='off'
          type='text'
          name='filter'
          id='search'
          onChange={handleOnChange}
        />
      </div>
    )
  }

  const renderGlobalAddButton = () => {
    const isMarketplaceImported = props.collections[collectionId]?.importedFromMarketPlace
    const title = collectionId
      ? isMarketplaceImported
        ? 'Cannot add Entities to a Marketplace Collection.'
        : 'Add Entities to Collection'
      : 'Add/Import Collection'

    return (
      getCurrentUser() && (
        <div className='d-flex align-items-center justify-content-end'>
          {/* Uncomment the next line to display filter state */}
          {/* <span className='f-12 font-weight-700'>{filter === '' ? 'COLLECTION' : 'SEARCH RESULTS'}</span> */}
        </div>
      )
    )
  }

  const openPage = (id) => {
    if (isDashboardRoute(props)) {
      props.history.push({
        pathname: `/orgs/${props.match.params.orgId}/dashboard/page/${id}`
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, props?.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      props.history.push(pathName)
    }
  }
  const renderPath = (id, type) => {
    let path = ''
    const collectionId = props.pages[id]?.collectionId

    switch (type) {
      case 'endpoint':
        path = `${props.collections[collectionId]?.name} > ${getOnlyUrlPathById(id, props.pages)}`
        break
      case 'page':
        path = `${props.collections[collectionId]?.name} > ${getOnlyUrlPathById(id, props.pages)}`
        break
      default:
        path = ''
        break
    }

    return path ? (
      <div style={{ fontSize: '11px' }} className='text-muted'>
        {path}
      </div>
    ) : (
      <p />
    )
  }

  const renderPagesList = () => {
    return (
      <div>
        <div className='px-3'>Pages</div>
        <div className='py-3'>
          {props.pages &&
            pages.map(
              (page, index) =>
                Object.keys(page).length !== 0 &&
                !(page?.type === 2 || page?.type === 0) && (
                  <div className='btn d-flex align-items-center mb-2' onClick={() => openPage(page.id)} key={index}>
                    <div>
                      <i className='uil uil-file-alt' aria-hidden='true' />
                    </div>
                    <div className='ml-3'>
                      <div className='sideBarListWrapper'>
                        <div className='text-left'>
                          <p>{page.name}</p>
                        </div>
                        {renderPath(page.id, 'page')}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
    )
  }

  const openEndpoint = (id) => {
    if (isDashboardRoute(props)) {
      props.history.push({
        pathname: `/orgs/${props.match.params.orgId}/dashboard/endpoint/${id}`
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, props?.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      props.history.push(pathName)
    }
  }

  const renderEndpointsList = () => {
    return (
      <div>
        {endpoints.length > 0 && <div className='px-3'>Endpoints</div>}
        <div className='py-3'>
          {endpoints.length > 0 &&
            endpoints.map(
              (endpoint, index) =>
                Object.keys(endpoint).length !== 0 && (
                  <div className='btn d-flex align-items-center mb-2' onClick={() => openEndpoint(endpoint.id)} key={index}>
                    <div className={`api-label lg-label ${endpoint.requestType}`}>
                      <div className='endpoint-request-div'>{endpoint.requestType}</div>
                    </div>
                    <div className='ml-3'>
                      <div className='sideBarListWrapper'>
                        <div className='text-left'>
                          <p>{endpoint.name || endpoint.BASE_URL + endpoint.uri}</p>
                        </div>
                        {renderPath(endpoint.id, 'endpoint')}
                      </div>
                    </div>
                  </div>
                )
            )}
        </div>
      </div>
    )
  }

  const openHistorySnapshot = (id) => {
    props.history.push({
      pathname: `/orgs/${props.match.params.orgId}/dashboard/history/${id}`,
      historySnapshotId: id
    })
  }

  const renderHistoryItem = (history) => {
    return (
      Object.keys(history).length !== 0 && (
        <div key={history.id} className='btn d-flex align-items-center mb-2' onClick={() => openHistorySnapshot(history?.id)}>
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

  const renderHistoryList = () => {
    return (
      <div className='mt-3'>
        {historySnapshot && historySnapshot.length > 0 ? (
          historySnapshot.sort(compareByCreatedAt).map((history) => renderHistoryItem(history))
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

  const renderSearchList = () => {
    if (data.filter !== '') {
      return pages.length > 0 || endpoints.length > 0 || historySnapshot.length > 0 ? (
        <div className='searchResult'>
          {pages.length > 0 ? renderPagesList() : null}
          {endpoints.length > 0 ? renderEndpointsList() : null}
          {historySnapshot.length > 0 ? (
            <div>
              <div className='px-3'>History</div>
              {renderHistoryList()}
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

  const getAllChildIds = useCallback(
    async (pageId) => {
      let pageObject = props.pages?.[pageId]
      let childIds = []
      if (pageObject?.child && pageObject?.child?.length > 0) {
        for (const childId of pageObject.child) {
          childIds.push(childId)
          childIds = childIds.concat(await getAllChildIds(childId))
        }
      }
      return childIds
    },
    [props.pages]
  )

  const handleOnDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const onDragEnter = useCallback((e, draggingOverId) => {
    e.preventDefault()
    setDraggingOverId(draggingOverId)
  }, [])

  const onDragEnd = useCallback((e) => {
    e.preventDefault()
    setDraggingOverId(null)
  }, [])

  const onDragStart = useCallback((draggedId) => {
    setDraggedIdSelected(draggedId)
  }, [])

  const onDrop = useCallback(
    async (e, droppedOnId) => {
      let pageIds = []
      e.preventDefault()

      if (draggedIdSelected === droppedOnId) return

      let draggedIdParent = props.pages?.[draggedIdSelected]?.parentId
      let droppedOnIdParent = props.pages?.[droppedOnId]?.parentId

      // Retrieve all child IDs of draggedId
      const draggedIdChilds = await getAllChildIds(draggedIdSelected)

      pageIds.push(...draggedIdChilds, draggedIdParent, droppedOnIdParent)

      props.update_drag_and_drop(draggedIdSelected, droppedOnId, pageIds)
    },
    [props.pages, draggedIdSelected, getAllChildIds, props.update_drag_and_drop]
  )

  const emptyFilter = () => {
    setData((prevData) => ({ ...prevData, filter: '' }))
  }

  // Function to open a collection
  const openCollection = (collectionId) => {
    setSelectedCollectionId(collectionId)
    setSecondarySidebarToggle(false)
  }

  // Rendering collections with handling logic
  const renderCollections = () => {
    const collectionsToRender = Object.keys(props.collections || {})
    return (
      <Collections
        {...props}
        handleOnDragOver={handleOnDragOver}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDrop={onDrop}
        draggingOverId={draggingOverId}
        collectionsToRender={collectionsToRender}
        selectedCollectionId={selectedCollectionId}
        empty_filter={emptyFilter}
        disable_secondary_sidebar={() => setSecondarySidebarToggle(true)}
        collection_selected={openCollection}
        filter={data.filter}
      />
    )
  }

  const renderSidebarContent = () => {
    const selectedCollectionName = props.collections[collectionId]?.name || ' '
    const collectionId1 = Object.keys(props?.collections)?.[0]
    const rootParentId = props?.collections?.[collectionId1]?.rootParentId || null
    return (
      <div
        ref={sidebarRef}
        onClick={(e) => {
          // Implement focus logic if required
        }}
        onBlur={(e) => {
          // Implement defocus logic if required
        }}
        className={''}
      >
        {isOnPublishedPage() ? (
          <div className='sidebar-accordion'>
            <CombinedCollections {...props} collectionId={collectionId1} rootParentId={rootParentId} />
          </div>
        ) : (
          renderCollections()
        )}
      </div>
    )
  }
  const renderDashboardSidebar = () => {
    let isOnDashboardPage = isDashboardRoute(props)
    return (
      <>
        {isOnDashboardPage && getCurrentUser() && getOrgList() && getCurrentOrg() && <UserProfileV2 {...props} />}
        <div className='plr-3 pt-2'>
          {isOnPublishedPage() && renderCollectionName()}
          {renderSearch()}
          {/* {isOnDashboardPage && renderGlobalAddButton()} */}
        </div>
        <div className='sidebar-content'>
          {data.filter !== '' && renderSearchList()}
          {data.filter === '' && renderSidebarContent()}
        </div>
      </>
    )
  }
  return (
    <>
      {
        <nav className={getSidebarInteractionClass()}>
          <div className='primary-sidebar'>{renderDashboardSidebar()}</div>
        </nav>
      }
    </>
  )
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SideBar))
