import React, { Component } from 'react'
import { ListGroup, Modal } from 'react-bootstrap'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import environmentsApiService from './environmentsApiService'
import './environments.scss'

class EnvironmentModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      environments: {}
    }
  }

  async componentDidMount() {
    let environments = {}
    if (Object.keys(this.props.environment.environments).length) {
      environments = { ...this.props.environment.environments }
    } else {
      const { data } = await environmentsApiService.getEnvironments()
      environments = data
    }
    this.setState({ environments })
    if (this.props.location.editedEnvironment) {
      const { environmentid: environmentId, editedEnvironment } = this.props.location
      this.props.history.replace({ editedEnvironment: null })
      environments = [...environments.filter((env) => env.id !== environmentId), { id: environmentId, ...editedEnvironment }]
      this.setState({ environments })
      await environmentsApiService.updateEnvironment(environmentId, editedEnvironment)
    }
  }

  async handleDelete(environment) {
    this.props.delete_environment(environment)
  }

  handleEdit(environment) {
    this.props.handle_environment_modal('Edit Environment', environment)
  }

  handleCancel(props) {
    this.props.onHide()
  }

  renderManageEnvironmentModal() {
    return Object.keys(this.props.environment.environments).map((environmentId) => (
      <div className='mb-2 d-flex justify-content-center' key={environmentId}>
        <ListGroup.Item
          style={{ width: '98%', float: 'left' }}
          key={environmentId}
          onClick={() => this.handleEdit(this.props.environment.environments[environmentId])}
        >
          {this.props.environment.environments[environmentId].name}
        </ListGroup.Item>
        <button
          className='btn'
          onClick={() => {
            this.props.open_delete_environment_modal(environmentId)
          }}
        >
          <DeleteIcon />
        </button>
      </div>
    ))
  }

  renderNoEnvironmentModule() {
    return (
      <div className='align-items-center'>
        <div className='text-center m-2 align-items-center'>No Environment Available</div>
        <div className='justify-content-center d-flex text-center'>
          <button className='btn btn-outline orange p-2' onClick={() => this.props.handle_environment_modal('Add new Environment')}>
            Add Environment
          </button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <Modal {...this.props} size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>Manage Environments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup className='custom-environment-list-container h-auto'>
            {Object.keys(this.props.environment.environments).length === 0
              ? this.renderNoEnvironmentModule()
              : this.renderManageEnvironmentModal()}
          </ListGroup>
          <div>
            {/* <div className='custom-button-wrapper text-right mt-3'>
              <button className='btn btn-secondary outline btn-lg' onClick={() => this.handleCancel(this.props)}>
                Cancel
              </button>
            </div> */}
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default EnvironmentModal
