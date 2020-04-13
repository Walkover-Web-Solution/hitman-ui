import React, { Component } from "react";
import { Table } from "react-bootstrap";

class BodyDescription extends Component {
  state = {
    updatedBodyParams: [],
    originalBodyParams: [],
    basicTypes: ["String", "Integer", "Long", "Double", "Boolean", "Float"],
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
    ],
  };

  handleAdd() {
    let data = {
      name: "",
      dataType: "String",
      defaultValue: "",
    };
    let updatedBodyParams = [...this.state.updatedBodyParams, data];
    this.setState({ updatedBodyParams });
    this.props.set_body_description(updatedBodyParams);
  }

  handleDelete(index) {
    const updatedBodyParams = [...this.state.updatedBodyParams];
    updatedBodyParams.splice(index, 1);
    this.setState({ updatedBodyParams });
    this.props.set_body_description(updatedBodyParams);
  }

  handleChange = (e, index) => {
    const name = e.currentTarget.name.split(".");
    const updatedBodyParams = [...this.state.updatedBodyParams];

    if (name[1] === "name") {
      updatedBodyParams[index].name = e.currentTarget.value;
    }

    if (name[1] === "defaultValue") {
      updatedBodyParams[index].defaultValue = e.currentTarget.value;
    }

    if (name[1] === "dataType") {
      updatedBodyParams[index].dataType = e.target.value;
    }
    this.setState({ updatedBodyParams });

    this.props.set_body_description(updatedBodyParams);
  };

  render() {
    return (
      <div>
        <p>BodyDescription</p>

        <Table bordered size="sm">
          <tbody>
            {this.state.updatedBodyParams.map((variable, index) =>
              variable !== "deleted" ? (
                <tr key={index}>
                  <td>
                    <input
                      name={index + ".name"}
                      onChange={(e) => this.handleChange(e, index)}
                      type={"text"}
                      style={{ border: "none" }}
                      className="form-control"
                      placeholder={"name"}
                    />
                  </td>
                  <td>
                    <select
                      id="custom-select-box"
                      value={this.state.selectValue}
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
                  <td>
                    {" "}
                    <input
                      name={index + ".defaultValue"}
                      onChange={(e) => this.handleChange(e, index)}
                      type={"text"}
                      style={{ border: "none" }}
                      className="form-control"
                      placeholder={"Default"}
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
