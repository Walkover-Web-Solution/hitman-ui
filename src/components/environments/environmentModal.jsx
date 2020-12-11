import React, { Component } from 'react'
import { ListGroup, Modal } from 'react-bootstrap'
import environmentsApiService from './environmentsApiService'
import './environments.scss'

class EnvironmentModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      environments: {}
    }
  }

  async componentDidMount () {
    let environments = {}
    if (Object.keys(this.props.environment.environments).length) {
      environments = { ...this.props.environment.environments }
    } else {
      const { data } = await environmentsApiService.getEnvironments()
      environments = data
    }
    this.setState({ environments })
    if (this.props.location.editedEnvironment) {
      const {
        environmentid: environmentId,
        editedEnvironment
      } = this.props.location
      this.props.history.replace({ editedEnvironment: null })
      environments = [
        ...environments.filter((env) => env.id !== environmentId),
        { id: environmentId, ...editedEnvironment }
      ]
      this.setState({ environments })
      await environmentsApiService.updateEnvironment(
        environmentId,
        editedEnvironment
      )
    }
  }

  async handleDelete (environment) {
    this.props.delete_environment(environment)
  }

  handleEdit (environment) {
    this.props.handle_environment_modal('Edit Environment', environment)
  }

  handleCancel (props) {
    this.props.onHide()
  }

  render () {
    return (
      <Modal
        {...this.props}
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            Manage Environments
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup className='custom-environment-list-container'>
            {
              Object.keys(this.props.environment.environments).map(
                (environmentId) =>
                  (
                    <div key={environmentId}>
                      <div className='mb-2'>
                        <ListGroup.Item
                          style={{ width: '98%', float: 'left' }}
                          key={environmentId}
                          onClick={() =>
                            this.handleEdit(
                              this.props.environment.environments[environmentId]
                            )}
                        >
                          {this.props.environment.environments[environmentId].name}
                        </ListGroup.Item>
                        <div className='btn-group'>
                          <button
                            className='btn '
                            data-toggle='dropdown'
                            aria-haspopup='true'
                            aria-expanded='false'
                          >
                            <i className='fas fa-ellipsis-v' />
                          </button>
                          <div className='dropdown-menu dropdown-menu-right'>
                            <button
                              className='dropdown-item'
                              onClick={() => {
                                this.props.onHide()
                                this.props.open_delete_environment_modal(
                                  environmentId
                                )
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  )
              )
            }
          </ListGroup>

          <div>
            <div className='custom-button-wrapper text-right mt-3'>
              <button
                className='btn btn-secondary outline btn-lg'
                onClick={() => this.handleCancel(this.props)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default EnvironmentModal
