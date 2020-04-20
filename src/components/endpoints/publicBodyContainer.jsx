import React, { Component } from "react";
import GenericTable from "./genericTable";
import "./publicEndpoint.scss";
import { toPathSchema } from "react-jsonschema-form/lib/utils";

class PublicBodyContainer extends Component {
  state = {};

  handleChangeBody(title, dataArray) {
    switch (title) {
      case "formData":
        this.props.set_body("formData", dataArray);
        break;
      case "x-www-form-urlencoded":
        this.props.set_body("urlEncoded", dataArray);
        break;
      default:
        break;
    }
  }

  handleDelete(key, index) {
    this.body[key].splice(index, 1);
    this.props.set_public_body(this.body);
  }

  handleAdd(body, key) {
    body[key].push(this.props.body_description[key].default[0]);
    this.props.set_public_body(body);
  }

  handleChange = (e) => {
    const name = e.currentTarget.name.split(".");
    const key = name[0];
    const bodyDescription = this.props.body_description;
    let body = this.body;
    if (e.target.type === "number") {
      if (bodyDescription[key].dataType === "Array of Integer") {
        body[key][name[1]] = parseInt(e.currentTarget.value);
      } else if (bodyDescription[key].dataType === "Object") {
        body[key][name[1]] = parseInt(e.currentTarget.value);
      } else if (bodyDescription[key].dataType === "Array of Objects") {
        body[key][name[1]][name[2]] = parseInt(e.currentTarget.value);
      } else if (bodyDescription[key].dataType === "Object of Objects") {
        body[key][name[1]][name[2]] = parseInt(e.currentTarget.value);
      } else {
        body[key] = parseInt(e.currentTarget.value);
      }
    } else {
      if (bodyDescription[key].dataType === "Array of String") {
        body[key][name[1]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Object") {
        body[key][name[1]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Array of Objects") {
        body[key][name[1]][name[2]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Array of Boolean") {
        body[key][name[1]] = e.currentTarget.value;
      } else if (bodyDescription[key].dataType === "Object of Objects") {
        body[key][name[1]][name[2]] = e.currentTarget.value;
      } else {
        body[key] = e.currentTarget.value;
      }
    }
    this.props.set_public_body(body);
  };

  displayAddButton(key) {
    return (
      <span
        className="badge badge-success"
        style={{
          marginLeft: "50px",
          marginTop: "5px",
        }}
        onClick={() => this.handleAdd(this.body, key)}
      >
        Add+
      </span>
    );
  }
  displayBoolean(value, name) {
    return (
      <select
        className="custom-boolean"
        value={value}
        onChange={this.handleChange}
        name={name}
      >
        <option value={null}></option>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>
    );
  }

  obectDiv(obj, key, index) {
    return (
      <div>
        {Object.keys(obj).map((k) => (
          <div key={k}>
            <label
              style={{
                width: "20%",
                display: "inline",
              }}
            >
              {k}
            </label>

            {this.props.body_description[key].dataType === "Object"
              ? this.displayInput(obj[k], key + "." + k + ".value")
              : this.displayInput(
                  obj[k],
                  key + "." + index + "." + k + ".value"
                )}
          </div>
        ))}
      </div>
    );
  }

  displayInput(value, name) {
    return (
      <input
        className="custom-input"
        type={typeof value}
        name={name}
        value={value}
        placeholder="Value"
        onChange={this.handleChange}
      ></input>
    );
  }

  displayArray(key) {
    return (
      <div>
        {this.body[key].map((value, index) => (
          <div key={index}>
            {this.props.body_description[key].dataType === "Array of Boolean"
              ? this.displayBoolean(value, key + "." + index + ".value")
              : this.displayInput(value, key + "." + index + ".value")}
            <button
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(key, index)}
            >
              X
            </button>
          </div>
        ))}
        {this.displayAddButton(key)}
      </div>
    );
  }

  render() {
    console.log("props", this.props);
    const bodyDescription = this.props.body_description;
    this.keysArray = Object.keys(bodyDescription);
    this.defaultValuesArray = [];
    this.dataType = [];
    this.body = JSON.parse(this.props.body.value);
    if (
      this.props.public_body_flag &&
      this.props.body &&
      this.props.body.type === "JSON"
    ) {
      for (let i = 0; i < this.keysArray.length; i++) {
        this.body[this.keysArray[i]] =
          bodyDescription[this.keysArray[i]].default;
      }
      this.props.set_public_body(this.body);
    }

    return (
      <div>
        {this.props.body && this.props.body.type === "formData" && (
          <GenericTable
            {...this.props}
            title={this.props.body.type}
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body && this.props.body.type === "urlEncoded" && (
          <GenericTable
            {...this.props}
            title="x-www-form-urlencoded"
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.keysArray.length > 0 && (
          <div>
            <div className="public-generic-table-container">
              <div className="public-generic-table-title-container">Body</div>
              <table className="table table-bordered" id="custom-generic-table">
                <thead>
                  <tr>
                    <th> </th>
                    <th>KEY</th>
                    <th>VALUE</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody style={{ border: "none" }}>
                  {this.keysArray.map((key, index) => (
                    <tr key={index}>
                      <td style={{ marginLeft: "5px" }}></td>
                      <td>
                        <div>
                          <input
                            disabled
                            className="key-input"
                            value={key}
                            type={"text"}
                          ></input>
                          <label
                            style={{
                              marginLeft: "20px",
                              background: "lightgrey",
                              padding: "1px",
                              fontSize: "10px",
                            }}
                          >
                            {bodyDescription[key].dataType}
                          </label>
                        </div>
                      </td>
                      <td>
                        {bodyDescription[key].dataType === "boolean" ? (
                          this.displayBoolean(this.body[key], key + ".value")
                        ) : bodyDescription[key].dataType ===
                          "Array of Integer" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of String" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType ===
                          "Array of Boolean" ? (
                          this.displayArray(key)
                        ) : bodyDescription[key].dataType === "Object" ? (
                          this.obectDiv(this.body[key], key)
                        ) : bodyDescription[key].dataType ===
                          "Array of Objects" ? (
                          <div>
                            {this.body[key].map((obj, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  margin: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    marginLeft: "5px",
                                    border: "1px solid",
                                    width: "100%",
                                    padding: "5px",
                                    background: "#e8e7e7",
                                  }}
                                >
                                  {this.obectDiv(obj, key, i)}
                                </div>
                                <button
                                  type="button"
                                  className="btn cross-button"
                                  onClick={() => this.handleDelete(key, i)}
                                >
                                  X
                                </button>
                              </div>
                            ))}
                            {this.displayAddButton(key)}
                          </div>
                        ) : bodyDescription[key].dataType ===
                          "Object of Objects" ? (
                          <div>
                            {Object.keys(this.body[key]).map((k) => (
                              <div
                                key={k}
                                style={{
                                  marginLeft: "5px",
                                  border: "1px solid",
                                  width: "80%",
                                  padding: "5px",
                                  background: "lightgrey",
                                }}
                              >
                                {this.obectDiv(this.body[key][k], key, k)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          this.displayInput(this.body[key], key + ".value")
                        )}
                      </td>
                      <td>
                        <input
                          disabled
                          name={index + ".datatype"}
                          type="text"
                          value={bodyDescription[key].description}
                          placeholder="Description"
                          className="form-control"
                          style={{ border: "none" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PublicBodyContainer;
