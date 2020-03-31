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
    environment: {
      name: "",
      variables: {
        BASE_URL: { intitialValue: "", finalValue: "" },
        "1": { intitialValue: "", finalValue: "" }
      }
    },
    originalVariableNames: ["BASE_URL", "1"],
    updatedVariableNames: ["BASE_URL", ""]
  };

  async componentDidMount() {
    if (this.props.title === "Add new Environment") return;
    let environment = {};
    environment = jQuery.extend(true, {}, this.props.environment);
    let originalVariableNames = Object.keys(environment.variables);
    const len = originalVariableNames.length;
    originalVariableNames.push(len.toString());
    let updatedVariableNames = [...Object.keys(environment.variables), ""];
    environment.variables[len.toString()] = {
      initialValue: "",
      currentValue: ""
    };
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
    delete environment.variables[originalVariableNames.pop()];
    updatedVariableNames.pop();
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
    const lastIndex = this.state.originalVariableNames.length - 1;

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
    if (name[0] === lastIndex.toString()) {
      this.handleAdd();
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
          <div className="custom-environment-modal-container">
            <Modal.Header
              className="custom-collection-modal-container"
              closeButton
            >
              <Modal.Title id="contained-modal-title-vcenter">
                {this.props.title}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label htmlFor="custom-environment-input">
                {this.props.title}{" "}
              </label>
              <input
                name={"name"}
                value={this.state.environment.name}
                onChange={this.handleChangeEnv}
                type={"text"}
                id="custom-environment-input"
                className="form-control"
                placeholder="Environment Name"
              />
              <div className="custom-table-container">
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th className="custom-td">Variable</th>
                      <th className="custom-td">Initial Value</th>
                      <th className="custom-td">Current Value</th>
                    </tr>
                  </thead>

                  <tbody>
                    {this.state.updatedVariableNames.map((variable, index) =>
                      variable !== "deleted" ? (
                        <tr key={index}>
                          <td className="custom-td">
                            <input
                              name={index + ".name"}
                              value={variable}
                              onChange={this.handleChange}
                              type={"text"}
                              style={{ border: "none" }}
                              className="form-control"
                            />
                          </td>
                          <td className="custom-td">
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
                          <td className="custom-td">
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
                          <td className="custom-td">
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
                  </tbody>
                </Table>
              </div>
              <hr />
              <div>
                <div className="custom-button-wrapper">
                  <button className="btn btn-default custom-environment-add-button">
                    Save
                  </button>
                  <button
                    className="btn btn-default custom-environment-cancel-button"
                    onClick={this.props.onHide}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Modal.Body>
          </div>
        </form>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(EnvironmentVariables);
