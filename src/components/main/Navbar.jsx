import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../auth/authService'
import collectionsService from '../collections/collectionsService'
import environmentsService from '../environments/environmentsService'
import '../styles.scss'
import tabService from '../tabs/tabService'
import CreateNewModal from './CreateNewModal'
import './main.scss'
import OpenApiForm from '../openApi/openApiForm'

const Navbar = (props) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [showCreateNewModal, setShowCreateNewModal] = useState(false)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [showEnvironmentForm, setShowEnvironmentForm] = useState(false)
  const [showOpenApiForm, setShowOpenApiForm] = useState(false)

  useEffect(() => {
    const { user } = getCurrentUser()
    const name = user.first_name + user.last_name
    const email = user.email
    setName(name)
    setEmail(email)
  }, [])

  const handleAddEndpoint = () => {
    tabService.newTab({ ...props })
  }

  const openCreateNewModal = (onHide) => {
    return (
      <CreateNewModal
        {...props}
        show
        onHide={onHide}
        add_new_endpoint={handleAddEndpoint}
        open_collection_form={() => setShowCollectionForm(true)}
        open_environment_form={() => setShowEnvironmentForm(true)}
      />
    )
  }

  return (
    <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
      {/* {showCreateNewModal && openCreateNewModal(() => setShowCreateNewModal(false))} */}
      {showCollectionForm && collectionsService.showCollectionForm(props, () => setShowCollectionForm(false), 'Add new Collection')}
      {showEnvironmentForm && environmentsService.showEnvironmentForm(props, () => setShowEnvironmentForm(false), 'Add new Environment')}
      {showOpenApiForm && <OpenApiForm {...props} show onHide={() => setShowOpenApiForm(false)} title='IMPORT API' />}
      <div className='btn-group'>
        <button id='new-button' className='btn' onClick={() => setShowCreateNewModal(true)}>
          <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M9 3.75V14.25' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M3.75 9H14.25' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          New
        </button>
        <button
          id='new-button-dropdown'
          className='btn  dropdown-toggle dropdown-toggle-split'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        />
        <div className='dropdown-menu'>
          <li className='dropdown-item' onClick={handleAddEndpoint}>
            <i className='fas fa-share-square' style={{ margin: '5px' }} /> Endpoint
          </li>
          <li className='dropdown-item' onClick={() => setShowCollectionForm(true)}>
            <i className='fas fa-folder-open' style={{ margin: '5px' }} />
            Collection
          </li>
          <li className='dropdown-item' onClick={() => setShowEnvironmentForm(true)}>
            <i className='fas fa-border-none' style={{ margin: '5px' }} />
            Environment
          </li>
        </div>

        <button className='btn nav-left-button-1' onClick={() => setShowOpenApiForm(true)}>
          Import open API
        </button>

        <div className='dropdown nav-left-button-2'>
          <button
            className='btn btn-secondary dropdown-toggle '
            type='button'
            id='dropdownMenuButton'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
          >
            <i className='fa fa-file-text' aria-hidden='true' />
          </button>
          <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
            <button className='btn ' onClick={() => tabService.newTab(props)} style={{ color: 'black', width: '100%' }}>
              Open new tab
            </button>
          </div>
        </div>
      </div>

      <div className='btn-grp' id='user-menu'>
        <div className='dropdown'>
          <button
            className='btn btn-secondary dropdown-toggle'
            type='button'
            id='dropdownMenuButton'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
            style={{ borderRadius: '70px' }}
          >
            <i className='fas fa-user' />
          </button>
          <div className='dropdown-menu dropdown-menu-right' aria-labelledby='dropdownMenuButton'>
            <div id='custom-user-left'>
              <i className='fas fa-user' />
            </div>
            <div id='custom-user-right'>
              <div>{name}</div>
              <div>{email}</div>
              <div>
                <li className=' '>
                  <Link to='/logout'>Sign out</Link>
                </li>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
