import React, { Component } from "react";
import { Modal, Dropdown, ListGroup } from "react-bootstrap";
import environmentService from "./environmentService";

class EnvironmentModal extends Component {
  state = {
    environments: {}
  };

  async componentDidMount() {
    let environments = {};
    if (Object.keys(this.props.environment.environments).length) {
      environments = { ...this.props.environment.environments };
    } else {
      const { data } = await environmentService.getEnvironments();
      environments = data;
    }
    this.setState({ environments });
    if (this.props.location.editedEnvironment) {
      const {
        environmentid: environmentId,
        editedEnvironment
      } = this.props.location;
      this.props.history.replace({ editedEnvironment: null });
      environments = [
        ...environments.filter(env => env.id !== environmentId),
        { id: environmentId, ...editedEnvironment }
      ];
      this.setState({ environments });
      await environmentService.updateEnvironment(
        environmentId,
        editedEnvironment
      );
    }
  }

  async handleDelete(environment) {
    this.props.deleteEnvironment(environment);
  }

  handleEdit(environment) {
    this.props.handle_environment_modal("Edit Environment", environment);
  }

  handleCancel(props) {
    this.props.onHide();
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Manage Environments
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {Object.keys(this.props.environment.environments).map(
              environmentId => (
                <ListGroup.Item key={environmentId}>
                  {this.props.environment.environments[environmentId].name}
                  <Dropdown className="float-right">
                    <Dropdown.Toggle
                      variant="default"
                      id="dropdown-basic"
                    ></Dropdown.Toggle>

                    <Dropdown.Menu alignRight>
                      <Dropdown.Item
                        onClick={() =>
                          this.handleEdit(
                            this.props.environment.environments[environmentId]
                          )
                        }
                      >
                        Edit
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you wish to delete this environment?"
                            )
                          )
                            this.handleDelete(
                              this.props.environment.environments[environmentId]
                            );
                        }}
                      >
                        delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ListGroup.Item>
              )
            )}
          </ListGroup>
          <button onClick={() => this.handleCancel(this.props)}>Cancel</button>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EnvironmentModal;
