import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Route, Switch, Link } from 'react-router-dom'
import environmentService from '../services/environmentService'
import EnvironmentModal from './environmentModal'
import EnvironmentVariables from './environmentVariables'
import { toast } from 'react-toastify'
import jQuery from 'jquery'
import shortId from 'shortid'

class Environments extends Component {
  state = {
    environments: [],
    environment: { id: null, name: 'No Environment' }
  }

  async componentDidMount () {
    const { data: environments } = await environmentService.getEnvironments()
    this.setState({ environments })
    const environmentId = this.props.location.pathname.split('/')[3]
    if (this.props.location.pathname.split('/')[4] == 'variables') {
      const index = this.state.environments.findIndex(
        e => e.id === environmentId
      )
      this.handleEnv(this.state.environments[index])
    }
  }

  handleEnv (environment) {
    this.setState({ environment: environment })
  }

  handleEdit (environment) {}

  async handleAdd (newEnvironment) {
    newEnvironment.requestId = shortId.generate()
    const originalEnvironment = jQuery.extend(true, [], this.state.environment)
    const environments = [...this.state.environments, newEnvironment]
    this.setState({ environments })
    try {
      const { data: environment } = await environmentService.saveEnvironment(
        newEnvironment
      )
      const index = environments.findIndex(
        e => e.requestId === newEnvironment.requestId
      )
      environments[index] = environment
      this.setState({ environments })
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ environment: originalEnvironment })
    }
    // const environments = [...this.state.environments, environment]
    // this.setState({ environments })
    // await environmentService.saveEnvironment(environment)
  }

  async handleUpdateEnvironment (updatedEnvironment) {
    if (
      JSON.stringify(this.state.environment) !==
      JSON.stringify(updatedEnvironment)
    ) {
      const originalEnvironment = jQuery.extend(
        true,
        [],
        this.state.environment
      )
      const environments = [...this.state.environments]
      const index = environments.findIndex(e => e.id === updatedEnvironment.id)
      environments[index] = updatedEnvironment
      this.setState({ environments, environment: updatedEnvironment })
      try {
        const body = { ...updatedEnvironment }
        delete body.id
        const {
          data: environment
        } = await environmentService.updateEnvironment(
          updatedEnvironment.id,
          body
        )
        const index = environments.findIndex(
          e => e.id === updatedEnvironment.id
        )
        environments[index] = environment
        this.setState({ environments })
      } catch (ex) {
        toast.error(ex.response.data)
        this.setState({ environment: originalEnvironment })
      }
    }
  }

  render () {
    if (this.props.location.updatedEnvironment) {
      const { updatedEnvironment } = this.props.location
      this.props.history.replace({ updatedEnvironment: null })
      this.handleUpdateEnvironment(updatedEnvironment)
    }
    if (this.props.location.updatedEnvironments) {
      // const { updatedVariables } = this.props.location
      // this.props.history.replace({ updatedVariables: null })
      // this.handleUpdateVariables(updatedVariables)
    }
    if (this.props.location.deletedEnvironment) {
      // const { environments } = this.props.location
      // this.props.history.replace({ environments: null })
      // this.setState({ environments })
    }

    if (this.props.location.newEnvironment) {
      console.log(this.props.location.newEnvironment)
      const { newEnvironment } = this.props.location
      this.props.history.replace({ newEnvironment: null })
      this.handleAdd(newEnvironment)
    }
    return (
      <div>
        <div>
          <Route
            path='/dashboard/environments/:environmentId/variables'
            render={props => (
              <EnvironmentVariables
                {...props}
                show={this.state.environment.id}
                onHide={() => {}}
                environment={jQuery.extend(true, [], this.state.environment)}
                title='Environment'
              />
            )}
          />
          <Switch>
            <Route
              path='/dashboard/environments/:environmentId/edit'
              render={props => (
                <EnvironmentVariables
                  {...props}
                  show={true}
                  onHide={() => {}}
                  title='Edit Environment'
                />
              )}
            />
            <Route
              path='/dashboard/environments/manage'
              render={props => (
                <EnvironmentModal
                  {...props}
                  show={true}
                  onHide={() => {}}
                  environments={this.state.environments}
                />
              )}
            />
            <Route
              path='/dashboard/environments/new'
              render={props => (
                <EnvironmentVariables
                  {...props}
                  show={true}
                  onHide={() => {}}
                  title='Add new Environment'
                />
              )}
            />
          </Switch>
        </div>
        <div className='Environment Dropdown'>
          <Dropdown className='float-right'>
            <Dropdown.Toggle variant='default' id='dropdown-basic'>
              {this.state.environment.name}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <Dropdown.Item>
                <Link to='/dashboard/environments/new'>+ Add Environment</Link>
              </Dropdown.Item>

              {this.state.environments.map(environment => (
                <Dropdown.Item
                  onClick={() => this.handleEnv(environment)}
                  key={environment.id}
                >
                  {environment.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div style={{ textAlign: 'left' }}>
          <button
            type='button'
            className='btn btn-link btn-sm btn-block'
          ></button>
          <Link to='/dashboard/environments/manage'>Manage Environments</Link>
        </div>

        {this.state.environment.id ? (
          <Link
            to={`/dashboard/environments/${this.state.environment.id}/variables`}
            style={{ float: 'right' }}
          >
            Environment Variables
          </Link>
        ) : null}

        <div style={{ textAlign: 'center' }}>
          <h3>{this.state.environment.name}</h3>
        </div>
      </div>
    )
  }
}

export default Environments
