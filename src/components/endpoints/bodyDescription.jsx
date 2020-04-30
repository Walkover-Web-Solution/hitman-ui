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

  performChange(pkeys, bodyDescription, newValue) {
    if (pkeys.length == 1) {
      if (bodyDescription[pkeys[0]].type === "number")
        bodyDescription[pkeys[0]].value = parseInt(newValue);
      else if (bodyDescription[pkeys[0]].type === "string")
        bodyDescription[pkeys[0]].value = newValue;
      else if (bodyDescription[pkeys[0]].type === "boolean") {
        const value =
          newValue === "true" ? true : newValue === "false" ? false : null;
        bodyDescription[pkeys[0]].value = value;
        // else bodyDescription[pkeys[0]].value = value;
      }
    } else {
      const data = bodyDescription[pkeys[0]].value;
      bodyDescription[pkeys[0]].value = this.performChange(
        pkeys.slice(1, pkeys.length),
        data,
        newValue
      );
    }
    return bodyDescription;
  }

  handleChange = (e) => {
    const { name, value } = e.currentTarget;
    let parentKeyArray = name.split(".");
    parentKeyArray.splice(0, 1);
    console.log(parentKeyArray);
    const bodyDescription = this.performChange(
      parentKeyArray,
      jQuery.extend(true, {}, this.props.body_description),
      value
    );
    console.log(bodyDescription);
    this.props.set_body_description(bodyDescription);
  };

  performDescriptionChange(pkeys, bodyDescription, value) {
    console.log("bodyDescription", bodyDescription);
    if (pkeys.length == 1) {
      bodyDescription[pkeys[0]].description = value;
    } else {
      // console.log(bodyDescription[pkeys[0]]);
      const data = bodyDescription[pkeys[0]].value;
      bodyDescription[pkeys[0]].value = this.performDescriptionChange(
        pkeys.slice(1, pkeys.length),
        data,
        value
      );
    }
    return bodyDescription;
  }

  handleDescriptionChange = (e) => {
    const { name, value } = e.currentTarget;

    let parentKeyArray = name.split(".");
    parentKeyArray.splice(0, 1);
    parentKeyArray.splice(-1, 1);
    console.log(parentKeyArray);
    const bodyDescription = this.performDescriptionChange(
      parentKeyArray,
      jQuery.extend(true, {}, this.props.body_description),
      value
    );
    console.log(bodyDescription);
    this.props.set_body_description(bodyDescription);
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
      <div className="value-description-input-wrapper">
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
        <input
          className="description-input-field"
          value={obj.description}
          name={name + ".description"}
          type="text"
          placeholder="Description"
          onChange={this.handleDescriptionChange}
        ></input>
      </div>
    );
  }

  displayInput(obj, name) {
    return (
      <div className="value-description-input-wrapper">
        <input
          className="value-input-field"
          type={obj.type}
          name={name}
          value={obj.value}
          placeholder="Value"
          onChange={this.handleChange}
        ></input>
        <input
          className="description-input-field"
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
      <div
        className={
          array[0].type === "object" || array[0].type === "array"
            ? "array-row-wrapper"
            : ""
        }
      >
        {array.map((value, index) => (
          <div key={index} className="array-row">
            {value.type === "boolean"
              ? this.displayBoolean(value, name + "." + index, "array-boolean")
              : value.type === "object"
              ? this.displayObject(value.value, name + "." + index)
              : value.type === "array"
              ? this.displayArray(value.value, name + "." + index)
              : this.displayInput(value, name + "." + index)}
            {/* <button
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(name + "." + index)}
            >
              <i className="fas fa-times"></i>
            </button> */}
          </div>
        ))}
        {/* {this.displayAddButton(name)} */}
      </div>
    );
  }

  displayObject(obj, name) {
    return (
      <div className="object-container">
        {Object.keys(obj).map((key, index) => (
          <div
            key={key}
            className={
              obj[key].type === "array"
                ? "array-container"
                : "object-row-wrapper"
            }
            style={
              obj[key].type === "object"
                ? { flexDirection: "column" }
                : { flexDirection: "row" }
            }
          >
            <div className="key-title">
              <label>{key}</label>
              <label className="data-type">{obj[key].type}</label>
            </div>
            {obj[key].type === "object"
              ? this.displayObject(obj[key].value, name + "." + key)
              : obj[key].type === "array"
              ? this.displayArray(obj[key].value, name + "." + key)
              : obj[key].type === "boolean"
              ? this.displayBoolean(obj[key], name + "." + key)
              : this.displayInput(obj[key], name + "." + key)}
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
          value: null,
          type: typeof value,
          description: "",
        };
      } else {
        if (Array.isArray(value)) {
          const child = this.generateBodyDescription(value)[0];
          bodyDescription[keys[i]] = {
            value: this.generateBodyDescription(value),
            type: "array",
            default: child,
          };
        } else {
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
            updatedBodyDescription[updatedKeys[i]].description =
              originalBodyDescription[updatedKeys[i]].description;
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

  preserveDefaultValue(bodyDescription) {
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

    bodyDescription = this.preserveDefaultValue(bodyDescription);
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
            <div className="body-description-container">
              {this.displayObject(
                this.props.body_description,
                "body_description"
              )}
              {/* {Object.keys(this.props.body_description).map((key) => (
                <div>
                  <label>{key}</label>
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
              ))} */}
            </div>
          </div>
        )}

        {this.props.body_type !== "JSON" && <div>{this.props.body}</div>}
      </div>
    );
  }
}

export default BodyDescription;
