import React, { Component } from "react";
import "./publicEndpoint.scss";
import { JsonHighlightRules } from "ace-builds/src-noconflict/mode-json";
import { Button } from "react-bootstrap";
import jQuery from "jquery";

class BodyDescription extends Component {
  state = {
    bodyDescription: null,
  };

  performDelete(pkeys, value) {
    if (pkeys.length == 1) {
      value.splice(pkeys[0], 1);
      return;
    }
    const data = value[pkeys[0]].value;
    return this.performDelete(pkeys.slice(1, pkeys.length), data);
  }

  handleDelete(name) {
    this.performDelete(name.split("."), this.props.body_description);
    this.props.set_body_description(this.props.body_description);
  }

  performAdd(pkeys, value) {
    if (pkeys.length == 1) {
      value[pkeys[0]].value.push(value[pkeys[0]].default);
      return;
    }
    const data = value[pkeys[0]].value;
    return this.performAdd(pkeys.slice(1, pkeys.length), data);
  }

  handleAdd(name) {
    this.performAdd(name.split("."), this.props.body_description);
    this.props.set_body_description(this.props.body_description);
  }

  performChange(pkeys, bodyDescription, value) {
    if (pkeys.length == 1) {
      if (bodyDescription[pkeys[0]].type === "number")
        bodyDescription[pkeys[0]].value = parseInt(value);
      else if (bodyDescription[pkeys[0]].type === "string")
        bodyDescription[pkeys[0]].value = value;
      else bodyDescription[pkeys[0]].value = value;

      return;
    } else {
      const data = bodyDescription[pkeys[0]].value;
      this.performChange(pkeys.slice(1, pkeys.length), data, value);
    }
  }

  handleChange = (e) => {
    const { name, value } = e.currentTarget;

    this.performChange(name.split("."), this.props.body_description, value);
    this.props.set_body_description(this.props.body_description);
  };

  performDescriptionChange(pkeys, bodyDescription, value) {
    if (pkeys.length == 1) {
      bodyDescription[pkeys[0]].description = value;

      return;
    } else {
      const data = bodyDescription[pkeys[0]].value;
      this.performDescriptionChange(pkeys.slice(1, pkeys.length), data, value);
    }
  }

  handleDescriptionChange = (e) => {
    const { name, value } = e.currentTarget;

    let parentKeyArray = name.split(".");
    parentKeyArray.splice(-1, 1);

    this.performDescriptionChange(
      parentKeyArray,
      this.props.body_description,
      value
    );
    console.log(this.props.body_description);
    this.props.set_body_description(this.props.body_description);
  };

  displayAddButton(name) {
    return (
      <div className="array-row-add-wrapper">
        <span
          className="badge badge-success"
          onClick={() => this.handleAdd(name)}
        >
          Add+
        </span>
      </div>
    );
  }

  displayBoolean(obj, name, className) {
    return (
      <select
        className={className || "custom-boolean"}
        value={obj.value}
        onChange={this.handleChange}
        name={name}
      >
        <option value={null}></option>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>
    );
  }

  displayInput(obj, name, className) {
    return (
      <div>
        <input
          className={className || "custom-input"}
          type={obj.type}
          name={name}
          value={obj.value}
          placeholder="Value"
          onChange={this.handleChange}
        ></input>
        <input
          value={obj.description}
          name={name + ".description"}
          type="text"
          placeholder="Description"
          onChange={this.handleDescriptionChange}
        ></input>
      </div>
    );
  }

  displayArray(array, name) {
    return (
      <div>
        {array.map((value, index) => (
          <div key={index} className="array-row">
            {value.type === "boolean"
              ? this.displayBoolean(value, name + "." + index, "array-boolean")
              : value.type === "object"
              ? this.displayObject(value.value, name + "." + index)
              : this.displayInput(value, name + "." + index)}
            <button
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(name + "." + index)}
            >
              X{/* <i className="fas fa-times"></i> */}
            </button>
          </div>
        ))}
        {this.displayAddButton(name)}
      </div>
    );
  }

  displayObject(obj, name) {
    return (
      <div style={{ border: "1px solid" }}>
        {Object.keys(obj).map((key, index) => (
          <div key={key} className="object-row-wrapper">
            <label>{key}</label>
            {obj[key].type === "object"
              ? this.displayObject(obj[key].value, name + "." + key)
              : obj[key].type === "array"
              ? this.displayArray(obj[key].value, name + "." + key)
              : obj[key].type === "boolean"
              ? this.displayBoolean(obj[key].value, name + "." + key)
              : this.displayInput(obj[key], name + "." + key, "object-value")}
          </div>
        ))}
      </div>
    );
  }
  parseBody(rawBody) {
    let body = {};
    try {
      body = JSON.parse(rawBody);
      return body;
    } catch (error) {
      return body;
    }
  }

  generateBodyDescription(body) {
    let bodyDescription = null;
    if (Array.isArray(body)) bodyDescription = [];
    else bodyDescription = {};

    const keys = Object.keys(body);
    for (let i = 0; i < keys.length; i++) {
      const value = body[keys[i]];
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        bodyDescription[keys[i]] = {
          value: "",
          type: typeof value,
          description: "",
        };
      } else {
        if (Array.isArray(value)) {
          bodyDescription[keys[i]] = {
            value: this.generateBodyDescription(value),
            type: "array",
            default: this.generateBodyDescription(value)[0],
          };
        } else {
          const value1 = this.generateBodyDescription(value);
          bodyDescription[keys[i]] = {
            value: this.generateBodyDescription(value),
            type: "object",
          };
        }
      }
    }
    return bodyDescription;
  }

  generateBodyFromDescription(bodyDescription, body) {
    if (!body) {
      body = {};
    }
    const keys = Object.keys(bodyDescription);
    for (let i = 0; i < keys.length; i++) {
      switch (bodyDescription[keys[i]].type) {
        case "string":
        case "number":
        case "boolean":
          body[keys[i]] = bodyDescription[keys[i]].value;
          break;
        case "array":
          body[keys[i]] = this.generateBodyFromDescription(
            bodyDescription[keys[i]].value,
            []
          );
          break;
        case "object":
          body[keys[i]] = this.generateBodyFromDescription(
            bodyDescription[keys[i]].value,
            {}
          );
          break;
      }
    }
    return body;
  }

  compareDefaultValue(updatedBodyDescription, originalBodyDescription) {
    // const originalKeys = Object.keys(originalBodyDescription);
    const updatedKeys = Object.keys(updatedBodyDescription);
    for (let i = 0; i < updatedKeys.length; i++) {
      if (
        originalBodyDescription[updatedKeys[i]] &&
        updatedBodyDescription[updatedKeys[i]].type ===
          originalBodyDescription[updatedKeys[i]].type
      ) {
        switch (updatedBodyDescription[updatedKeys[i]].type) {
          case "string":
          case "number":
          case "boolean":
            updatedBodyDescription[updatedKeys[i]].value =
              originalBodyDescription[updatedKeys[i]].value;
            break;
          case "array":
            updatedBodyDescription[
              updatedKeys[i]
            ].value = this.compareDefaultValue(
              updatedBodyDescription[updatedKeys[i]].value,
              originalBodyDescription[updatedKeys[i]].value
            );

            break;
          case "object":
            updatedBodyDescription[
              updatedKeys[i]
            ].value = this.compareDefaultValue(
              updatedBodyDescription[updatedKeys[i]].value,
              originalBodyDescription[updatedKeys[i]].value
            );

            break;
        }
      } else {
      }
    }
    return updatedBodyDescription;
  }

  handleDefaultValue(bodyDescription) {
    if (!this.originalBodyDescription) return bodyDescription;
    let originalBodyDescription = this.originalBodyDescription;
    let updatedBodyDescription = jQuery.extend(true, {}, bodyDescription);
    updatedBodyDescription = this.compareDefaultValue(
      updatedBodyDescription,
      originalBodyDescription
    );

    return updatedBodyDescription;
  }
  updateBodyDescription(body) {
    body = this.parseBody(body);
    let bodyDescription = this.generateBodyDescription(body);

    bodyDescription = this.handleDefaultValue(bodyDescription);
    this.setState({ bodyDescription });

    return bodyDescription;
  }

  handleUpdate() {
    this.originalBodyDescription = jQuery.extend(
      true,
      {},
      this.props.body_description
    );
    const bodyDescription = this.updateBodyDescription(this.props.body);
    console.log(bodyDescription);
    this.props.set_body_description(bodyDescription);
  }

  render() {
    return (
      <div>
        {this.props.body_type === "JSON" && (
          <div>
            <Button
              onClick={() => this.handleUpdate()}
              className="custom-update-button"
            >
              Update
            </Button>
            <div>
              {Object.keys(this.props.body_description).map((key) => (
                <div>
                  <label style={{ fontWeight: "bold" }}>{key}</label>
                  {this.props.body_description[key].type === "string"
                    ? this.displayInput(
                        this.props.body_description[key],
                        key,
                        "custom-input"
                      )
                    : this.props.body_description[key].type === "number"
                    ? this.displayInput(
                        this.props.body_description[key],
                        key,
                        "custom-input"
                      )
                    : this.props.body_description[key].type === "object"
                    ? this.displayObject(
                        this.props.body_description[key].value,
                        key
                      )
                    : this.props.body_description[key].type === "array"
                    ? this.displayArray(
                        this.props.body_description[key].value,
                        key
                      )
                    : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {this.props.body_type !== "JSON" && <div>{this.props.body}</div>}
      </div>
    );
  }
}

export default BodyDescription;
