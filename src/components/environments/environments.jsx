import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import shortId from 'shortid'
import indexedDbService from '../indexedDb/indexedDbService'
import EnvironmentModal from './environmentModal'
import './environments.scss'
import environmentsService from './environmentsService.js'
import { isDashboardRoute } from '../common/utility'
import collectionsApiService from '../collections/collectionsApiService'
import {
  addEnvironment,
  deleteEnvironment,
  fetchEnvironments,
  setEnvironmentId,
  updateEnvironment
} from './redux/environmentsActions'
import eyeIcon from '../../assets/icons/eye.svg'
import eyeDisabledIcon from '../../assets/icons/eyeDisabled.svg'

const mapStateToProps = (state) => {
  return {
    environment: state.environment
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_environments: () => dispatch(fetchEnvironments()),
    add_environment: (newEnvironment) =>
      dispatch(addEnvironment(newEnvironment)),
    update_environment: (editedEnvironment) =>
      dispatch(updateEnvironment(editedEnvironment)),
    delete_environment: (deletedEnvironment) =>
      dispatch(deleteEnvironment(deletedEnvironment)),
    set_environment_id: (environmentId) =>
      dispatch(setEnvironmentId(environmentId))
  }
}

class Environments extends Component {
  state = {
    currentEnvironmentId: null,
    environmentFormName: null,
    showEnvironmentForm: false,
    showEnvironmentModal: false,
    environmentToBeEdited: {},
    publicEnvironmentName: 'Select Environment'
  };

  async componentDidMount () {
    this.props.fetch_environments()
    await indexedDbService.getDataBase()
    const currentEnvironmentId = await indexedDbService.getValue(
      'environment',
      'currentEnvironmentId'
    )
    this.handleEnv(currentEnvironmentId)
    if (!isDashboardRoute(this.props)) {
      const collectionIdentifier = this.props.location.pathname.split('/')[2]
      this.fetchCollection(collectionIdentifier)
    }
  }

  handleEnvironmentModal (environmentFormName, environmentToBeEdited) {
    this.setState({
      environmentFormName,
      environmentToBeEdited
    })
  }

  async handleEnv (environmentId) {
    this.props.set_environment_id(environmentId)
    this.setState({ currentEnvironmentId: environmentId })
    await indexedDbService.updateData(
      'environment',
      environmentId,
      'currentEnvironmentId'
    )
  }

  async handlePublicEnv (environmentId) {
    if (environmentId != null) {
      this.setState({
        publicEnvironmentName: this.props.environment.environments[
          environmentId
        ].name
      })
      this.props.history.push({
        Environment: 'setCollectionEnvironment',
        selectedPublicEnvironment: this.props.environment.environments[
          environmentId
        ]
      })
    } else {
      this.setState({
        publicEnvironmentName: 'No Environment'
      })
      this.props.history.push({
        Environment: 'setCollectionEnvironment',
        selectedPublicEnvironment: null
      })
    }
  }

  async handleAdd (newEnvironment) {
    newEnvironment.requestId = shortId.generate()
    this.props.add_environment(newEnvironment)
  }

  openDeleteEnvironmentModal (environmentId) {
    this.setState({
      showDeleteModal: true,
      selectedEnvironment: {
        ...this.props.environment.environments[environmentId]
      }
    })
  }

  closeDeleteEnvironmentModal () {
    this.setState({ showDeleteModal: false })
  }

  async fetchCollection (collectionId) {
    const collection = await collectionsApiService.getCollection(collectionId)
    if (collection.data.environment != null) {
      this.setState({
        publicCollectionEnvironmentId: collection.data.environment.id,
        originalEnvironmentReplica: collection.data.environment
      })
    }
  }

  renderEnvironment (env) {
    return (
      <div>
        <div className='px-3'>
          {env.name}
          <button
            className='editBtn'
            onClick={() =>
              this.handleEnvironmentModal('Edit Environment', env)}
          >
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M9 15H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
              <path d='M12.375 2.62517C12.6734 2.3268 13.078 2.15918 13.5 2.15918C13.7089 2.15918 13.9158 2.20033 14.1088 2.28029C14.3019 2.36024 14.4773 2.47743 14.625 2.62517C14.7727 2.77291 14.8899 2.9483 14.9699 3.14132C15.0498 3.33435 15.091 3.54124 15.091 3.75017C15.091 3.9591 15.0498 4.16599 14.9699 4.35902C14.8899 4.55204 14.7727 4.72743 14.625 4.87517L5.25 14.2502L2.25 15.0002L3 12.0002L12.375 2.62517Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
            </svg>
          </button>
        </div>
        <Dropdown.Divider />
        <div>
          {' '}
          <p className='custom-left-pane'>VARIABLE</p>
          <p className='custom-middle-pane'>INITIAL VALUE</p>
          <p className='custom-right-pane'>CURRENT VALUE</p>
        </div>
        {Object.keys(env.variables).map((v) => (
          <div key={v}>
            <p className='custom-left-box'>{v}</p>
            <p className='custom-middle-box'>
              {env.variables[v].initialValue || 'None'}
            </p>
            <p className='custom-right-box'>
              {env.variables[v].currentValue || 'None'}
            </p>
          </div>
        ))}
      </div>
    )
  }

  renderEnvWithoutVariables (env) {
    return (
      <div className='px-3 py-2 noEnviWrapper'>
        <h4>{env.name}</h4>
        <div className='text-center mt-5 mb-2 '>
          <svg width='138' height='143' viewBox='0 0 138 143' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path opacity='0.12' fill-rule='evenodd' clip-rule='evenodd' d='M94.8781 43.8829C106.111 52.6454 122.407 57.5835 124.47 71.7188C126.651 86.6721 116.385 100.613 104.529 110.033C93.5821 118.729 79.4589 120.232 65.6436 118.452C51.0118 116.567 35.8753 112.496 27.8141 100.148C19.1234 86.8355 18.7414 69.8859 24.1279 54.8586C29.8741 38.8283 40.1101 21.6124 56.8989 19.0079C72.6718 16.561 82.3242 34.0898 94.8781 43.8829Z' fill='#E98A36' />
            <rect x='99' y='51' width='50' height='60' rx='4' transform='rotate(90 99 51)' fill='url(#paint0_linear)' fill-opacity='0.5' />
            <path d='M95 51C97.2091 51 99 52.7909 99 55L99 64L39 64L39 55C39 52.7909 40.7909 51 43 51L95 51Z' fill='url(#paint1_linear)' />
            <rect x='53' y='71' width='32' height='24' rx='4' fill='white' fill-opacity='0.4' />
            <path fill-rule='evenodd' clip-rule='evenodd' d='M63.649 76.0837C63.8915 76.1903 64.0818 76.3887 64.1782 76.6354C64.2745 76.8822 64.2691 77.157 64.163 77.3997C63.3927 79.1661 62.9967 81.0728 63 82.9997C63 84.9927 63.416 86.8857 64.164 88.5997C64.2607 88.841 64.2596 89.1104 64.161 89.3509C64.0624 89.5914 63.8741 89.784 63.6359 89.888C63.3977 89.992 63.1284 89.9992 62.885 89.9081C62.6416 89.8169 62.4433 89.6346 62.332 89.3997C61.4509 87.3813 60.9974 85.2022 61 82.9997C61 80.7257 61.475 78.5597 62.332 76.5997C62.3846 76.4794 62.4604 76.3705 62.555 76.2795C62.6497 76.1884 62.7613 76.1168 62.8836 76.0689C63.0059 76.021 63.1365 75.9976 63.2678 76.0002C63.3991 76.0027 63.5287 76.0311 63.649 76.0837ZM71.96 79.9997C71.5102 79.9998 71.0662 80.1011 70.6608 80.296C70.2554 80.4909 69.899 80.7745 69.618 81.1257L69.29 81.5357L69.179 81.2567C69.0306 80.8858 68.7745 80.5678 68.4437 80.3438C68.1129 80.1197 67.7225 79.9999 67.323 79.9997H67C66.7348 79.9997 66.4804 80.1051 66.2929 80.2926C66.1054 80.4802 66 80.7345 66 80.9997C66 81.265 66.1054 81.5193 66.2929 81.7069C66.4804 81.8944 66.7348 81.9997 67 81.9997H67.323L67.855 83.3297L66.82 84.6247C66.7263 84.7418 66.6074 84.8363 66.4722 84.9012C66.337 84.9661 66.189 84.9998 66.039 84.9997H66C65.7348 84.9997 65.4804 85.1051 65.2929 85.2926C65.1054 85.4802 65 85.7345 65 85.9997C65 86.265 65.1054 86.5193 65.2929 86.7069C65.4804 86.8944 65.7348 86.9997 66 86.9997H66.039C66.4888 86.9996 66.9329 86.8984 67.3383 86.7035C67.7437 86.5086 68.1 86.225 68.381 85.8737L68.709 85.4637L68.82 85.7427C68.9685 86.1138 69.2248 86.4319 69.5558 86.656C69.8868 86.88 70.2773 86.9998 70.677 86.9997H71C71.2652 86.9997 71.5196 86.8944 71.7071 86.7069C71.8947 86.5193 72 86.265 72 85.9997C72 85.7345 71.8947 85.4802 71.7071 85.2926C71.5196 85.1051 71.2652 84.9997 71 84.9997H70.677L70.145 83.6697L71.18 82.3747C71.2737 82.2577 71.3926 82.1632 71.5278 82.0983C71.663 82.0334 71.811 81.9997 71.961 81.9997H72C72.2652 81.9997 72.5196 81.8944 72.7071 81.7069C72.8947 81.5193 73 81.265 73 80.9997C73 80.7345 72.8947 80.4802 72.7071 80.2926C72.5196 80.1051 72.2652 79.9997 72 79.9997H71.961H71.96ZM73.834 77.3997C73.7296 77.157 73.7255 76.8827 73.8227 76.6369C73.9198 76.3911 74.1104 76.1938 74.3526 76.0881C74.5949 75.9823 74.8691 75.9768 75.1154 76.0727C75.3617 76.1686 75.56 76.3581 75.667 76.5997C76.5485 78.6182 77.0023 80.7973 77 82.9997C77 85.2737 76.525 87.4397 75.668 89.3997C75.6182 89.5241 75.544 89.6371 75.4497 89.7322C75.3554 89.8272 75.2429 89.9024 75.119 89.9532C74.9951 90.004 74.8623 90.0294 74.7284 90.0278C74.5945 90.0263 74.4622 89.9979 74.3395 89.9443C74.2168 89.8907 74.1061 89.8131 74.014 89.7159C73.9219 89.6187 73.8502 89.504 73.8032 89.3786C73.7563 89.2532 73.735 89.1196 73.7406 88.9858C73.7462 88.8521 73.7787 88.7208 73.836 88.5997C74.6067 86.8335 75.003 84.9268 75 82.9997C75 81.0067 74.584 79.1137 73.835 77.3997H73.834Z' fill='url(#paint2_linear)' />
            <path d='M9.099 39.2139V44.8933' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M11.9387 42.0537L6.2593 42.0537' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M123.84 117V122.679' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M126.679 119.84L121 119.84' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M107.069 0.87793V6.55735' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M109.909 3.71777L104.23 3.71777' stroke='#E98A36' stroke-linecap='round' stroke-linejoin='round' />
            <defs>
              <linearGradient id='paint0_linear' x1='88' y1='37' x2='160.142' y2='97.774' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#FFCDA1' />
                <stop offset='0.0001' stop-color='#FFBA7C' />
                <stop offset='1' stop-color='#FFDDBD' />
              </linearGradient>
              <linearGradient id='paint1_linear' x1='77.5' y1='49' x2='79' y2='89' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#FFCDA1' />
                <stop offset='0.0001' stop-color='#FFBA7C' />
                <stop offset='1' stop-color='#FFDDBD' />
              </linearGradient>
              <linearGradient id='paint2_linear' x1='61.4' y1='76.3507' x2='74.9597' y2='91.8167' gradientUnits='userSpaceOnUse'>
                <stop stop-color='#F2994A' />
                <stop offset='0.0001' stop-color='#F2994A' />
                <stop offset='1' stop-color='#F0BD3B' />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className='text-center'>
          <h5>Sorry! There are NO variables</h5>
          <p className='greyWrapper pb-3'>You can add or edit here</p>
          <button className='btn btn-primary' onClick={() => { this.handleEnvironmentModal('Edit Environment', env) }}>Go To Environment</button>
        </div>
      </div>
    )
  }

  render () {
    let env = isDashboardRoute(this.props)
      ? this.props.environment.environments[
          this.props.environment.currentEnvironmentId
        ]
      : this.state.publicCollectionEnvironmentId != null
        ? this.props.environment.environments[
            this.state.publicCollectionEnvironmentId
          ]
        : null
    if (
      isDashboardRoute(this.props) &&
      this.props.location.Environment === 'setCollectionEnvironment' &&
      !this.props.location.dashboardEnvironment
    ) {
      if (!this.props.location.publishedCollectionEnv) {
        return (
          <div className='select-environment-dropdown'>
            <Dropdown className='float-right'>
              <Dropdown.Toggle variant='default' id='dropdown-basic'>
                {this.props.location.privateCollectionEnv
                  ? 'Select Environment'
                  : this.state.publicEnvironmentName}
              </Dropdown.Toggle>

              <Dropdown.Menu alignRight>
                <Dropdown.Item
                  onClick={() => this.handlePublicEnv(null)}
                  key='no-environment'
                >
                  No Environment
                </Dropdown.Item>
                {Object.keys(this.props.environment.environments).map(
                  (environmentId) => (
                    <Dropdown.Item
                      onClick={() => this.handlePublicEnv(environmentId)}
                      key={environmentId}
                    >
                      {this.props.environment.environments[environmentId].name}
                    </Dropdown.Item>
                  )
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )
      } else {
        return <div />
      }
    } else {
      if (isDashboardRoute(this.props)) {
        return (
          <div className='environment-container'>
            {(this.state.environmentFormName === 'Add new Environment' ||
              this.state.environmentFormName === 'Edit Environment') &&
              environmentsService.showEnvironmentForm(
                this.props,
                this.handleEnvironmentModal.bind(this),
                this.state.environmentFormName,
                this.state.environmentToBeEdited
              )}
            {this.state.environmentFormName === 'Environment modal' && (
              <EnvironmentModal
                {...this.props}
                show
                open_delete_environment_modal={this.openDeleteEnvironmentModal.bind(
                  this
                )}
                close_delete_environment_modal={this.closeDeleteEnvironmentModal.bind(
                  this
                )}
                onHide={() => this.handleEnvironmentModal()}
                handle_environment_modal={this.handleEnvironmentModal.bind(
                  this
                )}
              />
            )}
            <div>
              {this.state.showDeleteModal &&
                environmentsService.showDeleteEnvironmentModal(
                  this.props,
                  this.closeDeleteEnvironmentModal.bind(this),
                  'Delete Environment',
                  'Are you sure you wish to delete this environment?',
                  this.state.selectedEnvironment
                )}
            </div>
            {isDashboardRoute(this.props) && (
              <div className='environment-buttons'>
                <button
                  className='btn btn-default'
                  onClick={() =>
                    this.handleEnvironmentModal('Environment modal')}
                >
                  <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M9 3.75V14.25' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                    <path d='M3.75 9H14.25' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                  </svg>

                </button>
              </div>
            )}

            {isDashboardRoute(this.props) && (
              <div className='environment-buttons addEniButton'>
                <Dropdown className='float-right'>
                  <Dropdown.Toggle
                    bsPrefix='dropdown'
                    variant='default'
                    id='dropdown-basic'
                    disabled={!env}
                  >
                    {env ? <img src={eyeIcon} alt='eyeIcon' /> : <img src={eyeDisabledIcon} alt='eyeDisabledIcon' />}
                  </Dropdown.Toggle>
                  {env && (
                    <Dropdown.Menu alignRight className='custom-env-menu'>
                      {Object.keys(env.variables).length > 0 ? this.renderEnvironment(env) : this.renderEnvWithoutVariables(env)}
                    </Dropdown.Menu>
                  )}
                </Dropdown>
              </div>
            )}

            {
              isDashboardRoute(this.props) && (
                <div className='select-environment-dropdown'>
                  <Dropdown className='float-right'>
                    <Dropdown.Toggle variant='default' id='dropdown-basic'>
                      {
                        this.props.environment.environments[
                          this.props.environment.currentEnvironmentId
                        ]
                          ? this.props.environment.environments[
                              this.props.environment.currentEnvironmentId
                            ].name
                          : 'No Environment'
                      }
                    </Dropdown.Toggle>
                    <Dropdown.Menu alignRight>
                      <button
                        className='dropdown-item addEnv'
                        onClick={() =>
                          this.handleEnvironmentModal('Add new Environment')}
                      >
                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path d='M9 3.75V14.25' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                          <path d='M3.75 9H14.25' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        </svg>  Add Environment
                      </button>
                      <Dropdown.Item
                        onClick={() => this.handleEnv(null)}
                        key='no-environment'
                      >
                        No Environment
                      </Dropdown.Item>
                      {
                        Object.keys(this.props.environment.environments).map(
                          (environmentId) => (
                            <Dropdown.Item
                              onClick={() => this.handleEnv(environmentId)}
                              key={environmentId}
                            >
                              {
                                this.props.environment.environments[environmentId]
                                  .name
                              }
                            </Dropdown.Item>
                          )
                        )
                      }
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              )
            }
          </div>
        )
      }
      if (!isDashboardRoute(this.props)) {
        if (
          env === undefined &&
          this.state.publicCollectionEnvironmentId != null
        ) {
          env = this.state.originalEnvironmentReplica
        }
        return (
          <div className='environment-container'>
            {this.state.publicCollectionEnvironmentId !== null &&
              this.state.originalEnvironmentReplica !== undefined &&
              env !== undefined && (
                <div className='environment-buttons'>
                  <Dropdown className='float-right'>
                    <Dropdown.Toggle
                      bsPrefix='dropdown'
                      variant='default'
                      id='dropdown-basic'
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M0.75 9C0.75 9 3.75 3 9 3C14.25 3 17.25 9 17.25 9C17.25 9 14.25 15 9 15C3.75 15 0.75 9 0.75 9Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /> <path d='M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg>

                    </Dropdown.Toggle>

                    <Dropdown.Menu alignRight className='custom-env-menu'>
                      <Dropdown.Item>
                        {env ? env.name : 'No Environment Selected'}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <div>
                        {' '}
                        <p className='custom-middle-pane'>VARIABLE</p>
                        <p className='custom-right-box'>DEFAULT VALUE</p>
                        {/* <p className="custom-right-pane">CURRENT VALUE</p> */}
                      </div>
                      {env &&
                        Object.keys(env.variables).map((v) => (
                          <div key={v}>
                            <p className='custom-middle-box'>{v}</p>
                            <p className='custom-right-box'>
                              {env.variables[v].initialValue || 'None'}
                            </p>
                            {/* <p className="custom-right-box">
                              {env.variables[v].currentValue || "None"}
                            </p> */}
                          </div>
                        ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
            )}
            {
              this.state.originalEnvironmentReplica !== undefined && (
                <div className='select-environment-dropdown'>
                  <Dropdown className='float-right'>
                    <Dropdown.Toggle variant='default' id='dropdown-basic'>
                      {this.state.originalEnvironmentReplica !== undefined
                        ? this.state.originalEnvironmentReplica.name
                        : 'No Environment'}
                    </Dropdown.Toggle>
                  </Dropdown>
                </div>
              )
            }
          </div>
        )
      } else {
        return <div />
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Environments)
