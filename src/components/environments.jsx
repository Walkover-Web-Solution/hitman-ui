import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Route, Switch, Link } from 'react-router-dom'
import EnvironmentForm from './environmentForm'
import environmentService from '../services/environmentService'
import EnvironmentModal from './environmentModal'
import EnvironmentVariables from './environmentVariables'
import variablesService from '../services/variablesService'
import jQuery from 'jquery'

class Environments extends Component {
  state = {
    environments: [],
    variables: [],
    environment: { id: 0, name: 'No Environment' }
  }

  async fetchVariables (environments) {
    let variables = []
    for (let i = 0; i < environments.length; i++) {
      const { data: variables1 } = await variablesService.getVariables(
        environments[i].id
      )
      variables = [...variables, ...variables1]
    }

    return variables
  }

  async componentDidMount () {
    const { data: environments } = await environmentService.getEnvironments()
    this.setState({ environments })
    const variables = await this.fetchVariables(environments)
    this.setState({ variables })
  }

  handleEnv (environment) {
    this.setState({ environment: environment })
  }

  handleEdit (environment) {}

  async handleAdd (environment) {
    const environments = [...this.state.environments, environment]
    this.setState({ environments })
    await environmentService.saveEnvironment(environment)
  }

  async handleUpdateVariables (updatedVariables) {
    const originalVariables = jQuery.extend(true, [], this.state.variables)
    if (
      JSON.stringify(originalVariables) !== JSON.stringify(updatedVariables)
    ) {
      var deletedIndices = []
      var updatedIndices = []
      var savedIndices = []
      var sameIndices = []
      const l1 = originalVariables.length
      const l2 = updatedVariables.length
      let j = 0

      for (let i = 0; i < l1; i++) {
        for (j = 0; j < l2; j++) {
          if (originalVariables[i].id === updatedVariables[j].id) {
            if (
              JSON.stringify(originalVariables[i]) ===
              JSON.stringify(updatedVariables[j])
            ) {
              sameIndices.push(j)
              break
            } else {
              updatedIndices.push(j)
              break
            }
          } else {
          }
        }
        if (j === l2) {
          deletedIndices.push(i)
        }
      }

      this.setState({ variables: updatedVariables })
      for (let i = 0; i < l2; i++) {
        if (updatedIndices.includes(i)) {
          const body = updatedVariables[i]
          const id = body.id
          delete body.id
          delete body.environmentId

          const data = await variablesService.updateVariable(id, body)
        } else if (sameIndices.includes(i)) {
        } else {
          const body = updatedVariables[i]
          delete body.id
          delete body.environmentId
          const data = await variablesService.saveVariable(
            this.state.environment.id,
            body
          )
        }
      }
      for (let i = 0; i < l1; i++) {
        if (deletedIndices.includes(i)) {
          const data = await variablesService.deleteVariable(
            originalVariables[i].id
          )
        }
      }
    }
  }

  render () {
    if (this.props.location.updatedVariables) {
      const { updatedVariables } = this.props.location
      this.props.history.replace({ updatedVariables: null })
      this.handleUpdateVariables(updatedVariables)
    }
    if (this.props.location.environments) {
      const { environments } = this.props.location
      this.props.history.replace({ environments: null })
      this.setState({ environments })
    }

    if (this.props.location.newEnvironment) {
      const { newEnvironment } = this.props.location
      this.props.history.replace({ newEnvironment: null })
      this.handleAdd(newEnvironment)
    }
    return (
      <div>
        <div>
          <Switch>
            <Route
              path='/dashboard/environments/variables'
              render={props => (
                <EnvironmentVariables
                  {...props}
                  show={this.state.environment.id}
                  onHide={() => {}}
                  environment={{ ...this.state.environment }}
                  variables={jQuery.extend(true, [], this.state.variables)}
                />
              )}
            />
            <Route
              path='/dashboard/environments/manage/edit'
              render={props => (
                <EnvironmentForm
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
                <EnvironmentForm
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
            to='/dashboard/environments/variables'
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
