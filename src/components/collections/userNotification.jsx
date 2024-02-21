import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import { getCurrentUser, isAdmin } from '../auth/authServiceV2'
import vectorIcon from '../../assets/icons/Vector.svg'
import OpenApiForm from '../openApi/openApiForm'
import { getProfileName } from '../common/utility'
import TeamIcon from '../.././assets/icons/teamIcon.svg'
import hostedApi from '../.././assets/icons/hostedApiIcon.svg'
import importsign from '../.././assets/icons/importsign.svg'
import signout from '../.././assets/icons/signoutsign.svg'

class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = { user: { name: '', email: '' } }
  }

  componentDidMount() {
    if (getCurrentUser()) {
      const user = {}
      const currentUser = getCurrentUser()
      user.name = getProfileName(currentUser)
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
    // this.props.open_collection(null) // for closing secondary-sidebar
  }

  openImportCollectionForm() {
    this.setState({ importCollectionForm: true })
  }

  closeImportCollectionForm() {
    this.setState({ importCollectionForm: false })
  }

  showOpenApiModal() {
    return this.state.importCollectionForm && <OpenApiForm {...this.props} show onHide={() => this.closeImportCollectionForm()} />
  }

  render() {
    const notificationCount = this.props.get_notification_count()

    return (
      <>
        <div className='user-notification user-info '>
          <div className='user-avatar '>
            {this.showOpenApiModal()}
            <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <mask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='22' height='22'>
                <path
                  d='M22 11C22 17.0751 17.0751 22 11 22C4.92487 22 0 17.0751 0 11C0 4.92487 4.92487 0 11 0C17.0751 0 22 4.92487 22 11Z'
                  fill='white'
                />
              </mask>
              <g mask='url(#mask0)'>
                <path
                  d='M18.9102 19.0303L11.0096 19.0305L3.10892 19.0305C3.1089 12.377 6.97581 12.377 11.0096 12.377C15.0433 12.377 18.9102 12.377 18.9102 19.0303Z'
                  fill='#C7C4C2'
                />
              </g>
              <circle cx='11' cy='7.07115' r='3.92857' fill='#C7C4C2' />
            </svg>
          </div>
          <div className='user-details'>
            <div className='user-heading'>
              <div className='user-name'>{this.state.user?.name || this.state.user?.email || ''}</div>
              {isAdmin() && (
                <Dropdown>
                  <Dropdown.Toggle variant='' id='dropdown-basic'>
                    <div className=' user-name notification'>
                      {notificationCount && (
                        <>
                          <span>
                            {' '}
                            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                              <path
                                d='M13.5 6C13.5 4.80653 13.0259 3.66193 12.182 2.81802C11.3381 1.97411 10.1935 1.5 9 1.5C7.80653 1.5 6.66193 1.97411 5.81802 2.81802C4.97411 3.66193 4.5 4.80653 4.5 6C4.5 11.25 2.25 12.75 2.25 12.75H15.75C15.75 12.75 13.5 11.25 13.5 6Z'
                                stroke='#E98A36'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M10.2975 15.75C10.1657 15.9773 9.9764 16.166 9.74868 16.2971C9.52097 16.4283 9.2628 16.4973 9.00001 16.4973C8.73723 16.4973 8.47906 16.4283 8.25134 16.2971C8.02363 16.166 7.83437 15.9773 7.70251 15.75'
                                stroke='#E98A36'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </span>
                          <span className='badge'>{notificationCount}</span>
                        </>
                      )}
                      <img src={vectorIcon} className='notification-icon' alt='' />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div className='dropdown-item' style={{ cursor: 'pointer' }} onClick={() => this.navigateToViaSocket()}>
                    <img src= {TeamIcon}/>
                      Team
                    </div>
                    <Dropdown.Item
                      onClick={() => {
                        this.props.open_collection(this.getFirstPublicCollection()?.id || null)
                        this.props.disable_secondary_sidebar()
                        this.navigateToPublishDocs()
                      }}
                    >
                      <img src= {hostedApi} />
                      Hosted API
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.openImportCollectionForm()}>
                      <img src= {importsign}/>
                      Import
                    </Dropdown.Item>

                    <Link to='/logout' className='dropdown-item'>
                      <img src= {signout}/>
                      Sign out
                    </Link>
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {!isAdmin() && <Link to='/logout'>Sign out</Link>}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default UserInfo
