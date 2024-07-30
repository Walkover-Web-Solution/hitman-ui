import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card, Dropdown, DropdownButton } from 'react-bootstrap'
import { isDashboardRoute, getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage } from '../common/utility'
import { addIsExpandedAction, setDefaultversionId } from '../../store/clientData/clientDataActions'
import pageService from '../pages/pageService'
import SubPageForm from '../subPages/subPageForm'
import SelectVersion from './selectVersion/selectVersion'
import CombinedCollections from '../combinedCollections/combinedCollections'
import IconButtons from '../common/iconButton'
import CustomModal from '../customModal/customModal'
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal'
import PublishedVersionDropDown from './publishedVersionDropDown/publishedVersionDropDown'
import { ReactComponent as Rename } from '../../assets/icons/renameSign.svg'
import { MdExpandMore } from 'react-icons/md'
import { MdOutlineSettings } from 'react-icons/md'
import { FiPlus } from 'react-icons/fi'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { BsThreeDots } from 'react-icons/bs'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { hexToRgb } from '../common/utility'
import { background } from '../backgroundColor.js'
import './collectionVersions.scss'

const CollectionParentPages = (props) => {
  const { pages, clientData, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      clientData: state.clientData,
      collections: state.collections
    }
  })

  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const versionDropDownRef = useRef(null)
  const dispatch = useDispatch()

  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [selectedVersionName, setSelectedVersionName] = useState('')
  const [defaultVersionName, setDefaultVersionName] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVersionForm, setShowVersionForm] = useState(false)
  const [selectedPage, setSelectedPage] = useState({})
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const [defaultVersionId, setDefaultVersionId] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [theme, setTheme] = useState('')
  const [showPageForm, setShowPageForm] = useState({ edit: false })

  useEffect(() => {
    if (!theme) setTheme(collections[props.collection_id]?.theme)
    const defaultVersion = findDefaultVersion()
    if (defaultVersion) {
      setDefaultVersionName(defaultVersion.name)
      setSelectedVersionId(defaultVersion.id)
      setDefaultVersionId(defaultVersion.id)
      setSelectedVersionName(defaultVersion.name)
    }
  }, [theme, props.collection_id])

  useEffect(() => {
    if (pages[selectedVersionId]?.name !== selectedVersionName) {
      if (selectedVersionId === defaultVersionId) setDefaultVersionName(pages[selectedVersionId]?.name)
      setSelectedVersionName(pages[selectedVersionId]?.name)
    }
  }, [pages, selectedVersionId, selectedVersionName, defaultVersionId])

  const findDefaultVersion = () => {
    const { rootParentId } = props
    const children = pages[rootParentId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1)
  }

  const showAddPageEndpointModal = () => {
    return (
      showAddCollectionModal && (
        <DefaultViewModal
          {...props}
          title='Add Page'
          show={showAddCollectionModal}
          onCancel={() => setShowAddCollectionModal(false)}
          onHide={() => setShowAddCollectionModal(false)}
          selectedVersion={selectedVersionId ? selectedVersionId : defaultVersionId}
          pageType={3}
        />
      )
    )
  }

  const openManageVersionModal = () => {
    return (
      showVersionForm && (
        <CustomModal modalShow={showVersionForm} onHide={() => setShowVersionForm(false)}>
          <SelectVersion parentPageId={props?.rootParentId} />
        </CustomModal>
      )
    )
  }

  const showEditPageModal = () => {
    return (
      showPageForm.edit && (
        <SubPageForm
          {...props}
          title='Rename'
          show={showPageForm.edit}
          onCancel={() => setShowPageForm({ ...showPageForm, edit: false })}
          onHide={() => setShowPageForm({ ...showPageForm, edit: false })}
          selectedPage={props?.rootParentId}
          pageType={1}
        />
      )
    )
  }

  const closeDeleteVersionModal = () => {
    setShowDeleteModal(false)
  }

  const closeDeletePageModal = () => {
    setShowDeleteModal(false)
  }

  const handleHover = (isHovered) => {
    setIsHovered(isHovered)
  }

  const handleRedirect = (id) => {
    if (isDashboardRoute({ location })) return navigate(`/orgs/${params.orgId}/dashboard/page/${id}`)
    sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
    let pathName = getUrlPathById(id, pages)
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
    navigate(pathName)
  }

  const handleToggle = (e, id) => {
    e.stopPropagation()
    const isExpanded = clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    dispatch(addIsExpandedAction({ value: !isExpanded, id: id }))
  }

  const handleParentPageClick = (e, expanded) => {
    handleRedirect(props.rootParentId)
    if (!expanded) handleToggle(e, props.rootParentId)
  }

  const versionName = () => {
    const versionName = defaultVersionName?.length > 10 ? `${defaultVersionName.substring(0, 7)} ... ` : defaultVersionName
    return pages?.[props.rootParentId]?.child?.length === 1 ? versionName : selectedVersionName?.length > 10 ? `${selectedVersionName.substring(0, 7)} ... ` : selectedVersionName;
  }

  const versionDropDown = (rootId) => {
    return (
      <DropdownButton className='version-dropdown' ref={versionDropDownRef} id='dropdown-basic-button' title={versionName()}>
        {pages[rootId].child.map((childId, index) => (
          <Dropdown.Item key={index} onClick={(e) => handleDropdownItemClick(childId, rootId)}>
            {pages[childId]?.name}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    )
  }

  const openAddPageEndpointModal = (pageId) => {
    setShowAddCollectionModal(true)
    setSelectedPage({ ...pages[pageId] })
  }

  const openEditPageForm = (pageId) => {
    setShowPageForm({ edit: true })
    setSelectedPage(pageId)
  }

  const openDeletePageModal = (pageId) => {
    setShowDeleteModal(true)
    setSelectedPage({ ...pages[pageId] })
  }

  const handleDropdownItemClick = (id, rootId) => {
    const newSelectedVersionName = pages[id]?.name
    setSelectedVersionName(newSelectedVersionName)
    setSelectedVersionId(id)
    const payload = {
      value: id,
      defaultVersionId: defaultVersionId,
      selectedVersionName: newSelectedVersionName,
      defaultVersionName: defaultVersionName,
      rootId: rootId
    }
    dispatch(setDefaultversionId(payload))
  }

  const renderBody = (pageId) => {
    let isUserOnPublishedPage = isOnPublishedPage()
    const expanded = clientData?.[pageId]?.isExpanded ?? isUserOnPublishedPage
    const rootId = pageId
    const isSelected = isUserOnPublishedPage && sessionStorage.getItem('currentPublishIdToShow') === pageId ? 'selected' : isDashboardRoute && params.pageId === pageId ? 'selected' : '';
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    let collectionId = pages?.[idToRender]?.collectionId ?? null
    var collectionTheme = collections[collectionId]?.theme
    const dynamicColor = hexToRgb(collectionTheme, 0.15)
    const staticColor = background['background_hover']
    const backgroundImage = (isHovered || isSelected) ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}), linear-gradient(to right, ${staticColor}, ${staticColor})` : ''

    return (
      <div className={['hm-sidebar-outer-block'].join(' ')} key={pageId}>
        <div className='sidebar-accordion versionBoldHeading' id='child-accordion'>
          <button tabIndex={-1} className={`pl-3 ${expanded ? 'expanded' : ''}`}>
            <div
              className={`active-select d-flex align-items-center justify-content-between rounded mr-2 ${isSelected ? ' selected' : ''}`}
              style={{ backgroundStyle: backgroundImage }}
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
            >
              <div className={`d-flex align-items-center cl-name `} onClick={(e) => handleParentPageClick(e, expanded)}>
                <div className='d-flex cl-name ml-1 align-items-baseline'>
                  <span className='versionChovron' onClick={(e) => handleToggle(e, props.rootParentId)}>
                    <MdExpandMore size={13} className='collection-icons-arrow d-none' />
                    <IoDocumentTextOutline size={13} className='collection-icons d-inline  ml-1 mb-1' />
                  </span>
                  <div
                    className='d-flex justify-content-between align-items-center name-parent-page'
                    draggable={!isUserOnPublishedPage}
                    onDragOver={props.handleOnDragOver}
                    onDragStart={() => props.onDragStart(pageId)}
                    onDrop={(e) => props.onDrop(e, pageId)}
                    onDragEnter={(e) => props.onDragEnter(e, pageId)}
                    onDragEnd={(e) => props.onDragEnd(e)}
                    style={props.draggingOverId === pageId ? { border: '3px solid red' } : null}
                  >
                    <div className='text-truncate d-inline'>{pages[pageId]?.name}</div>
                    {!isUserOnPublishedPage ? versionDropDown(rootId) : <PublishedVersionDropDown handleDropdownItemClick={handleDropdownItemClick} rootParentId={props?.rootParentId} defaultVersionName={defaultVersionName} selectedVersionName={selectedVersionName} />}
                  </div>
                </div>
              </div>

              {
                isDashboardRoute({ location }, true) && !collections[props.collection_id]?.importedFromMarketPlace ? (
                  <div className='sidebar-item-action d-flex align-items-center'>
                    <div className='d-flex align-items-center' onClick={() => openAddPageEndpointModal(selectedVersionId || defaultVersionId)}>
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
                      <div className='dropdown-item d-flex' onClick={() => openEditPageForm(pageId)}>
                        <Rename /> Rename
                      </div>
                      <div className='dropdown-item d-flex' onClick={() => setShowVersionForm(true)}>
                        <MdOutlineSettings size={20} color='#f2994a' /> Manage Version
                      </div>
                      <div className='dropdown-item text-danger d-flex' onClick={() => openDeletePageModal(pageId)}>
                        <DeleteIcon /> Delete
                      </div>
                    </div>
                  </div>
                ) : null
              }
            </div>
          </button>
          {expanded &&
            <div className='version-collapse'>
              <Card.Body>
                <div className='linkWrapper versionPages'>
                  <CombinedCollections
                    {...props}
                    page_id={pageId}
                    rootParentId={pages[props.rootParentId].child?.length === 1 ? defaultVersionId : selectedVersionId}
                  />
                </div>
              </Card.Body>
            </div>}
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      {showAddPageEndpointModal()}
      {showEditPageModal()}
      {showVersionForm && openManageVersionModal()}
      {showDeleteModal && pageService.showDeletePageModal(props, closeDeleteVersionModal, 'Delete Version', `Are you sure you want to delete this Version?All your subpages and endpoints present in this version will be deleted.`)}
      {showDeleteModal && pageService.showDeletePageModal(props, closeDeletePageModal, 'Delete Page', `Are you sure you want to delete this pages? All your versions,subpages and endpoints present in this page will be deleted.`, selectedPage)}
      {renderBody(props.rootParentId)}
    </React.Fragment>
  )
}
export default CollectionParentPages