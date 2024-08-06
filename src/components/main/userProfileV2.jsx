import React, { useState, useRef, forwardRef } from 'react'
import { Button, Dropdown, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Avatar from 'react-avatar'
import { useSelector, useDispatch } from 'react-redux'
import Power from '../../assets/icons/power.svg'
import { getCurrentOrg, getCurrentUser } from '../auth/authServiceV2'
import { switchOrg, createOrg, fetchOrganizations, leaveOrganization } from '../../services/orgApiService'
import './userProfile.scss'
import { toast } from 'react-toastify'
import { closeAllTabs } from '../tabs/redux/tabsActions'
import { onHistoryRemoved } from '../history/redux/historyAction'
import { ReactComponent as Users } from '../../assets/icons/users.svg'
import { MdAdd, MdDeleteOutline } from 'react-icons/md'
import IconButton from '../common/iconButton'
import { IoIosArrowDown } from 'react-icons/io'
import CollectionForm from '../collections/collectionForm'
import { FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import ImportCollectionModal from '../importCollection/importColectionModel'
import CustomModal from '../customModal/customModal'
import { BsThreeDots } from 'react-icons/bs'
import { isOrgDocType } from '../common/utility'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'
import { FaCheck } from "react-icons/fa6";
import { IoExit } from 'react-icons/io5'

const UserProfile = () => {
  const historySnapshot = useSelector((state) => state.history)
  const tabs = useSelector((state) => state.tabs)
  const organizationList = useSelector((state) => state.organizations.orgList)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [orgName, setOrgName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalForTabs, setModalForTabs] = useState(false)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const inputRef = useRef(null)
  const [switchOrCreate, setSwitchOrCreate] = useState(false)
  const [currentOrg, setCurrentOrg] = useState('')

  const validateName = (orgName) => {
    const regex = /^[a-zA-Z0-9_]+$/
    return orgName && regex.test(orgName) && orgName.length >= 3 && orgName.length <= 50
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddOrg()
    }
  }

  const removeFromLocalStorage = (tabIds) => {
    tabIds.forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  const handleNewOrgClick = async () => {
    toggleModal()
    const tabIdsToClose = tabs.tabsOrder
    if (tabIdsToClose.length === 1 || tabIdsToClose.length === 0) {
      setModalForTabs(false)
      removeFromLocalStorage(tabIdsToClose)
      dispatch(closeAllTabs(tabIdsToClose))
      dispatch(onHistoryRemoved(historySnapshot))
      await createOrg(orgName)
    } else {
      setModalForTabs(true)
    }
  }

  const handleAddOrg = async () => {
    try {
      if (!validateName(orgName)) {
        toast.error('Invalid organization name')
        return
      }
      await handleNewOrgClick()
      setSwitchOrCreate(true)
    } catch (e) {
      toast.error('Something went wrong')
    }
  }

  const toggleModal = async () => {
    setShowModal(!showModal)
    setLoading(true)
    if (!showModal) {
      await fetchOrganizations()
      setLoading(false)
    }
  }

  const renderOrgName = () => {
    return (
      <div>
        <div className='org-name'>{getCurrentOrg()?.name || null}</div>
      </div>
    )
  }

  const getUserDetails = () => {
    return { email: getCurrentUser().email || '', name: getCurrentUser().name }
  }

  const handleAddNewClick = () => {
    setShowNewCollectionModal((prev) => !prev)
  }

  const handleImportClick = () => {
    setShowImportModal((prev) => !prev)
  }

  const renderAvatarWithOrg = (onClick, ref1) => {
    return (
      <div className='menu-trigger-box d-flex align-items-center justify-content-between w-100'>
        <div
          ref={ref1}
          className='d-flex position-relative cursor-pointer'
          onClick={(e) => {
            e.preventDefault()
            onClick(e)
          }}
        >
          <Avatar className='mr-2' color='#343a40' name={getCurrentOrg()?.name} size={22} round='4px' />
          {renderOrgName()}
          <IconButton>
            <IoIosArrowDown className='transition cursor-pointer text-dark' />
          </IconButton>
        </div>
        <div className='add-button d-flex align-items-center'>
          {isOrgDocType() && <button className='btn btn-light px-1' onClick={handleImportClick}>
            Import
          </button>}
          <ImportCollectionModal
            show={showImportModal}
            onClose={() => {
              handleImportClick()
            }}
          />
          <CustomModal size='sm' modalShow={showNewCollectionModal} hideModal={handleAddNewClick}>
            <CollectionForm title='Add new Collection' onHide={handleAddNewClick} />
          </CustomModal>
        </div>
      </div>
    )
  }

  const renderUserDetails = () => {
    const { email } = getUserDetails()
    const handleCreateOrganizationClick = () => {
      navigate('/onBoarding')
    };
    return (
      <div className='profile-details border-bottom plr-3 pb-1 d-flex align-items-center justify-content-between py-1'>
        <div className='d-flex align-items-center'>
          <div className='user-icon mr-2'>
            <FiUser size={12} />
          </div>
          <div className='profile-details-user-name'>
            <span className='profile-details-label-light fs-4'>{email}</span>
          </div>
        </div>
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic">
            <IconButton>
              <BsThreeDots className='text-dark' />
            </IconButton>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item className='pl-1' onClick={handleCreateOrganizationClick}>Create organization</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  const openAccountAndSettings = () => {
    const orgId = getCurrentOrg()?.id
    navigate(`/orgs/${orgId}/invite`)
  }

  const renderInviteTeam = () => {
    return (
      <div className='invite-user cursor-pointer' onClick={openAccountAndSettings}>
        <Users className='mr-2' size={17} />
        <span>Members</span>
      </div>
    )
  }

  const handleOrgClick = (org, selectedOrg) => {
    toggleModal()
    const tabIdsToClose = tabs.tabsOrder
    setCurrentOrg(org)
    if (org.id === selectedOrg.id) {
      setModalForTabs(false)
      toast.error('This organization is already selected')
    } else if (org.id !== selectedOrg.id && (tabIdsToClose.length === 1 || tabIdsToClose.length === 0)) {
      setModalForTabs(false)
      switchOrg(org.id, true)
      removeFromLocalStorage(tabIdsToClose)
      dispatch(closeAllTabs(tabIdsToClose))
      dispatch(onHistoryRemoved(historySnapshot))
    } else {
      setModalForTabs(true)
    }
  }

  const showTooltips = () => {
    return <Tooltip  className="fs-4 text-secondary"><span >Leave</span></Tooltip>
  }

  const renderOrgListDropdown = () => {
    const organizations = organizationList || []
    const selectedOrg = getCurrentOrg()
    return (
      <div className='org-listing-container'>
        <div className='org-listing-column d-flex flex-column gap-1 w-100'>
          {organizations.map((org, key) => (
            <div key={key} className='d-flex name-list cursor-pointer'>
              <div className='d-flex '>
                <Avatar className='mr-2 avatar-org' name={org.name} size={32} />
                <span
                  className={`org-listing-button mr-1 ${org.id === selectedOrg?.id ? 'selected-org' : ''}`}
                  onClick={() => handleOrgClick(org, selectedOrg)}
                >
                  {org.name}
                </span>
              </div>
              {org?.id !== selectedOrg?.id && (
                <OverlayTrigger placement="bottom" overlay={showTooltips()} >
                  <span className='leave-icon' onClick={() => leaveOrganization(org.id)}><IoExit size={20}/></span>
                </OverlayTrigger>
              )}
              {org.id === selectedOrg?.id && <span className='check' ><FaCheck /></span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleTrashClick = () => {
    const currentOrgId = getCurrentOrg().id
    navigate(`/orgs/${currentOrgId}/trash`)
  }

  const renderTrash = () => {
    return (
      <div className='profile-details' onClick={handleTrashClick}>
        <MdDeleteOutline className='mr-2' size={17} />
        <span className='mr-2'>Trash</span>
      </div>
    )
  }

  const handleLogout = () => {
    navigate('/logout')
  }

  const renderLogout = () => {
    return (
      <div className='profile-details' onClick={() => handleLogout()}>
        <img src={Power} className='mr-2' size={14} alt='power-icon' />
        <span className='mr-2'> Logout</span>
      </div>
    )
  }

  const renderAddCollection = () => {
    return (
      <div onClick={handleAddNewClick}>
        <MdAdd className='mr-2' size={17} />
        <span className='mr-2'>Add collection</span>
      </div>
    )
  }

  const handleClose = () => {
    setModalForTabs(false)
    setShowModal(false)
  }

  const handleTabsandHistory = async (value) => {
    const tabIdsToClose = tabs.tabsOrder
    const history = historySnapshot

    if (value === 'yes') {
      dispatch(closeAllTabs(tabIdsToClose))
      removeFromLocalStorage(tabIdsToClose)
      dispatch(onHistoryRemoved(history))
      if (switchOrCreate) {
        createOrg(orgName)
      } else {
        switchOrg(currentOrg.id, true)
      }
    } else if (value === 'no') {
      setOrgName('')
      setModalForTabs(false)
      setShowModal(false)
    }
  }

  const showModalForTabs = () => {
    if (!modalForTabs) {
      return null
    }
    return (
      <Modal show={modalForTabs} onHide={handleClose} className='mt-4'>
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Save Tabs!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontWeight: '500' }}>If you switch organization all the tabs and history will be deleted!</Modal.Body>
        <Modal.Footer>
          <Button className='btn btn-danger btn-lg mr-2' onClick={() => handleTabsandHistory('yes')}>
            Yes
          </Button>
          <Button className='btn btn-secondary outline btn-lg' variant='secondary' onClick={() => handleTabsandHistory('no')}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <>
      <div className='profile-menu'>
        <Dropdown className='d-flex align-items-center'>
          <Dropdown.Toggle as={forwardRef(({ onClick }, ref) => renderAvatarWithOrg(onClick, ref))} id='dropdown-custom-components' />
          <Dropdown.Menu className='p-0'>
            {renderUserDetails()}
            <div className='profile-listing-container'>
              <div className='px-2 py-1 border-bottom'>
                <div className='p-2'>{renderOrgListDropdown()}</div>
              </div>
              <div className='px-2 py-1'>
                <DropdownItem>{renderInviteTeam()}</DropdownItem>
                <DropdownItem>{renderTrash()}</DropdownItem>
                <DropdownItem>{renderAddCollection()}</DropdownItem>
                <DropdownItem>{renderLogout()}</DropdownItem>
              </div>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      {modalForTabs ? showModalForTabs() : ''}
    </>
  )
}

export default UserProfile
