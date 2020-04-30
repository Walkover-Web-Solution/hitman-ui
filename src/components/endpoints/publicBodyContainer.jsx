import React, { Component } from "react";
import GenericTable from "./genericTable";
import jQuery from "jquery";
import "./publicEndpoint.scss";

class PublicBodyContainer extends Component {
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

  makeParentKeysArray(name) {
    let parentKeyArray = name.split(".");
    parentKeyArray.splice(0, 1);
    return parentKeyArray;
  }

  setBody(data) {
    this.props.set_body_description(data.bodyDescription);
    this.props.set_public_body(data.body);
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

  handleDelete(name) {
    let body = JSON.parse(this.props.body.value);

    const data = this.handleAddDelete(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.bodyDescription),
      jQuery.extend(true, {}, body),
      "delete"
    );

    this.setBody(data);
  }

  handleAdd(name) {
    let body = JSON.parse(this.props.body.value);

    const data = this.handleAddDelete(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.bodyDescription),
      jQuery.extend(true, {}, body),
      "add"
    );

    this.setBody(data);
  }

  performChange(pkeys, bodyDescription, body, newValue) {
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
        bodyData,
        newValue
      );
    }
    return { body, bodyDescription };
  }

  handleChange = (e) => {
    const { name, value } = e.currentTarget;
    let body = JSON.parse(this.props.body.value);

    const data = this.performChange(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.bodyDescription),
      jQuery.extend(true, {}, body),
      value
    );

    this.setBody(data);
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
          disabled
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
          disabled
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
            <button
              type="button"
              className="btn cross-button"
              onClick={() => this.handleDelete(name + "." + index)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        {this.displayAddButton(name)}
      </div>
    );
  }

  displayObject(obj, name) {
    console.log(obj, name);
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

  render() {
    this.bodyDescription = this.props.body_description;

    if (
      this.props.public_body_flag &&
      this.props.body &&
      this.props.body.type === "JSON"
    ) {
      const body = this.generateBodyFromDescription(this.bodyDescription);
      this.props.set_public_body(body);
    }

    return (
      // "public-generic-table-title-container"
      <div>
        <div
          className="public-generic-table-title-container"
          style={{
            padding: "40px 0px 3px 20px",
            color: " tomato",
            backgroundColor: "white",
          }}
        >
          Body
        </div>
        {this.props.body && this.props.body.type === "multipart/form-data" && (
          <GenericTable
            {...this.props}
            title="formData"
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body &&
          this.props.body.type === "application/x-www-form-urlencoded" && (
            <GenericTable
              {...this.props}
              title="x-www-form-urlencoded"
              dataArray={this.props.body.value}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.props.body.value]}
            ></GenericTable>
          )}

        {this.props.body && this.props.body.type === "JSON" && (
          <div>
            <div className="body-description-container">
              {this.displayObject(this.bodyDescription, "body_description")}
              {/* {Object.keys(this.bodyDescription).map((key) => (
                <div
                  style={
                    this.bodyDescription[key].type === "object"
                      ? { display: "flex", flexDirection: "column" }
                      : {
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }
                  }
                >
                  <div className="key-title">
                    <label style={{ fontWeight: "bold" }}>{key}</label>
                    <label className="data-type">
                      {this.bodyDescription[key].type}
                    </label>
                  </div>
                  {this.bodyDescription[key].type === "string" ||
                  this.bodyDescription[key].type === "number"
                    ? this.displayInput(this.bodyDescription[key], key)
                    : this.bodyDescription[key].type === "boolean"
                    ? this.displayBoolean(this.bodyDescription[key], key)
                    : this.bodyDescription[key].type === "object"
                    ? this.displayObject(this.bodyDescription[key].value, key)
                    : this.bodyDescription[key].type === "array"
                    ? this.displayArray(
                        this.bodyDescription[key].value,
                        key,
                        this.bodyDescription[key].default
                      )
                    : null}
                </div>
              ))} */}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PublicBodyContainer;
