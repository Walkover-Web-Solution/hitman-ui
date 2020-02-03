import React, { Component } from "react";
import { Modal, Dropdown, ListGroup, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Input from "./common/input";
import Form from "./common/form";
import Joi from "joi-browser";

class EnvironmentVariables extends Component {
  state = {
    variables: [],
    environment: {}
  };

  componentDidMount() {
    const { variables, environment } = this.props;
    this.setState({ variables, environment });
  }

  schema = {
    name: Joi.string(),
    host: Joi.string()
  };

  handleSubmit = e => {
    e.preventDefault();
    this.doSubmit();
  };

  doSubmit() {
    this.props.history.push({
      pathname: `/collections/environments`,
      updatedVariables: [...this.state.variables]
    });
  }

  handleAdd() {
    const variables = [
      ...this.state.variables,
      {
        id: "",
        environmentId: this.state.environment.id,
        name: "",
        initialValue: "",
        currentValue: ""
      }
    ];
    this.setState({ variables });
  }

  handleChange = e => {
    const name = e.currentTarget.name.split(".");
    const variables = [...this.state.variables];
    variables[name[0]][name[1]] = e.currentTarget.value;
    variables[name[0]].environmentId = this.state.environment.id;
    this.setState({ variables });
  };

  handleDelete(index) {
    const variables = this.state.variables;
    variables.splice(index, 1);
    this.setState({ variables });
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
            <h5>{this.state.environment.name}</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Initial Value</th>
                  <th>Current Value</th>
                </tr>
              </thead>

              <tbody>
                {" "}
                {this.state.variables.map((variable, index) =>
                  variable.environmentId === this.state.environment.id ? (
                    <tr key={index}>
                      <td>
                        <input
                          name={index + ".name"}
                          value={variable.name}
                          onChange={this.handleChange}
                          type={"text"}
                          style={{ border: "none" }}
                          className="form-control"
                        />
                      </td>
                      <td>
                        {" "}
                        <input
                          name={index + ".initialValue"}
                          value={variable.initialValue}
                          onChange={this.handleChange}
                          type={"text"}
                          className="form-control"
                          style={{ border: "none" }}
                        />
                      </td>
                      <td>
                        {" "}
                        <input
                          name={index + ".currentValue"}
                          value={variable.currentValue}
                          onChange={this.handleChange}
                          type={"text"}
                          style={{ border: "none" }}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          class="btn btn-light btn-sm btn-block"
                          onClick={() => this.handleDelete(index)}
                        >
                          x{" "}
                        </button>
                      </td>
                    </tr>
                  ) : null
                )}
                <tr>
                  <td> </td>
                  <td>
                    {" "}
                    <button
                      type="button"
                      class="btn btn-link btn-sm btn-block"
                      onClick={() => this.handleAdd()}
                    >
                      + New Variable
                    </button>
                  </td>
                  <td> </td>
                  <td> </td>
                </tr>
              </tbody>
            </Table>
            <button className="btn btn-default">Submit</button>
            <Link
              to={`/collections/environments`}
              style={{ float: "right", padding: "10px 60px 0 0" }}
            >
              Cancel
            </Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default EnvironmentVariables;
