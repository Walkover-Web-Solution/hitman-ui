import React, { Component } from "react";
import { Table } from "react-bootstrap";

class Param extends Component {
  state = {
    params: {},
    key: ""
  };

  handleChange = e => {
    let { params } = this.state;
    let { key } = this.state;
    // let name = e.currentTarget.name;
    // console.log(name);
    if (e.currentTarget.name == "key") {
      console.log("key");

      key = e.currentTarget.value;
      this.setState({ key });
      params[e.currentTarget.value] = {
        key: e.currentTarget.value,
        value: "",
        description: ""
      };
    }
    if (e.currentTarget.name == "Value") {
      console.log("Value");

      params[key].value = e.currentTarget.value;
    }
    if (e.currentTarget.name == "Description") {
      console.log("Description");

      params[key].description = e.currentTarget.value;
    }
    console.log("params", params);
    // const originalVariableNames = [...this.state.originalVariableNames];
    // const updatedVariableNames = [...this.state.updatedVariableNames];
    // if (name[1] === "name") {
    //   updatedVariableNames[name[0]] = e.currentTarget.value;
    //   this.setState({ updatedVariableNames });
    // } else {
    //   var environment = { ...this.state.environment };
    //   environment.variables[originalVariableNames[name[0]]][name[1]] =
    //     e.currentTarget.value;
    //   this.setState({ environment });
  };

  render() {
    return (
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>KEY</th>
            <th>VALUE</th>
            <th>DESCRIPTION</th>
          </tr>
        </thead>

        <tbody>
          {/* {this.state.updatedVariableNames.map((variable, index) =>
            variable !== "deleted" ? ( */}
          {/* <tr key={index}> */}
          <tr>
            <td>
              <input
                name={"key"}
                // value={variable}
                onChange={this.handleChange}
                type={"text"}
                style={{ border: "none" }}
                className="form-control"
              />
            </td>
            <td>
              {" "}
              <input
                name={"Value"}
                // value={
                //   this.state.environment.variables[
                //     this.state.originalVariableNames[index]
                //   ].initialValue
                // }
                onChange={this.handleChange}
                type={"text"}
                className="form-control"
                style={{ border: "none" }}
              />
            </td>
            <td>
              {" "}
              <input
                name={"Description"}
                // value={
                //   this.state.environment.variables[
                //     this.state.originalVariableNames[index]
                //   ].currentValue
                // }
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
                // onClick={() => this.handleDelete(index)}
              >
                x{" "}
              </button>
            </td>
          </tr>
          {/* ) : null )} */}
          <tr>
            <td> </td>
            <td>
              {" "}
              <button
                type="button"
                class="btn btn-link btn-sm btn-block"
                // onClick={() => this.handleAdd()}
              >
                + New Param
              </button>
            </td>
            <td> </td>
            <td> </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default Param;
