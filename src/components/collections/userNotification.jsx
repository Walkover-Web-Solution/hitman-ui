import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import authService from '../auth/authService'

class UserInfo extends Component {
  constructor (props) {
    super(props)
    this.state = { user: { name: '', email: '' } }
  }

  componentDidMount () {
    if (authService.getCurrentUser()) {
      const user = {}
      const currentUser = authService.getCurrentUser()
      user.name = currentUser.first_name + currentUser.last_name
      user.email = currentUser.email
      this.setState({ user })
    }
  }

  getFirstPublicCollection () {
    const allCollections = this.props.get_public_collections()

    let firstCollection = {}
    for (let i = 0; i < allCollections.length; i++) {
      const collectionId = allCollections[i]
      const collection = this.props.collections[collectionId]
      firstCollection = collection
      break
    }
    return firstCollection
  }

  navigateToPublishDocs () {
    const collection = this.getFirstPublicCollection()
    this.props.open_publish_docs(collection)
  }

  render () {
    return (
      <>
        <div className='user-notification user-info '>
          <div className='user-avatar '>
            <i className='uil uil-user' />
          </div>
          <div className='user-details'>
            <div className='user-heading'>
              <div className='user-name'>
                {this.state.user.name}
              </div>
              {
                authService.isAdmin() &&
                  <Dropdown>
                    <Dropdown.Toggle variant='success' id='dropdown-basic'>
                      <div class=' user-name notification'>
                        <span> <i class='fas fa-bell' /></span>
                        <span class='badge'>{this.props.get_notification_count()}</span>
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => this.navigateToPublishDocs()}>Hosted API</Dropdown.Item>
                      <Dropdown.Item>
                        <li>
                          <Link to='/logout'>
                            Sign out
                          </Link>
                        </li>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
              }
              {
                !authService.isAdmin() &&
                  <Link to='/logout'>Sign out</Link>

              }
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default UserInfo
