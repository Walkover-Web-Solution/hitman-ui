import React, { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import EnvironmentModal from './environmentModal.jsx'
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg'
import { ReactComponent as EyeDisabledIcon } from '../../assets/icons/eyeDisabled.svg'
import IconButton from '../common/iconButton.jsx'
import { IoIosArrowDown } from 'react-icons/io'
import ImportEnvironmentModal from './ImportEnvironmentModal.js'
import { useSelector, useDispatch } from 'react-redux'
import { fetchEnvironments, fetchEnvironmentsFromLocalStorage, setEnvironmentId } from './redux/environmentsActions'
import EnvironmentVariables from './environmentVariables.jsx'
import DeleteModal from '../common/deleteModal.jsx'
import './environments.scss'

const Environments = () => {

  const { environment, currentEnvironmentId } = useSelector((state) => {
    return {
      environment: state.environment,
      currentEnvironmentId: state.environment.currentEnvironmentId
    }
  })

  const dispatch = useDispatch()

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

  const handleEnv = (environmentId) => {
    dispatch(setEnvironmentId(environmentId))
  }

  const handleEyeClick = () => {
    if (environment?.environments[currentEnvironmentId]) handleEnvironmentModal('Edit Environment', environment.environments[currentEnvironmentId])
  }

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

      <div className='select-environment-dropdown border-radius-right-none'>
        <Dropdown>
          <Dropdown.Toggle variant='default' id='dropdown-basic'>
            <span className='truncate'>{environment?.environments[environment?.currentEnvironmentId] ? environment.environments[environment.currentEnvironmentId].name : 'No Environment'}</span>
            <IconButton><IoIosArrowDown className='m-1' /></IconButton>
          </Dropdown.Toggle>
          <Dropdown.Menu alignRight>
            <Dropdown.Item onClick={() => handleEnv(null)} key='no-environment'>No Environment</Dropdown.Item>
            {Object.keys(environment.environments).map((environmentId) => <Dropdown.Item onClick={() => handleEnv(environmentId)} key={environmentId}>{environment.environments[environmentId]?.name}</Dropdown.Item>)}
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
export default Environments