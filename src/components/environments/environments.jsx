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
                  <i className='fas fa-cog' />
                </button>
              </div>
            )}

            {isDashboardRoute(this.props) && (
              <div className='environment-buttons'>
                <Dropdown className='float-right'>
                  <Dropdown.Toggle
                    bsPrefix='dropdown'
                    variant='default'
                    id='dropdown-basic'
                  >
                    <i className='fas fa-eye' />
                  </Dropdown.Toggle>

                  <Dropdown.Menu alignRight className='custom-env-menu'>
                    <Dropdown.Item>
                      {env ? env.name : 'No Environment Selected'}

                      {env
                        ? (
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
                          )
                        : isDashboardRoute(this.props)
                          ? (
                            <button
                              className='btn btn-default float-right p-0'
                              onClick={() =>
                                this.handleEnvironmentModal('Add new Environment')}
                            >
                              Add
                            </button>
                            )
                          : null}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <div>
                      {' '}
                      <p className='custom-left-pane'>VARIABLE</p>
                      <p className='custom-middle-pane'>INITIAL VALUE</p>
                      <p className='custom-right-pane'>CURRENT VALUE</p>
                    </div>
                    {env &&
                      Object.keys(env.variables).map((v) => (
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
                  </Dropdown.Menu>
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
                      <button
                        className='dropdown-item addEnv'
                        onClick={() =>
                          this.handleEnvironmentModal('Add new Environment')}
                      >
                        + Add Environment
                      </button>
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
                      <i className='fas fa-eye' />
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
