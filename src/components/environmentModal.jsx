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

  componentDidMount() {
    const { environments } = this.props;
    this.setState({ environments });
  }

  async handleDelete(environmentId) {
    const environments = this.state.environments.filter(
      env => env.id !== environmentId
    );
    this.setState({ environments });
    await environmentService.deleteEnvironment(environmentId);
  }

  handleCancel(props) {
    props.history.push({
      pathname: `/collections/environments`,
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
                    <Dropdown.Item>Edit</Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => this.handleDelete(environment.id)}
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
