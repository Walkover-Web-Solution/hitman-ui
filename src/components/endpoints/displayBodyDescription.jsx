import React, { Component } from "react";
import jQuery from "jquery";
class DisplayBodyDescription extends Component {
  state = {};

  performChange(pkeys, bodyDescription, newValue, body) {
    if (pkeys.length === 1) {
      const type = bodyDescription[pkeys[0]].type;

      if (type === "number") {
        bodyDescription[pkeys[0]].value = parseInt(newValue);
        body[pkeys[0]] = parseInt(newValue);
      } else if (type === "string") {
        bodyDescription[pkeys[0]].value = newValue;
        body[pkeys[0]] = newValue;
      } else if (type === "boolean") {
        const value =
          newValue === "true" ? true : newValue === "false" ? false : null;
        bodyDescription[pkeys[0]].value = value;
        body[pkeys[0]] = value;
      }
    } else {
      const data = bodyDescription[pkeys[0]].value;
      const bodyData = body[pkeys[0]];

      this.performChange(
        pkeys.slice(1, pkeys.length),
        data,

        newValue,
        bodyData
      );
    }
    return { body, bodyDescription };
  }

  handleChange = (e) => {
    const { name, value } = e.currentTarget;
    let body = JSON.parse(this.props.body.value);
    const bodyDescription = this.performChange(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.props.body_description),
      value,
      jQuery.extend(true, {}, body)
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

  displayAddButton(name) {
    return (
      <div className="array-row-add-wrapper">
        <span
          className="badge badge-success"
          style={{ cursor: "pointer" }}
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
  displayArray(array, name, defaultValue) {
    return (
      <div
        className={
          defaultValue &&
          (defaultValue.type === "object" || defaultValue.type === "array")
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
              ? this.displayArray(
                  value.value,
                  name + "." + index,
                  value.default
                )
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
              ? this.displayArray(
                  obj[key].value,
                  name + "." + key,
                  obj[key].default
                )
              : obj[key].type === "boolean"
              ? this.displayBoolean(obj[key], name + "." + key)
              : this.displayInput(obj[key], name + "." + key)}
          </div>
        ))}
      </div>
    );
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
        default:
          break;
      }
    }
    return body;
  }

  makeParentKeysArray(name) {
    let parentKeyArray = name.split(".");
    parentKeyArray.splice(0, 1);
    return parentKeyArray;
  }

  handleAddDelete(pkeys, bodyDescription, body, title) {
    if (pkeys.length === 1) {
      if (title === "delete") {
        body.splice(pkeys[0], 1);
        bodyDescription.splice(pkeys[0], 1);
      } else if (title === "add") {
        const defaultValue = jQuery.extend(
          true,
          {},
          bodyDescription[pkeys[0]].default
        );

        bodyDescription[pkeys[0]].value.push(defaultValue);

        if (defaultValue.type === "object") {
          let data = {};
          Object.keys(defaultValue.value).forEach((key) => {
            data[key] = defaultValue.value[key].value;
          });
          body[pkeys[0]].push(data);
        } else {
          body[pkeys[0]].push(defaultValue.value);
        }
      }
    } else {
      const data = bodyDescription[pkeys[0]].value;
      const bodyData = body[pkeys[0]];
      this.handleAddDelete(pkeys.slice(1, pkeys.length), data, bodyData, title);
    }

    return { body, bodyDescription };
  }

  render() {
    return (
      <div className="body-description-container">
        {this.displayObject(this.props.body_description, "body_description")}
      </div>
    );
  }
}

export default DisplayBodyDescription;
