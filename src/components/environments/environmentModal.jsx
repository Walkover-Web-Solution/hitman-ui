import React, { Component } from "react";
import { ListGroup, Modal } from "react-bootstrap";
import environmentsApiService from "./environmentsApiService";
import environmentsService from "./environmentsService";

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

  openDeleteModal(environmentId) {
    this.setState({
      showDeleteModal: true,
      selectedEnvironment: {
        ...this.props.environment.environments[environmentId]
      }
    });
  }

  closeDeleteEnvironmentModal() {
    this.setState({ showDeleteModal: false });
  }

  render() {
    return (
      <div>
        <div>
          {this.state.showDeleteModal &&
            environmentsService.showDeleteEnvironmentModal(
              this.props,
              this.closeDeleteEnvironmentModal.bind(this),
              "Delete Environment",
              this.state.selectedEnvironment
            )}
        </div>

        <Modal
          {...this.props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              Manage Environments
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup className="custom-environment-list-container">
              {Object.keys(this.props.environment.environments).map(
                environmentId => (
                  <div>
                    <ListGroup.Item
                      style={{ width: "93%", float: "left" }}
                      key={environmentId}
                      onClick={() =>
                        this.handleEdit(
                          this.props.environment.environments[environmentId]
                        )
                      }
                    >
                      {this.props.environment.environments[environmentId].name}
                    </ListGroup.Item>
                    <div className="btn-group">
                      <button
                        className="btn "
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="fas fa-ellipsis-h"></i>
                      </button>
                      <div className="dropdown-menu dropdown-menu-right">
                        <button
                          className="btn btn-default"
                          // onClick={() => {
                          // if (
                          //   window.confirm(
                          //     "Are you sure you wish to delete this environment?"
                          //   )
                          // )
                          //   this.handleDelete(
                          //     this.props.environment.environments[environmentId]
                          //   );

                          // }}
                          onClick={() => {
                            this.openDeleteModal(environmentId);
                          }}
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </ListGroup>

            <hr />
            <div>
              <div className="custom-button-wrapper">
                <button
                  className="btn btn-default custom-environment-cancel-button"
                  onClick={() => this.handleCancel(this.props)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default EnvironmentModal;
