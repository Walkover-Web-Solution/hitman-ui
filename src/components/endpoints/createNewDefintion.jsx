import jQuery from "jquery";
import React, { Component } from "react";
import { Modal, Table } from "react-bootstrap";
import { connect } from "react-redux";
import shortId from "shortid";
// import "../../styles/environmentVariables.scss";
// import { addEnvironment, updateEnvironment } from "./redux/environmentsActions";
// import "./environments.scss";

class CreateNewDefinition extends Component {
  state = {
    objectName: "",
    basicTypes: [
      "String",
      "Integer",
      "Long",
      "Double",
      "Boolean",
      "Float",
      "Object",
      "Json",
    ],
    dateTypes: ["YYYY-MM-DD", "DateTime", "TimeStamp"],
    arrayTypes: [
      "Array of String",
      "Array of Integer",
      "Array of Long",
      "Array of Double",
      "Array of Boolean",
      "Array of Float",
      "Array of YYYY-MM-DD",
      "Array of DateTime",
      "Array of TimeStamp",
      "Array of Object",
    ],
    error: "",
    updatedBodyParams: [],
  };

  componentDidMount() {
    if (this.props.title === "Add new Object Definition") return;
    const { object_definition, edited_object_definition } = this.props;
    let updatedBodyParams = object_definition[edited_object_definition];
    console.log(updatedBodyParams, edited_object_definition);
    this.setState({ objectName: edited_object_definition, updatedBodyParams });
  }
  handleAdd() {
    let data = {
      name: "",
      dataType: "String",
      defaultValue: "",
    };
    let updatedBodyParams = [...this.state.updatedBodyParams, data];
    this.setState({ updatedBodyParams });
    // this.props.set_body_description(updatedBodyParams);
  }

  handleDelete(index) {
    const updatedBodyParams = [...this.state.updatedBodyParams];
    updatedBodyParams.splice(index, 1);
    this.setState({ updatedBodyParams });
    // this.props.set_body_description(updatedBodyParams);
  }

  handleSubmit = (e) => {
    e.preventDefault();

    if (this.state.objectName.trim().length === 0) {
      const error = "Object name cannot be empty";
      console.log(error);
      this.setState({ error });
    } else {
      const error = "";
      this.setState({ error });
      this.doSubmit();
    }
    // this.props.test();
  };
  doSubmit() {
    this.props.onHide();
    let { objectName, updatedBodyParams } = this.state;
    updatedBodyParams = updatedBodyParams.filter(
      (obj) => obj.name.trim() !== ""
    );
    console.log(updatedBodyParams);
    this.props.set_object_definition(objectName, updatedBodyParams);
  }

  handleChange = (e, index) => {
    const name = e.currentTarget.name.split(".");
    const updatedBodyParams = [...this.state.updatedBodyParams];
    console.log(name);
    let objectName = this.state.objectName;
    if (name[0] === "objectName") {
      console.log("object name");
      objectName = e.currentTarget.value;
    }
    if (name[1] === "name") {
      updatedBodyParams[index].name = e.currentTarget.value;
    }

    if (name[1] === "defaultValue") {
      updatedBodyParams[index].defaultValue = e.currentTarget.value;
    }

    if (name[1] === "dataType") {
      updatedBodyParams[index].dataType = e.target.value;
    }
    this.setState({ objectName, updatedBodyParams });

    // this.props.set_body_description(updatedBodyParams);
  };

  render() {
    // console.log(this.props.body_description);
    // console.log(this.state.updatedBodyParams);
    // console.log(this.state.objectName);
    console.log(this.state.error, this.state.objectName);

    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
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
                name={"objectName"}
                value={this.state.objectName}
                onChange={(e) => this.handleChange(e)}
                type={"text"}
                error={this.state.error === "" ? null : this.state.error}
                id="custom-environment-input"
                className="form-control"
                placeholder="Defintion Name"
              />
              {this.state.error && (
                <div className="alert alert-danger">{this.state.error}</div>
              )}
              <div className="custom-table-container">
                <Table bordered size="sm">
                  <tbody>
                    {this.state.updatedBodyParams.map((variable, index) =>
                      variable !== "deleted" ? (
                        <tr key={index}>
                          <td className="custom-td">
                            <input
                              name={index + ".name"}
                              onChange={(e) => this.handleChange(e, index)}
                              type={"text"}
                              style={{ border: "none" }}
                              className="form-control"
                              placeholder={"name"}
                              value={variable.name}
                            />
                          </td>
                          <td className="custom-td">
                            <select
                              // id="custom-select-box"
                              className="custom-td"
                              // value={this.state.selectValue}
                              value={variable.dataType}
                              onChange={(e) => this.handleChange(e, index)}
                              name={index + ".dataType"}
                            >
                              <optgroup label="Basic Type">
                                {this.state.basicTypes.map((basicType) => (
                                  <option value={basicType} key={basicType}>
                                    {basicType}
                                  </option>
                                ))}
                              </optgroup>

                              <optgroup label="Date">
                                {this.state.dateTypes.map((dateType) => (
                                  <option value={dateType} key={dateType}>
                                    {dateType}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Array">
                                {this.state.arrayTypes.map((arrayType) => (
                                  <option value={arrayType} key={arrayType}>
                                    {arrayType}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </td>
                          <td className="custom-td">
                            {" "}
                            {(variable.dataType === "Object" ||
                              variable.dataType === "Array of Object") && (
                              <div>
                                <select>
                                  {" "}
                                  <option value="" key=""></option>
                                  {Object.keys(
                                    this.props.object_definition
                                  ).map((obj) => (
                                    <option value={obj} key={obj}>
                                      {obj}
                                    </option>
                                  ))}
                                </select>
                                {/* <select>
                                  {" "}
                                  <option>fetchAllPublicEndpoints</option>{" "}
                                </select> */}
                                {/* <button
                                            onClick={() => {
                                            const formName = "manage defintion";
                                            this.setState({ formName });
                                            }}
                                        >
                                            manage definitions
                                        </button> */}
                              </div>
                            )}
                            {!(
                              variable.dataType === "Object" ||
                              variable.dataType === "Array of Object"
                            ) && (
                              <input
                                name={index + ".defaultValue"}
                                onChange={(e) => this.handleChange(e, index)}
                                type={"text"}
                                style={{ border: "none" }}
                                className="form-control"
                                value={variable.defaultValue}
                                placeholder={"Default"}
                              />
                            )}
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
                    <tr>
                      <td> </td>
                      <td>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-link btn-sm btn-block"
                          onClick={() => this.handleAdd()}
                        >
                          + New Body param
                        </button>
                      </td>
                      <td> </td>
                      <td> </td>
                    </tr>
                  </tbody>
                </Table>
                {/* <Table bordered size="sm"> */}
                {/* <thead>
                    <tr>
                      <th className="custom-td">Variable</th>
                      <th className="custom-td">Initial Value</th>
                      <th className="custom-td">Current Value</th>
                    </tr>
                  </thead> */}

                {/* <tbody>
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
                          {this.state.updatedVariableNames.length - 1 !==
                            index && (
                            <td className="custom-td">
                              <button
                                type="button"
                                className="btn btn-light btn-sm btn-block"
                                onClick={() => this.handleDelete(index)}
                              >
                                X
                              </button>
                            </td>
                          )}
                        </tr>
                      ) : null
                    )}
                  </tbody> */}
                {/* </Table> */}
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

export default CreateNewDefinition;
