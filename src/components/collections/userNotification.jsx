import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import authService from '../auth/authService'
import vectorIcon from '../../assets/icons/Vector.svg'
import OpenApiForm from '../openApi/openApiForm'

class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = { user: { name: '', email: '' } }
  }

  componentDidMount() {
    if (authService.getCurrentUser()) {
      const user = {}
      const currentUser = authService.getCurrentUser()
      user.name = currentUser.first_name + currentUser.last_name
      user.email = currentUser.email
      this.setState({ user })
    }
  }

  getFirstPublicCollection() {
    const allCollections = this.props.get_public_collections()

    let firstCollection = {}
    const collectionId = allCollections[0]
    const collection = this.props.collections[collectionId]
    firstCollection = collection

    return firstCollection
  }

  navigateToPublishDocs() {
    const collection = this.getFirstPublicCollection()
    this.props.open_publish_docs(collection)
    this.props.open_collection(null) // for closing secondary-sidebar
  }

  openApiForm() {
    this.setState({ showOpenApiForm: true })
  }

  closeOpenApiFormModal() {
    this.setState({ showOpenApiForm: false })
  }

  showOpenApiModal() {
    return (
      this.state.showOpenApiForm && (
        <OpenApiForm
          {...this.props}
          show
          onHide={() => this.closeOpenApiFormModal()}
          title='IMPORT API'
        />
      )
    )
  }

  render() {
    const notificationCount = this.props.get_notification_count()

    return (
      <>
        <div className='user-notification user-info '>
          <div className='user-avatar '>
            {this.showOpenApiModal()}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">
                <path d="M22 11C22 17.0751 17.0751 22 11 22C4.92487 22 0 17.0751 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11Z" fill="white"></path>
              </mask>
              <g mask="url(#mask0)">
                <path d="M18.9102 19.0303L11.0096 19.0305L3.10892 19.0305C3.1089 12.377 6.97581 12.377 11.0096 12.377C15.0433 12.377 18.9102 12.377 18.9102 19.0303Z" fill="#C7C4C2"></path>
              </g>
              <circle cx="11" cy="7.07115" r="3.92857" fill="#C7C4C2"></circle>
            </svg>
          </div>
          <div className='user-details'>
            <div className='user-heading'>
              <div className='user-name'>{this.state.user.name}</div>
              {authService.isAdmin() && (
                <Dropdown>
                  <Dropdown.Toggle variant='' id='dropdown-basic'>
                    <div class=' user-name notification'>
                      {notificationCount && (
                        <>
                          <span>
                            {' '}
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.5 6C13.5 4.80653 13.0259 3.66193 12.182 2.81802C11.3381 1.97411 10.1935 1.5 9 1.5C7.80653 1.5 6.66193 1.97411 5.81802 2.81802C4.97411 3.66193 4.5 4.80653 4.5 6C4.5 11.25 2.25 12.75 2.25 12.75H15.75C15.75 12.75 13.5 11.25 13.5 6Z" stroke="#E98A36" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                              <path d="M10.2975 15.75C10.1657 15.9773 9.9764 16.166 9.74868 16.2971C9.52097 16.4283 9.2628 16.4973 9.00001 16.4973C8.73723 16.4973 8.47906 16.4283 8.25134 16.2971C8.02363 16.166 7.83437 15.9773 7.70251 15.75" stroke="#E98A36" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                          </span>
                          <span class='badge'>{notificationCount}</span>
                        </>
                      )}
                      <img
                        src={vectorIcon}
                        className='notification-icon'
                        alt=''
                      />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.navigateToPublishDocs()}>
                      <svg width='18' height='20' viewBox='0 0 18 20' fill='none'>
                        <path d='M9 7L5 11L8 11L8 19L10 19L10 11L13 11L9 7ZM15 0.999999L3 1C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 0.999999 2.46957 0.999999 3L1 15C1 15.5304 1.21071 16.0391 1.58579 16.4142C1.96086 16.7893 2.46957 17 3 17L6 17L6 15L3 15L3 3L15 3L15 15L12 15L12 17L15 17C15.5304 17 16.0391 16.7893 16.4142 16.4142C16.7893 16.0391 17 15.5304 17 15L17 3C17 2.46957 16.7893 1.96086 16.4142 1.58579C16.0391 1.21071 15.5304 0.999999 15 0.999999Z' fill='#E98A36' stroke='white' stroke-width='0.5' />
                      </svg>
                      Hosted API
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.openApiForm()}>
                      <svg width='18' height='20' viewBox='0 0 18 20' fill='none'>
                        <path d='M9 7L5 11L8 11L8 19L10 19L10 11L13 11L9 7ZM15 0.999999L3 1C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 0.999999 2.46957 0.999999 3L1 15C1 15.5304 1.21071 16.0391 1.58579 16.4142C1.96086 16.7893 2.46957 17 3 17L6 17L6 15L3 15L3 3L15 3L15 15L12 15L12 17L15 17C15.5304 17 16.0391 16.7893 16.4142 16.4142C16.7893 16.0391 17 15.5304 17 15L17 3C17 2.46957 16.7893 1.96086 16.4142 1.58579C16.0391 1.21071 15.5304 0.999999 15 0.999999Z' fill='#E98A36' stroke='white' stroke-width='0.5' />
                      </svg>
                      Import open API
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Link to='/logout'>
                        <svg width='16' height='15' viewBox='0 0 16 15' fill='none'>
                          <path d='M5.75 13.75L2.75 13.75C2.35218 13.75 1.97064 13.592 1.68934 13.3107C1.40804 13.0294 1.25 12.6478 1.25 12.25L1.25 1.75C1.25 1.35217 1.40804 0.970644 1.68934 0.68934C1.97065 0.408035 2.35218 0.25 2.75 0.25L5.75 0.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path d='M11 10.75L14.75 7L11 3.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        </svg>
                        Sign out
                      </Link>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {!authService.isAdmin() && <Link to='/logout'>Sign out</Link>}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default UserInfo
