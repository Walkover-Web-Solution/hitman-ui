import React, { useEffect, useState } from 'react'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import EnvironmentModal from './environmentModal.jsx'
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg'
import { ReactComponent as EyeDisabledIcon } from '../../assets/icons/eyeDisabled.svg'
import IconButton from '../common/iconButton.jsx'
import { IoIosArrowDown } from 'react-icons/io'
import ImportEnvironmentModal from './ImportEnvironmentModal.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { fetchEnvironments, fetchEnvironmentsFromLocalStorage, setEnvironmentId } from './redux/environmentsActions'
import EnvironmentVariables from './environmentVariables.jsx'
import DeleteModal from '../common/deleteModal.jsx'
import './environments.scss'
import { FaCheck } from "react-icons/fa6";
import { getCurrentUser } from '../auth/authServiceV2.jsx'
import { BiExport } from 'react-icons/bi'
import exportEnvironmentApi from './exportEnvironmentApi.js'
import { FaGlobeAmericas } from 'react-icons/fa'

const Environments = () => {

  const { environment, currentEnvironmentId, organizations } = useSelector((state) => {
    return {
      environment: state.environment,
      currentEnvironmentId: state.environment.currentEnvironmentId,
      organizations: state.organizations
    }
  })

  const dispatch = useDispatch()
  const userId = getCurrentUser()?.id

  const [environmentFormName, setEnvironmentFormName] = useState('')
  const [environmentToBeEdited, setEnvironmentToBeEdited] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!navigator.onLine) dispatch(fetchEnvironmentsFromLocalStorage())
      else dispatch(fetchEnvironments())
      handleEnv(currentEnvironmentId)
    }
    fetchData()
  }, [])

  const handleEnvironmentModal = (newEnvironmentFormName, newEnvironmentToBeEdited) => {
    setEnvironmentFormName(newEnvironmentFormName)
    setEnvironmentToBeEdited(newEnvironmentToBeEdited)
  }

  const openDeleteEnvironmentModal = (environmentId) => {
    setShowDeleteModal(true)
    setSelectedEnvironment(environment.environments[environmentId])
  }

  const closeDeleteEnvironmentModal = () => {
    setShowDeleteModal(false)
  }

  const showTooltips = () => {
    return <Tooltip className="fs-4 text-secondary"><span >Export </span></Tooltip>
  }

  const handleExport = async (Id) => {
    try {
        const data = await exportEnvironmentApi(Id, organizations?.currentOrg.id);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${data.name || 'environment'}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
    }
};


  const handleEnv = (environmentId) => {
    dispatch(setEnvironmentId(environmentId))
  }

  const handleEyeClick = () => {
    if (environment?.environments[currentEnvironmentId]) handleEnvironmentModal('Edit Environment', environment.environments[currentEnvironmentId])
  }
  if (organizations?.currentOrg?.meta?.type !== 0) {
    return (

      <div className='environment-container d-flex align-items-center transition'>
        {(environmentFormName === 'Add new Environment' || environmentFormName === 'Edit Environment') &&
          <EnvironmentVariables show onHide={handleEnvironmentModal} title={environmentFormName} environment={environmentToBeEdited} />}

        {environmentFormName === 'Environment modal' &&
          <EnvironmentModal show open_delete_environment_modal={openDeleteEnvironmentModal} close_delete_environment_modal={closeDeleteEnvironmentModal} onHide={() => handleEnvironmentModal()} handle_environment_modal={handleEnvironmentModal} />}

        {showDeleteModal &&
          <DeleteModal show onHide={closeDeleteEnvironmentModal} title={'Delete Environment'} message={'Are you sure you wish to delete this environment?'} deleted_environment={selectedEnvironment} />}

        <div onClick={handleEyeClick} className={`environment-buttons addEniButton ${environment.environments[currentEnvironmentId] && 'hover'}`}>
          <IconButton>{environment?.environments[currentEnvironmentId] ? <EyeIcon className='cursor-pointer m-1' /> : <EyeDisabledIcon className='m-1' />}</IconButton>
        </div>

        <div className='select-environment-dropdown border-radius-right-none align-content-center'>
          <Dropdown className='ml-1'>
          <IconButton variant='sm'><Dropdown.Toggle className='p-0 pl-1 fs-4' variant='default' id='dropdown-basic'>
              <span className='truncate'>{environment?.environments[environment?.currentEnvironmentId] ? environment.environments[environment.currentEnvironmentId].name : 'No Environment'}</span>
              <IoIosArrowDown className='m-1' />
            </Dropdown.Toggle></IconButton>
            <Dropdown.Menu alignRight>
              <Dropdown.Item onClick={() => handleEnv(null)} key='no-environment'>No Environment</Dropdown.Item>
              {Object.keys(environment.environments).map((environmentId) => <Dropdown.Item onClick={() => handleEnv(environmentId)} key={environmentId}>
                {environment.environments[environmentId]?.name}
                {environmentId === currentEnvironmentId && <span className='check-icon'><FaCheck /></span>}
                <OverlayTrigger placement="bottom" overlay={showTooltips()} >
                  <span className='export-icon' onClick={(event) => { event.stopPropagation();handleExport(environment?.environments[environmentId].id)}}><BiExport size={18} /></span>
                </OverlayTrigger>
                {environment?.environments[environmentId]?.userId === 0 && environment?.environments[environmentId]?.orgId !== null && environmentId !== currentEnvironmentId && <span className='global-icon'><FaGlobeAmericas size={16} /></span>}
              </Dropdown.Item>)}
              <Dropdown.Divider />
              <Dropdown.Item className='dropdown-item' onClick={() => handleEnvironmentModal('Add new Environment')}>Add Environment</Dropdown.Item>
              <Dropdown.Item className='dropdown-item' onClick={() => setShowImportModal(true)}>Import Environment</Dropdown.Item>
              <Dropdown.Item className='dropdown-item' onClick={() => handleEnvironmentModal('Environment modal')}>Manage Environment</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <ImportEnvironmentModal show={showImportModal} onClose={() => setShowImportModal(false)} />
      </div>
    )
  }
}
export default Environments
