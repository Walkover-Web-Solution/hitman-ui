import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../auth/authService'
import collectionsService from '../collections/collectionsService'
import environmentsService from '../environments/environmentsService'
import '../styles.scss'
import tabService from '../tabs/tabService'
import CreateNewModal from './CreateNewModal'
import './main.scss'
import OpenApiForm from '../openApi/openApiForm'

class Navbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      email: ''
    }
  }

  componentDidMount () {
    const { user } = getCurrentUser()
    const name = user.first_name + user.last_name
    const email = user.email
    this.setState({ name, email })
  }

  openCreateNewModal (onHide) {
    return (
      <CreateNewModal
        {...this.props}
        show
        onHide={onHide}
        add_new_endpoint={this.handleAddEndpoint.bind(this)}
        open_collection_form={this.openCollectionForm.bind(this)}
        open_environment_form={this.openEnvironmentForm.bind(this)}
      />
    )
  }

  openCollectionForm () {
    this.setState({ showCreateNewModal: false, showCollectionForm: true })
  }

  openEnvironmentForm () {
    this.setState({ showCreateNewModal: false, showEnvironmentForm: true })
  }

  handleAddEndpoint () {
    tabService.newTab({ ...this.props })
  }

  openApiForm () {
    this.setState({ showOpenApiForm: true })
  }

  closeOpenApiFormModal () {
    this.setState({ showOpenApiForm: false })
  }

  render () {
    return (
      <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
        {this.state.showCreateNewModal &&
          this.openCreateNewModal(() =>
            this.setState({
              showCreateNewModal: false
            })
          )}
        {this.state.showCollectionForm &&
          collectionsService.showCollectionForm(
            this.props,
            () => this.setState({ showCollectionForm: false }),
            'Add new Collection'
          )}
        {this.state.showEnvironmentForm &&
          environmentsService.showEnvironmentForm(
            this.props,
            () => this.setState({ showEnvironmentForm: false }),
            'Add new Environment'
          )}
        {this.state.showOpenApiForm && this.state.showOpenApiForm === true && (
          <OpenApiForm
            {...this.props}
            show
            onHide={() => this.closeOpenApiFormModal()}
            title='IMPORT API'
          />
        )}
        <div className='btn-group'>
          <button
            id='new-button'
            className='btn'
            onClick={() => this.setState({ showCreateNewModal: true })}
          >
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' /></svg>
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
            <li
              className='dropdown-item'
              onClick={() => this.handleAddEndpoint()}
            >
              <i className='fas fa-share-square' style={{ margin: '5px' }} />{' '}
              Endpoint
            </li>
            <li
              className='dropdown-item'
              onClick={() => this.openCollectionForm()}
            >
              <i className='fas fa-folder-open' style={{ margin: '5px' }} />
              Collection
            </li>
            <li
              className='dropdown-item'
              onClick={() => this.openEnvironmentForm()}
            >
              <i className='fas fa-border-none' style={{ margin: '5px' }} />
              Environment
            </li>
          </div>

          <button
            className='btn nav-left-button-1'
            // id="nav-left-buttons"
            onClick={() => this.openApiForm()}
          >
            Import open API
          </button>

          {/* <div className="dropdown" id="nav-left-buttons"> */}
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
              <button
                className='btn '
                onClick={() => tabService.newTab(this.props)}
                style={{ color: 'black', width: '100%' }}
              >
                Open new tab
              </button>
            </div>
            {/* <button
              className="btn "
              onClick={() => this.openApiForm()}
              style={{ color: "black", width: "100%", paddingLeft: "10px" }}
            >
              Import OpenApi
            </button> */}
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
            <div
              className='dropdown-menu dropdown-menu-right'
              aria-labelledby='dropdownMenuButton'
            >
              <div id='custom-user-left'>
                <i className='fas fa-user' />
              </div>
              <div id='custom-user-right'>
                <div>{this.state.name}</div>
                <div>{this.state.email}</div>
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
}

export default Navbar
