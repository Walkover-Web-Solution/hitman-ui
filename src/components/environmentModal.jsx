import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Modal, Dropdown, ListGroup } from "react-bootstrap";
import Form from "./common/form";
import Joi from "joi-browser";
import environmentService from "../services/environmentService";
class EnvironmentModal extends Component {
  state = {
    environments: []
  };

  async componentDidMount() {
    let { environments } = this.props;
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

  async handleDelete(environmentId) {
    const environments = this.state.environments.filter(
      env => env.id !== environmentId
    );
    this.setState({ environments });
    await environmentService.deleteEnvironment(environmentId);
  }

  handleEdit(environment) {
    this.props.history.push({
      pathname: "/dashboard/environments/manage/edit",
      editEnvironment: environment
    });
  }

  handleCancel(props) {
    props.history.push({
      pathname: `/dashboard/environments`,
      environments: this.state.environments
    });
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
            {this.state.environments.map(environment => (
              <ListGroup.Item key={environment.id}>
                {environment.name}
                <Dropdown className="float-right">
                  <Dropdown.Toggle
                    variant="default"
                    id="dropdown-basic"
                  ></Dropdown.Toggle>

                  <Dropdown.Menu alignRight>
                    <Dropdown.Item onClick={() => this.handleEdit(environment)}>
                      Edit
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you wish to delete this item?"
                          )
                        )
                          this.handleDelete(environment.id);
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
    );
  }
}

export default EnvironmentModal;
