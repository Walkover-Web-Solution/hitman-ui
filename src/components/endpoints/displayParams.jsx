import React, { Component } from "react";
import { Table } from "react-bootstrap";

class ParamsComponent extends Component {
  state = {};

  handleDeleteParam(index) {
    let originalParams = this.originalParams;
    let neworiginalParams = [];
    for (let i = 0; i < originalParams.length; i++) {
      if (i === index) {
        continue;
      }
      neworiginalParams.push(this.originalParams[i]);
    }
    originalParams = neworiginalParams;
    this.props.props_from_parent("originalParams", originalParams);
  }

  async handleAddParam() {
    const len = this.originalParams.length;
    let originalParams = [...this.originalParams, len.toString()];
    originalParams[[len.toString()]] = {
      key: "",
      value: "",
      description: ""
    };
    this.originalParams = originalParams;
    this.props.props_from_parent("handleAddParam", originalParams);
  }

  handleChangeParam = e => {
    const name = e.currentTarget.name.split(".");
    const originalParams = [...this.originalParams];
    if (name[1] === "key") {
      originalParams[name[0]].key = e.currentTarget.value;
      if (originalParams[name[0]].key.length === 0) {
        this.handleDeleteParam(name[0]);
      }
    }
    if (name[1] === "value") {
      originalParams[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      originalParams[name[0]].description = e.currentTarget.value;
    }
    this.props.props_from_parent("originalParams", originalParams);
  };

  render() {
    this.originalParams = this.props.originalParams;
    return (
      <Table bordered size="sm">
        {" "}
        <thead>
          {" "}
          <tr>
            <th>KEY</th>
            <th>VALUE</th>
            <th>DESCRIPTION</th>{" "}
          </tr>{" "}
        </thead>
        <tbody>
          {this.originalParams.map((params, index) =>
            params !== "deleted" ? (
              <tr key={index}>
                <td>
                  <input
                    name={index + ".key"}
                    ref={this.paramKey}
                    value={this.originalParams[index].key}
                    onChange={this.handleChangeParam}
                    type={"text"}
                    className="form-control"
                    style={{ border: "none" }}
                  />
                </td>
                <td>
                  <input
                    name={index + ".value"}
                    value={this.originalParams[index].value}
                    onChange={this.handleChangeParam}
                    type={"text"}
                    className="form-control"
                    style={{ border: "none" }}
                  />
                </td>
                <td>
                  <input
                    name={index + ".description"}
                    value={this.originalParams[index].description}
                    onChange={this.handleChangeParam}
                    type={"text"}
                    style={{ border: "none" }}
                    className="form-control"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-light btn-sm btn-block"
                    onClick={() => this.handleDeleteParam(index)}
                  >
                    x
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
                onClick={() => this.handleAddParam()}
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

export default ParamsComponent;
