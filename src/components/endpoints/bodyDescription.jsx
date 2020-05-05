import jQuery from "jquery";
import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "./publicEndpoint.scss";

class BodyDescription extends Component {
  state = {
    bodyDescription: null,
  };

  performChange(pkeys, bodyDescription, newValue) {
    if (pkeys.length === 1) {
      if (bodyDescription[pkeys[0]].type === "number")
        bodyDescription[pkeys[0]].value = parseInt(newValue);
      else if (bodyDescription[pkeys[0]].type === "string")
        bodyDescription[pkeys[0]].value = newValue;
      else if (bodyDescription[pkeys[0]].type === "boolean") {
        const value =
          newValue === "true" ? true : newValue === "false" ? false : null;
        bodyDescription[pkeys[0]].value = value;
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
    const bodyDescription = this.performChange(
      parentKeyArray,
      jQuery.extend(true, {}, this.props.body_description),
      value
    );
    this.props.set_body_description(bodyDescription);
  };

  performDescriptionChange(pkeys, bodyDescription, value) {
    if (pkeys.length === 1) {
      bodyDescription[pkeys[0]].description = value;
    } else {
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
    const bodyDescription = this.performDescriptionChange(
      parentKeyArray,
      jQuery.extend(true, {}, this.props.body_description),
      value
    );
    this.props.set_body_description(bodyDescription);
  };

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
            ? "array-wrapper"
            : ""
        }
      >
        {array.map((value, index) => (
          <div key={index} className="array-row">
            {value.type === "boolean"
              ? this.displayBoolean(value, name + "." + index)
              : value.type === "object"
              ? this.displayObject(value.value, name + "." + index)
              : value.type === "array"
              ? this.displayArray(value.value, name + "." + index)
              : this.displayInput(value, name + "." + index)}
          </div>
        ))}
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

  generateBodyDescription(body, isFirstTime) {
    let bodyDescription = null;
    let keys = [];
    if (Array.isArray(body)) {
      bodyDescription = [];
      keys = ["0"];
    } else {
      bodyDescription = {};
      keys = Object.keys(body);
    }

    for (let i = 0; i < keys.length; i++) {
      const value = body[keys[i]];
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        if (isFirstTime) {
          bodyDescription[keys[i]] = {
            value,
            type: typeof value,
            description: "",
          };
        } else {
          bodyDescription[keys[i]] = {
            value: null,
            type: typeof value,
            description: "",
          };
        }
      } else {
        if (Array.isArray(value)) {
          bodyDescription[keys[i]] = {
            value: this.generateBodyDescription(value, isFirstTime),
            type: "array",
            default: this.generateBodyDescription(value, isFirstTime)[0],
          };
        } else {
          bodyDescription[keys[i]] = {
            value: this.generateBodyDescription(value, isFirstTime),
            type: "object",
          };
        }
      }
    }
    return bodyDescription;
  }

  compareDefaultValue(updatedBodyDescription, originalBodyDescription) {
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
            updatedBodyDescription[
              updatedKeys[i]
            ].default = this.compareDefaultValue(
              updatedBodyDescription[updatedKeys[i]].value,
              originalBodyDescription[updatedKeys[i]].value
            )[0];

            break;
          case "object":
            updatedBodyDescription[
              updatedKeys[i]
            ].value = this.compareDefaultValue(
              updatedBodyDescription[updatedKeys[i]].value,
              originalBodyDescription[updatedKeys[i]].value
            );

            break;
          default:
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
  updateBodyDescription(body, isFirstTime) {
    body = this.parseBody(body);
    let bodyDescription = this.generateBodyDescription(body, isFirstTime);
    if (!isFirstTime)
      bodyDescription = this.preserveDefaultValue(bodyDescription);
    this.setState({ bodyDescription });
    if (this.props.tab.status !== "NEW")
      this.props.update_endpoint({ id: this.props.tab.id, bodyDescription });

    return bodyDescription;
  }

  handleUpdate(isFirstTime) {
    this.originalBodyDescription = jQuery.extend(
      true,
      {},
      this.props.body_description
    );
    const bodyDescription = this.updateBodyDescription(
      this.props.body,
      isFirstTime
    );

    this.props.set_body_description(bodyDescription);
  }

  render() {
    if (
      this.props.body &&
      Object.keys(this.props.body) &&
      Object.keys(this.props.body).length &&
      !(
        this.props.body_description &&
        Object.keys(this.props.body_description) &&
        Object.keys(this.props.body_description).length
      )
    ) {
      this.handleUpdate(true);
    }
    return (
      <div>
        {this.props.body_type === "JSON" && (
          <div>
            <Button
              onClick={() => this.handleUpdate()}
              className="custom-update-button"
            >
              Update Body Description
            </Button>
            <div className="body-description-container">
              {this.displayObject(
                this.props.body_description,
                "body_description"
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default BodyDescription;
