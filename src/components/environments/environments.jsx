import React, { Component } from "react"
import { Dropdown } from "react-bootstrap"
import { connect } from "react-redux"
import shortId from "shortid"
import EnvironmentModal from "./environmentModal"
import "./environments.scss"
import environmentsService from "./environmentsService.js"
import { isDashboardRoute } from "../common/utility"
import collectionsApiService from "../collections/collectionsApiService"
import { addEnvironment, deleteEnvironment, fetchEnvironments, fetchEnvironmentsFromLocalStorage, setEnvironmentId, updateEnvironment } from "./redux/environmentsActions"
import { ReactComponent as EyeIcon } from "../../assets/icons/eye.svg"
import { ReactComponent as EyeDisabledIcon } from "../../assets/icons/eyeDisabled.svg"
import { ReactComponent as NoEnvVariablesImage } from "../../assets/icons/noEnvVariables.svg"
import { onToggle } from "../common/redux/toggleResponse/toggleResponseActions"
import IconButton from "../common/iconButton"
import { IoIosArrowDown } from "react-icons/io"
import ImportEnvironmentModal from "./ImportEnvironmentModal"

const mapStateToProps = (state) => {
  return {
    environment: state.environment,
    responseView: state.responseView,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_environments: () => dispatch(fetchEnvironments()),
    fetch_environments_from_local: () => dispatch(fetchEnvironmentsFromLocalStorage()),
    add_environment: (newEnvironment) => dispatch(addEnvironment(newEnvironment)),
    update_environment: (editedEnvironment) => dispatch(updateEnvironment(editedEnvironment)),
    delete_environment: (deletedEnvironment) => dispatch(deleteEnvironment(deletedEnvironment)),
    set_environment_id: (environmentId) => dispatch(setEnvironmentId(environmentId)),
    set_response_view: (view) => dispatch(onToggle(view)),
  }
}

class Environments extends Component {
  state = {
    currentEnvironmentId: null,
    environmentFormName: null,
    showEnvironmentForm: false,
    showEnvironmentModal: false,
    environmentToBeEdited: {},
    publicEnvironmentName: "Select Environment",
    showImportModal: false,
  }

  async componentDidMount() {
    if (!navigator.onLine) {
      this.props.fetch_environments_from_local()
    } else {
      this.props.fetch_environments()
    }
    const currentEnvironmentId = localStorage.getItem("currentEnvironmentId")
    this.handleEnv(currentEnvironmentId)
    if (!isDashboardRoute(this.props, true)) {
      const collectionIdentifier = this.props.location.pathname.split("/")[2]
      this.fetchCollection(collectionIdentifier)
    }
  }

  handleEnvironmentModal(environmentFormName, environmentToBeEdited) {
    this.setState({
      environmentFormName,
      environmentToBeEdited,
    })
  }

  async handleEnv(environmentId) {
    this.props.set_environment_id(environmentId)
    this.setState({ currentEnvironmentId: environmentId })
    localStorage.setItem("currentEnvironmentId", environmentId)
  }

  async handlePublicEnv(environmentId) {
    if (environmentId != null) {
      this.setState({
        publicEnvironmentName: this.props.environment.environments[environmentId].name,
      })
      this.props.history.push({
        Environment: "setCollectionEnvironment",
        selectedPublicEnvironment: this.props.environment.environments[environmentId],
      })
    } else {
      this.setState({
        publicEnvironmentName: "No Environment",
      })
      this.props.history.push({
        Environment: "setCollectionEnvironment",
        selectedPublicEnvironment: null,
      })
    }
  }

  async handleAdd(newEnvironment) {
    newEnvironment.requestId = shortId.generate()
    this.props.add_environment(newEnvironment)
  }

  openDeleteEnvironmentModal(environmentId) {
    this.setState({
      showDeleteModal: true,
      selectedEnvironment: {
        ...this.props.environment.environments[environmentId],
      },
    })
  }

  closeDeleteEnvironmentModal() {
    this.setState({ showDeleteModal: false })
  }

  async fetchCollection(collectionId) {
    const collection = await collectionsApiService.getCollection(collectionId)
    if (collection.data.environment != null) {
      this.setState({
        publicCollectionEnvironmentId: collection.data.environment.id,
        originalEnvironmentReplica: collection.data.environment,
      })
    }
  }

  renderEnvWithoutVariables(env) {
    return (
      <div className='px-3 py-2 noEnviWrapper'>
        <h4>{env.name}</h4>
        <div className='text-center mt-5 mb-2 '>
          <NoEnvVariablesImage />
        </div>
        <div className='text-center'>
          <h5>Sorry! There are NO variables</h5>
          <p className='greyWrapper pb-3'>You can add or edit here</p>
          <button
            className='btn btn-primary'
            onClick={() => {
              this.handleEnvironmentModal("Edit Environment", env)
            }}
          >
            Go To Environment
          </button>
        </div>
      </div>
    )
  }

  render() {
    let env = isDashboardRoute(this.props) ? this.props.environment.environments[this.props.environment.currentEnvironmentId] : this.state.publicCollectionEnvironmentId != null ? this.props.environment.environments[this.state.publicCollectionEnvironmentId] : null
    if (isDashboardRoute(this.props) && this.props.location.Environment === "setCollectionEnvironment" && !this.props.location.dashboardEnvironment) {
      if (!this.props.location.publishedCollectionEnv) {
        return (
          <div className='select-environment-dropdown'>
            <Dropdown className='float-right'>
              <Dropdown.Toggle variant='default' id='dropdown-basic'>
                {this.props.location.privateCollectionEnv ? "Select Environment" : this.state.publicEnvironmentName}
              </Dropdown.Toggle>

              <Dropdown.Menu alignRight>
                <Dropdown.Item onClick={() => this.handlePublicEnv(null)} key='no-environment'>
                  No Environment
                </Dropdown.Item>
                {Object.keys(this.props.environment.environments).map((environmentId) => (
                  <Dropdown.Item onClick={() => this.handlePublicEnv(environmentId)} key={environmentId}>
                    {this.props.environment.environments[environmentId].name}
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
      if (isDashboardRoute(this.props)) {
        return (
          <div className='environment-container d-flex align-items-center transition'>
            {(this.state.environmentFormName === "Add new Environment" || this.state.environmentFormName === "Edit Environment") && environmentsService.showEnvironmentForm(this.props, this.handleEnvironmentModal.bind(this), this.state.environmentFormName, this.state.environmentToBeEdited)}
            {this.state.environmentFormName === "Environment modal" && <EnvironmentModal {...this.props} show open_delete_environment_modal={this.openDeleteEnvironmentModal.bind(this)} close_delete_environment_modal={this.closeDeleteEnvironmentModal.bind(this)} onHide={() => this.handleEnvironmentModal()} handle_environment_modal={this.handleEnvironmentModal.bind(this)} />}
            <div>{this.state.showDeleteModal && environmentsService.showDeleteEnvironmentModal(this.props, this.closeDeleteEnvironmentModal.bind(this), "Delete Environment", "Are you sure you wish to delete this environment?", this.state.selectedEnvironment)}</div>

            {isDashboardRoute(this.props) && (
              <div onClick={() => (env ? this.handleEnvironmentModal("Edit Environment", this.props.environment.environments[this.props.environment.currentEnvironmentId]) : null)} className={`environment-buttons addEniButton ${env ? "hover" : ""}`}>
                <IconButton>{env ? <EyeIcon className='cursor-pointer m-1' /> : <EyeDisabledIcon className='m-1' />}</IconButton>
              </div>
            )}

            {isDashboardRoute(this.props) && (
              <>
                <div className='select-environment-dropdown border-radius-right-none'>
                  <Dropdown className=''>
                    <Dropdown.Toggle variant='default' id='dropdown-basic'>
                      <span className='truncate'>{this.props.environment.environments[this.props.environment.currentEnvironmentId] ? this.props.environment.environments[this.props.environment.currentEnvironmentId].name : "No Environment"}</span>
                      <IconButton>
                        <IoIosArrowDown className='m-1' />
                      </IconButton>
                    </Dropdown.Toggle>
                    <Dropdown.Menu alignRight>
                      <Dropdown.Item onClick={() => this.handleEnv(null)} key='no-environment'>
                        No Environment
                      </Dropdown.Item>
                      {Object.keys(this.props.environment.environments).map((environmentId) => (
                        <Dropdown.Item onClick={() => this.handleEnv(environmentId)} key={environmentId}>
                          {this.props.environment.environments[environmentId].name}
                        </Dropdown.Item>
                      ))}
                      <Dropdown.Divider />
                      <Dropdown.Item className='dropdown-item' onClick={() => this.handleEnvironmentModal("Add new Environment")}>
                        Add Environment
                      </Dropdown.Item>
                      <Dropdown.Item className='dropdown-item' onClick={() => this.setState({ showImportModal: true })}>
                        Import Environment
                      </Dropdown.Item>
                      <Dropdown.Item className='dropdown-item' onClick={() => this.handleEnvironmentModal("Environment modal")}>
                        Manage Environment
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </>
            )}

            <ImportEnvironmentModal show={this.state.showImportModal} onClose={() => this.setState({ showImportModal: false })} />
          </div>
        )
      }
      if (!isDashboardRoute(this.props)) {
        if (env === undefined && this.state.publicCollectionEnvironmentId != null) {
          env = this.state.originalEnvironmentReplica
        }
        return (
          <div className='environment-container'>
            {this.state.publicCollectionEnvironmentId !== null && this.state.originalEnvironmentReplica !== undefined && env !== undefined && (
              <div className='environment-buttons'>
                <Dropdown className='float-right'>
                  <Dropdown.Toggle bsPrefix='dropdown' variant='default' id='dropdown-basic'>
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M0.75 9C0.75 9 3.75 3 9 3C14.25 3 17.25 9 17.25 9C17.25 9 14.25 15 9 15C3.75 15 0.75 9 0.75 9Z' stroke='#828282' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />{" "}
                      <path d='M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z' stroke='#828282' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu alignRight className='custom-env-menu'>
                    <Dropdown.Item>{env ? env.name : "No Environment Selected"}</Dropdown.Item>
                    <Dropdown.Divider />
                    <div>
                      {" "}
                      <p className='custom-middle-pane'>VARIABLE</p>
                      <p className='custom-right-box'>DEFAULT VALUE</p>
                    </div>
                    {env &&
                      Object.keys(env.variables).map((v) => (
                        <div key={v}>
                          <p className='custom-middle-box'>{v}</p>
                          <p className='custom-right-box'>{env.variables[v].initialValue || "None"}</p>
                        </div>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
            {this.state.originalEnvironmentReplica !== undefined && (
              <div className='select-environment-dropdown'>
                <Dropdown className='float-right'>
                  <Dropdown.Toggle variant='default' id='dropdown-basic'>
                    {this.state.originalEnvironmentReplica !== undefined ? this.state.originalEnvironmentReplica.name : "No Environment"}
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
}

export default connect(mapStateToProps, mapDispatchToProps)(Environments)
