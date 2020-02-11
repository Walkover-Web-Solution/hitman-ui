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
    environments: {},
    environmentId: null
  }

  async componentDidMount () {
    const { data: environments } = await environmentService.getEnvironments()
    this.setState({ environments })
    const environmentId = this.props.location.pathname.split('/')[3]
    if (this.props.location.pathname.split('/')[4] === 'variables') {
      this.handleEnv(environmentId)
    }
  }

  handleEnv (environmentId) {
    this.setState({ environmentId })
  }

  async handleAdd (newEnvironment) {
    newEnvironment.requestId = shortId.generate()
    const requestId = newEnvironment.requestId
    const originalEnvironment = jQuery.extend(true, {}, this.state.environment)
    const environments = { ...this.state.environments }
    environments[requestId] = newEnvironment
    this.setState({ environments })
    try {
      const { data: environment } = await environmentService.saveEnvironment(
        newEnvironment
      )
      environments[environment.id] = environment
      delete environments[requestId]
      this.setState({ environments })
    } catch (ex) {
      toast.error(ex.response.data)
      this.setState({ environment: originalEnvironment })
    }
  }

  async handleUpdateEnvironment (updatedEnvironment) {
    if (
      JSON.stringify(this.state.environments[this.state.environmentId]) !==
      JSON.stringify(updatedEnvironment)
    ) {
      const originalEnvironment = jQuery.extend(
        true,
        {},
        this.state.environment
      )
      const environments = { ...this.state.environments }
      environments[updatedEnvironment.id] = updatedEnvironment
      this.setState({ environments })
      try {
        const body = { ...updatedEnvironment }
        delete body.id
        const {
          data: environment
        } = await environmentService.updateEnvironment(
          updatedEnvironment.id,
          body
        )
        environments[updatedEnvironment.id] = environment
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

    if (this.props.location.newEnvironment) {
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
                show={this.state.environmentId}
                onHide={() => {}}
                environment={jQuery.extend(true, {}, this.state.environment)}
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
              {this.state.environments[this.state.environmentId] &&
                this.state.environments[this.state.environmentId].name}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <Dropdown.Item>
                <Link to='/dashboard/environments/new'>+ Add Environment</Link>
              </Dropdown.Item>

              {Object.keys(this.state.environments).map(environmentId => (
                <Dropdown.Item
                  onClick={() => this.handleEnv(environmentId)}
                  key={environmentId}
                >
                  {this.state.environments[environmentId].name}
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

        {this.state.environmentId ? (
          <Link
            to={`/dashboard/environments/${this.state.environmentId}/variables`}
            style={{ float: 'right' }}
          >
            Environment Variables
          </Link>
        ) : null}
      </div>
    )
  }
}

export default Environments
