import jQuery from "jquery";
import React, { Component } from "react";
import { Modal, Table } from "react-bootstrap";
import shortId from "shortid";
import "../../styles/environmentVariables.scss";
import { connect } from "react-redux";
import { addEnvironment, updateEnvironment } from "./redux/environmentsActions";

const mapDispatchToProps = dispatch => {
  return {
    addEnvironment: newEnvironment => dispatch(addEnvironment(newEnvironment)),
    updateEnvironment: editedEnvironment =>
      dispatch(updateEnvironment(editedEnvironment))
  };
};

class EnvironmentVariables extends Component {
  state = {
    environment: { name: "", variables: {} },
    originalVariableNames: [],
    updatedVariableNames: []
  };

  async componentDidMount() {
    if (this.props.title === "Add new Environment") return;
    let environment = {};
    environment = jQuery.extend(true, {}, this.props.environment);
    const originalVariableNames = Object.keys(environment.variables);
    const updatedVariableNames = Object.keys(environment.variables);
    this.setState({
      environment,
      originalVariableNames,
      updatedVariableNames
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.doSubmit();
  };

  doSubmit() {
    this.props.onHide();
    let environment = { ...this.state.environment };
    let originalVariableNames = [...this.state.originalVariableNames];
    let updatedVariableNames = [...this.state.updatedVariableNames];
    for (let i = 0; i < updatedVariableNames.length; i++) {
      if (updatedVariableNames[i] !== originalVariableNames[i]) {
        if (updatedVariableNames[i] === "deleted")
          delete environment.variables[originalVariableNames[i]];
        else {
          environment.variables[updatedVariableNames[i]] =
            environment.variables[originalVariableNames[i]];
          delete environment.variables[originalVariableNames[i]];
        }
      }
    }
    if (this.props.title === "Add new Environment") {
      this.props.onHide();
      const requestId = shortId.generate();
      this.props.addEnvironment({ ...this.state.environment, requestId });
      this.setState({
        environment: { name: "", variables: {} },
        originalVariableNames: [],
        updatedVariableNames: []
      });
    } else {
      const updatedEnvironment = { ...this.state.environment };
      const originalEnvironment = jQuery.extend(
        true,
        {},
        this.props.environment
      );
      if (
        JSON.stringify(originalEnvironment) !==
        JSON.stringify(updatedEnvironment)
      ) {
        if (updatedEnvironment.requestId) delete updatedEnvironment.requestId;
        this.props.updateEnvironment({
          ...updatedEnvironment
        });
      }
    }
  }

  handleAdd() {
    let environment = { ...this.state.environment };
    const len = this.state.originalVariableNames.length;
    let originalVariableNames = [
      ...this.state.originalVariableNames,
      len.toString()
    ];
    let updatedVariableNames = [...this.state.updatedVariableNames, ""];
    environment.variables[len.toString()] = {
      initialValue: "",
      currentValue: ""
    };
    this.setState({ environment, originalVariableNames, updatedVariableNames });
  }

  handleChangeEnv = e => {
    const environment = { ...this.state.environment };
    environment[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ environment });
  };

  handleChange = e => {
    const name = e.currentTarget.name.split(".");
    const originalVariableNames = [...this.state.originalVariableNames];
    const updatedVariableNames = [...this.state.updatedVariableNames];
    if (name[1] === "name") {
      updatedVariableNames[name[0]] = e.currentTarget.value;
      this.setState({ updatedVariableNames });
    } else {
      var environment = { ...this.state.environment };
      environment.variables[originalVariableNames[name[0]]][name[1]] =
        e.currentTarget.value;
      this.setState({ environment });
    }
  };

  handleDelete(index) {
    const updatedVariableNames = this.state.updatedVariableNames;
    updatedVariableNames[index] = "deleted";
    this.setState({ updatedVariableNames });
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <form onSubmit={this.handleSubmit}>
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              <h3>{this.props.title}</h3>
              <h5>
                <input
                  name={"name"}
                  value={this.state.environment.name}
                  onChange={this.handleChangeEnv}
                  type={"text"}
                  size="100"
                  className="form-control"
                />
              </h5>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Initial Value</th>
                  <th>Current Value</th>
                </tr>
              </thead>

              <tbody>
                {this.state.updatedVariableNames.map((variable, index) =>
                  variable !== "deleted" ? (
                    <tr key={index}>
                      <td>
                        <input
                          name={index + ".name"}
                          value={variable}
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
                          value={
                            this.state.environment.variables[
                              this.state.originalVariableNames[index]
                            ].initialValue
                          }
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
                          value={
                            this.state.environment.variables[
                              this.state.originalVariableNames[index]
                            ].currentValue
                          }
                          onChange={this.handleChange}
                          type={"text"}
                          style={{ border: "none" }}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-light btn-sm btn-block"
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
                      className="btn btn-link btn-sm btn-block"
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
            <button className="btn btn-primary">Submit</button>
            <button className="btn btn-danger" onClick={this.props.onHide}>
              Cancel
            </button>
          </Modal.Body>
        </form>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(EnvironmentVariables);
