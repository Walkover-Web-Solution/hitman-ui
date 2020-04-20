import React, { Component } from "react";
import { Table } from "react-bootstrap";
import ManageDefintionForm from "./manageDefinition";
import CreateNewDefinition from "./createNewDefintion";

class BodyDescription extends Component {
  state = {
    formName: "",
    editedObjectDefinition: "",
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
  };

  handleAdd() {
    let data = {
      name: "",
      dataType: "String",
      defaultValue: "",
    };
    let updatedBodyParams = [...this.props.body_description, data];
    // this.setState({ updatedBodyParams });
    this.props.set_body_description(updatedBodyParams);
  }

  handleDelete(index) {
    const updatedBodyParams = [...this.props.body_description];
    updatedBodyParams.splice(index, 1);
    // this.setState({ updatedBodyParams });
    this.props.set_body_description(updatedBodyParams);
  }

  handleChange = (e, index, datatype) => {
    const name = e.currentTarget.name.split(".");
    const updatedBodyParams = [...this.props.body_description];

    if (name[1] === "name") {
      updatedBodyParams[index].name = e.currentTarget.value;
    }

    if (name[1] === "defaultValue" && datatype) {
      console.log(datatype, e.target.value);
      updatedBodyParams[index].defaultValue = e.target.value;
    } else if (name[1] === "defaultValue") {
      updatedBodyParams[index].defaultValue = e.currentTarget.value;
    }

    if (name[1] === "dataType") {
      updatedBodyParams[index].dataType = e.target.value;
    }
    // this.setState({ updatedBodyParams });

    this.props.set_body_description(updatedBodyParams);
  };

  closeForm(obj) {
    let formName = "";
    let editedObjectDefinition = "";
    if (obj) {
      formName = "Edit Object Definition";
      editedObjectDefinition = obj;
    }
    this.setState({ formName, editedObjectDefinition });
  }

  addDefinition() {
    console.log("addDefinition");
    const formName = "Add new Object Definition";
    this.setState({ formName });
  }

  render() {
    // console.log(this.props.body_description);
    return (
      <div>
        {this.state.formName === "manage defintion" && (
          <ManageDefintionForm
            show={true}
            {...this.props}
            onHide={this.closeForm.bind(this)}
            on_new_definition_added={this.addDefinition.bind(this)}
          />
        )}

        {this.state.formName === "Add new Object Definition" && (
          <CreateNewDefinition
            show={true}
            {...this.props}
            title={"Add new Object Definition"}
            state={this.state}
            onHide={this.closeForm.bind(this)}
          />
        )}
        {this.state.formName === "Edit Object Definition" && (
          <CreateNewDefinition
            show={true}
            {...this.props}
            edited_object_definition={this.state.editedObjectDefinition}
            title={"Edit Object Definition"}
            state={this.state}
            onHide={this.closeForm.bind(this)}
          />
        )}
        <p>BodyDescription</p>

        <Table bordered size="sm">
          <tbody>
            {this.props.body_description.map((variable, index) =>
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
                        <select
                          style={{ width: "200px" }}
                          name={index + ".defaultValue"}
                          onChange={(e) =>
                            this.handleChange(e, index, variable.dateType)
                          }
                        >
                          {" "}
                          <option value="" key=""></option>
                          {Object.keys(this.props.object_definition).map(
                            (obj) => (
                              <option value={obj} key={obj}>
                                {obj}
                              </option>
                            )
                          )}
                        </select>
                        <button
                          className="btn btn-default custom-button"
                          onClick={() => {
                            const formName = "manage defintion";
                            this.setState({ formName });
                          }}
                        >
                          manage definitions
                        </button>
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
      </div>
    );
  }
}

export default BodyDescription;
