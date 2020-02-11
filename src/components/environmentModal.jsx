import React, { Component } from 'react'
import { Modal, Dropdown, ListGroup } from 'react-bootstrap'
import environmentService from '../services/environmentService'
import { toast } from 'react-toastify'
import jQuery from 'jquery'
class EnvironmentModal extends Component {
  state = {
    environments: {}
  }

  async componentDidMount () {
    let environments = {}
    if (this.props.environments) {
      environments = { ...this.props.environments }
    } else {
      const { data } = await environmentService.getEnvironments()
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
        ...environments.filter(env => env.id !== environmentId),
        { id: environmentId, ...editedEnvironment }
      ]
      this.setState({ environments })
      await environmentService.updateEnvironment(
        environmentId,
        editedEnvironment
      )
    }
  }

  async handleDelete (environmentId) {
    const originalEnvironments = jQuery.extend(
      true,
      {},
      this.state.environments
    )
    const environments = { ...this.state.environments }
    delete environments[environmentId]
    this.setState({ environments })
    try {
      await environmentService.deleteEnvironment(environmentId)
    } catch (ex) {
      toast.error(ex)
      this.setState({ environments: originalEnvironments })
    }
  }

  handleEdit (environment) {
    this.props.history.push({
      pathname: `/dashboard/environments/${environment.id}/edit`,
      editEnvironment: environment
    })
  }

  handleCancel (props) {
    props.history.push({
      pathname: `/dashboard/`,
      environments: this.state.environments
    })
  }

  render () {
    return (
      <Modal
        {...this.props}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            Manage Environments
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {Object.keys(this.state.environments).map(environmentId => (
              <ListGroup.Item key={environmentId}>
                {this.state.environments[environmentId].name}
                <Dropdown className='float-right'>
                  <Dropdown.Toggle
                    variant='default'
                    id='dropdown-basic'
                  ></Dropdown.Toggle>

                  <Dropdown.Menu alignRight>
                    <Dropdown.Item
                      onClick={() =>
                        this.handleEdit(this.state.environments[environmentId])
                      }
                    >
                      Edit
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you wish to delete this environment?'
                          )
                        )
                          this.handleDelete(environmentId)
                      }}
                    >
                      delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <button onClick={() => this.handleCancel(this.props)}>Cancel</button>
        </Modal.Body>
      </Modal>
    )
  }
}

export default EnvironmentModal
