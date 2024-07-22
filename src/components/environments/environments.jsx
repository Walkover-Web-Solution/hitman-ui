import { Dropdown } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'
import EnvironmentModal from './environmentModal.jsx'
import './environments.scss'
import environmentsService from './environmentsService.js'
import { isDashboardRoute } from '../common/utility.js'
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg'
import { ReactComponent as EyeDisabledIcon } from '../../assets/icons/eyeDisabled.svg'
import IconButton from '../common/iconButton.jsx'
import { IoIosArrowDown } from 'react-icons/io'
import ImportEnvironmentModal from './ImportEnvironmentModal.js'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchEnvironments, fetchEnvironmentsFromLocalStorage, setEnvironmentId } from './redux/environmentsActions'
import collectionsApiService from '../collections/collectionsApiService.js'

const Environments = (props) => {
  const environment = useSelector((state) => state.environment)
  const dispatch = useDispatch()
  const fetch_environments = () => dispatch(fetchEnvironments())
  const fetch_environments_from_local = () => dispatch(fetchEnvironmentsFromLocalStorage())
  const set_environment_id = (environmentId) => dispatch(setEnvironmentId(environmentId))

  const [publicCollectionEnvironmentId, setPublicCollectionEnvironmentId] = useState(null)
  const [publicEnvironmentName, setPublicEnvironmentName] = useState('')
  const [environmentFormName, setEnvironmentFormName] = useState('')
  const [environmentToBeEdited, setEnvironmentToBeEdited] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [originalEnvironmentReplica, setOriginalEnvironmentReplica] = useState(undefined)

  const location = useLocation()
  const navigate = useNavigate()

  const fetchCollection = async (collectionId) => {
    try {
      const collection = await collectionsApiService.getCollection(collectionId)
      if (collection.data.environment != null) {
        setPublicCollectionEnvironmentId(collection.data.environment.id)
        setOriginalEnvironmentReplica(collection.data.environment)
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!navigator.onLine) {
        fetch_environments_from_local()
      } else {
        fetch_environments()
      }
      const currentEnvironmentId = localStorage.getItem('currentEnvironmentId')
      handleEnv(currentEnvironmentId)
      if (!isDashboardRoute({ location }, true)) {
        const collectionIdentifier = location.pathname.split('/')[2]
        fetchCollection(collectionIdentifier)
      }
    }

    fetchData()
  }, [])

  const handlePublicEnv = async (environmentId) => {
    if (environmentId != null) {
      setPublicEnvironmentName(environment.environments[environmentId].name)
      navigate({
        Environment: 'setCollectionEnvironment',
        selectedPublicEnvironment: environment.environments[environmentId]
      })
    } else {
      setPublicEnvironmentName('No Environment')
      navigate({
        Environment: 'setCollectionEnvironment',
        selectedPublicEnvironment: null
      })
    }
  }

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

  const handleEnv = async (environmentId) => {
    dispatch(set_environment_id(environmentId))
    localStorage.setItem('currentEnvironmentId', environmentId)
  }

  const env = isDashboardRoute({ location })
    ? environment.environments[environment.currentEnvironmentId]
    : publicCollectionEnvironmentId != null
    ? environment.environments[publicCollectionEnvironmentId]
    : null

  if (env === undefined && publicCollectionEnvironmentId != null) {
    env = originalEnvironmentReplica
  }

  if (isDashboardRoute({ location }) && location.Environment === 'setCollectionEnvironment' && !location.dashboardEnvironment) {
    if (!location.publishedCollectionEnv) {
      return (
        <div className='select-environment-dropdown'>
          <Dropdown className='float-right'>
            <Dropdown.Toggle variant='default' id='dropdown-basic'>
              {location.privateCollectionEnv ? 'Select Environment' : publicEnvironmentName}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <Dropdown.Item onClick={() => handlePublicEnv(null)} key='no-environment'>
                No Environment
              </Dropdown.Item>
              {Object.keys(environment.environments).map((environmentId) => (
                <Dropdown.Item onClick={() => handlePublicEnv(environmentId)} key={environmentId}>
                  {environment.environments[environmentId].name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )
    } else {
      return <div />
    }
  } else {
    if (isDashboardRoute({ location })) {
      return (
        <div className='environment-container d-flex align-items-center transition'>
          {(environmentFormName === 'Add new Environment' || environmentFormName === 'Edit Environment') &&
            environmentsService.showEnvironmentForm(props, handleEnvironmentModal, environmentFormName, environmentToBeEdited)}
          {environmentFormName === 'Environment modal' && (
            <EnvironmentModal
              {...props}
              show
              open_delete_environment_modal={openDeleteEnvironmentModal}
              close_delete_environment_modal={closeDeleteEnvironmentModal}
              onHide={() => handleEnvironmentModal()}
              handle_environment_modal={handleEnvironmentModal}
            />
          )}
          <div>
            {showDeleteModal &&
              environmentsService.showDeleteEnvironmentModal(
                props,
                closeDeleteEnvironmentModal,
                'Delete Environment',
                'Are you sure you wish to delete this environment?',
                selectedEnvironment
              )}
          </div>

          {isDashboardRoute({ location }) && (
            <div
              onClick={() =>
                env ? handleEnvironmentModal('Edit Environment', environment.environments[environment.currentEnvironmentId]) : null
              }
              className={`environment-buttons addEniButton ${env ? 'hover' : ''}`}
            >
              <IconButton>{env ? <EyeIcon className='cursor-pointer m-1' /> : <EyeDisabledIcon className='m-1' />}</IconButton>
            </div>
          )}

          {isDashboardRoute({ location }) && (
            <>
              <div className='select-environment-dropdown border-radius-right-none'>
                <Dropdown className=''>
                  <Dropdown.Toggle variant='default' id='dropdown-basic'>
                    <span className='truncate'>
                      {environment.environments[environment.currentEnvironmentId]
                        ? environment.environments[environment.currentEnvironmentId].name
                        : 'No Environment'}
                    </span>
                    <IconButton>
                      <IoIosArrowDown className='m-1' />
                    </IconButton>
                  </Dropdown.Toggle>
                  <Dropdown.Menu alignRight>
                    <Dropdown.Item onClick={() => handleEnv(null)} key='no-environment'>
                      No Environment
                    </Dropdown.Item>
                    {Object.keys(environment.environments).map((environmentId) => (
                      <Dropdown.Item onClick={() => handleEnv(environmentId)} key={environmentId}>
                        {environment.environments[environmentId]?.name}
                      </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item className='dropdown-item' onClick={() => handleEnvironmentModal('Add new Environment')}>
                      Add Environment
                    </Dropdown.Item>
                    <Dropdown.Item className='dropdown-item' onClick={() => setShowImportModal(true)}>
                      Import Environment
                    </Dropdown.Item>
                    <Dropdown.Item className='dropdown-item' onClick={() => handleEnvironmentModal('Environment modal')}>
                      Manage Environment
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </>
          )}
          <ImportEnvironmentModal show={showImportModal} onClose={() => setShowImportModal(false)} />
        </div>
      )
    }
    if (!isDashboardRoute({ location })) {
      return (
        <div className='environment-container'>
          {publicCollectionEnvironmentId !== null && originalEnvironmentReplica !== undefined && env !== undefined && (
            <div className='environment-buttons'>
              <Dropdown className='float-right'>
                <Dropdown.Toggle bsPrefix='dropdown' variant='default' id='dropdown-basic'>
                  <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M0.75 9C0.75 9 3.75 3 9 3C14.25 3 17.25 9 17.25 9C17.25 9 14.25 15 9 15C3.75 15 0.75 9 0.75 9Z'
                      stroke='#828282'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z'
                      stroke='#828282'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </Dropdown.Toggle>

                <Dropdown.Menu alignRight className='custom-env-menu'>
                  <Dropdown.Item>{env ? env.name : 'No Environment Selected'}</Dropdown.Item>
                  <Dropdown.Divider />
                  <div>
                    <p className='custom-middle-pane'>VARIABLE</p>
                    <p className='custom-right-box'>DEFAULT VALUE</p>
                  </div>
                  {env &&
                    Object.keys(env.variables).map((v) => (
                      <div key={v}>
                        <p className='custom-middle-box'>{v}</p>
                        <p className='custom-right-box'>{env.variables[v].initialValue || 'None'}</p>
                      </div>
                    ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
          {originalEnvironmentReplica !== undefined && (
            <div className='select-environment-dropdown'>
              <Dropdown className='float-right'>
                <Dropdown.Toggle variant='default' id='dropdown-basic'>
                  {originalEnvironmentReplica !== undefined ? originalEnvironmentReplica.name : 'No Environment'}
                </Dropdown.Toggle>
              </Dropdown>
            </div>
          )}
        </div>
      )
    } else {
      return <div />
    }
  }
}
export default Environments
