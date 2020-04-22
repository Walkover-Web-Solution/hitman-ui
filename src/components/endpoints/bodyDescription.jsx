import React, { Component } from "react";
import "./publicEndpoint.scss";

class BodyDescription extends Component {
  state = {};

  handleChangeBody(title, dataArray) {
    switch (title) {
      case "formData":
        this.props.set_body("multipart/form-data", dataArray);
        break;
      case "x-www-form-urlencoded":
        this.props.set_body("application/x-www-form-urlencoded", dataArray);
        break;
      default:
        break;
    }
  }

  handleDescriptionChange = (e, key) => {
    let fieldDescription = { ...this.props.field_description };
    let bodyDescription = { ...this.props.body_description };
    fieldDescription[key] = e.currentTarget.value;
    bodyDescription[key].description = e.currentTarget.value;
    this.props.set_field_description(fieldDescription, bodyDescription);
  };

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
    const { type, value } = e.currentTarget;
    if (type === "number") {
      switch (bodyDescription[key].dataType) {
        case "Array of number":
          body[key][name[1]] = parseInt(value);
          break;
        case "object":
          body[key][name[1]] = parseInt(value);
          break;
        case "Array of object":
          body[key][name[1]][name[2]] = parseInt(value);
          break;
        case "Object of objects":
          body[key][name[1]][name[2]] = parseInt(value);
          break;
        default:
          body[key] = parseInt(value);
      }
    } else {
      switch (bodyDescription[key].dataType) {
        case "Array of string":
          body[key][name[1]] = value;
          break;
        case "object":
          body[key][name[1]] = value;
          break;
        case "Array of object":
          body[key][name[1]][name[2]] = value;
          break;
        case "Object of objects":
          body[key][name[1]][name[2]] = value;
          break;
        case "Array of boolean":
          body[key][name[1]] = value;
          break;
        default:
          body[key] = value;
      }
    }
    this.props.set_public_body(body);
  };

  displayAddButton(key) {
    return (
      <div className="array-row-add-wrapper">
        <span
          className="badge badge-success"
          onClick={() => this.handleAdd(this.body, key)}
        >
          Add+
        </span>
      </div>
    );
  }

  displayBoolean(value, name, className) {
    return (
      <select
        disabled
        className={className || "custom-boolean"}
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

  displayInput(value, name, className) {
    let type = typeof value;
    type = type === "object" || type === "number" ? "number" : "string";
    return (
      <input
        disabled
        className={className || "custom-input"}
        type={type}
        name={name}
        value={value}
        placeholder="Value"
        onChange={this.handleChange}
      ></input>
    );
  }

  obectDiv(obj, key, index) {
    return (
      <div className="object-container">
        {Object.keys(obj).map((k) => (
          <div key={k} className="object-row-wrapper">
            <label>{k}</label>
            {this.props.body_description[key].dataType === "object"
              ? this.displayInput(
                  obj[k],
                  key + "." + k + ".value",
                  "object-value"
                )
              : this.displayInput(
                  obj[k],
                  key + "." + index + "." + k + ".value",
                  "object-value"
                )}
          </div>
        ))}
      </div>
    );
  }

  displayArray(key) {
    return (
      <div>
        {this.props.body_description[key].default.map((value, index) => (
          <div key={index} className="array-row">
            {this.props.body_description[key].dataType === "Array of boolean"
              ? this.displayBoolean(
                  value,
                  key + "." + index + ".value",
                  "array-boolean"
                )
              : this.displayInput(
                  value,
                  key + "." + index + ".value",
                  "array-input"
                )}
            <button
              disabled
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(key, index)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        {/* {this.displayAddButton(key)} */}
      </div>
    );
  }

  render() {
    const bodyDescription = { ...this.props.body_description };
    this.keysArray = Object.keys(bodyDescription);

    return (
      <div>
        {this.props.body.type !== "JSON" && <div>{this.props.body.value}</div>}
        {this.props.body &&
          this.props.body.type === "JSON" &&
          this.keysArray.length > 0 && (
            <div>
              <div className="public-generic-table-container">
                <table
                  className="table table-bordered"
                  id="custom-generic-table"
                >
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
                            <label className="data-type">
                              {bodyDescription[key].dataType}
                            </label>
                          </div>
                        </td>
                        <td>
                          {bodyDescription[key].dataType === "boolean" ? (
                            this.displayBoolean(
                              bodyDescription[key].default,
                              key + ".value"
                            )
                          ) : bodyDescription[key].dataType ===
                            "Array of number" ? (
                            this.displayArray(key)
                          ) : bodyDescription[key].dataType ===
                            "Array of string" ? (
                            this.displayArray(key)
                          ) : bodyDescription[key].dataType ===
                            "Array of boolean" ? (
                            this.displayArray(key)
                          ) : bodyDescription[key].dataType === "object" ? (
                            this.obectDiv(bodyDescription[key].default, key)
                          ) : bodyDescription[key].dataType ===
                            "Array of object" ? (
                            <React.Fragment>
                              {bodyDescription[key].default.map((obj, i) => (
                                <div key={i} className="object-wrapper">
                                  {this.obectDiv(obj, key, i)}

                                  <button
                                    disabled
                                    type="button"
                                    className="btn cross-button"
                                    onClick={() => this.handleDelete(key, i)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                              {/* {this.displayAddButton(key)} */}
                            </React.Fragment>
                          ) : bodyDescription[key].dataType ===
                            "Object of objects" ? (
                            <div>
                              {Object.keys(bodyDescription[key].default).map(
                                (k) => (
                                  // <div
                                  //   key={k}
                                  //   // style={{
                                  //   //   marginLeft: "5px",
                                  //   //   border: "1px solid",
                                  //   //   width: "80%",
                                  //   //   padding: "5px",
                                  //   //   background: "lightgrey",
                                  //   // }}
                                  // >
                                  <div className="object-wrapper" key={k}>
                                    {this.obectDiv(
                                      bodyDescription[key].default[k],
                                      key,
                                      k
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            this.displayInput(
                              bodyDescription[key].default,
                              key + ".value"
                            )
                          )}
                        </td>
                        <td>
                          <input
                            name={index + ".description"}
                            type="text"
                            value={this.props.field_description[key] || ""}
                            placeholder="Description"
                            className="form-control"
                            onChange={(e) =>
                              this.handleDescriptionChange(e, key)
                            }
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

export default BodyDescription;
