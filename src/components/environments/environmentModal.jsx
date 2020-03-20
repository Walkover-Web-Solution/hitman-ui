import React, { Component } from "react";
import { ListGroup, Modal } from "react-bootstrap";
import environmentsApiService from "./environmentsApiService";

class EnvironmentModal extends Component {
  state = {
    environments: {}
  };

  async componentDidMount() {
    let environments = {};
    if (Object.keys(this.props.environment.environments).length) {
      environments = { ...this.props.environment.environments };
    } else {
      const { data } = await environmentsApiService.getEnvironments();
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
      await environmentsApiService.updateEnvironment(
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
                <div>
                  <ListGroup.Item
                    style={{ width: "95%", float: "left" }}
                    key={environmentId}
                    onClick={() =>
                      this.handleEdit(
                        this.props.environment.environments[environmentId]
                      )
                    }
                  >
                    {this.props.environment.environments[environmentId].name}
                  </ListGroup.Item>
                  <button
                    className="btn btn-default"
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
                    style={{ float: "right" }}
                  >
                    X
                  </button>
                </div>
              )
            )}
          </ListGroup>
          <br />
          <button onClick={() => this.handleCancel(this.props)}>Cancel</button>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EnvironmentModal;
