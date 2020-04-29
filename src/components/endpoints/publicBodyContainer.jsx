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

  handleAddDelete(pkeys, value, body, title) {
    if (pkeys.length == 1) {
      if (title === "delete") {
        body.splice(pkeys[0], 1);
        value.splice(pkeys[0], 1);
      } else if (title === "add") {
        const defaultValue = jQuery.extend(true, {}, value[pkeys[0]].default);

        value[pkeys[0]].value.push(defaultValue);
        if (defaultValue.type === "object") {
          const keyArray = Object.keys(defaultValue.value);
          let data = {};
          data[keyArray[0]] = defaultValue.value[keyArray[0]].value;
          body[pkeys[0]].push(data);
        } else {
          body[pkeys[0]].push(defaultValue.value);
        }
      }
      return;
    }
    const data = value[pkeys[0]].value;
    const bodyData = body[pkeys[0]];
    this.handleAddDelete(pkeys.slice(1, pkeys.length), data, bodyData, title);
  }

  handleDelete(name) {
    let body = JSON.parse(this.props.body.value);
    this.handleAddDelete(name.split("."), this.bodyDescription, body, "delete");
    this.props.set_body_description(this.bodyDescription);
    this.props.set_public_body(body);
  }

  handleAdd(name) {
    let body = JSON.parse(this.props.body.value);
    this.handleAddDelete(name.split("."), this.bodyDescription, body, "add");
    this.props.set_body_description(this.bodyDescription);
    this.props.set_public_body(body);
  }

  performChange(pkeys, bodyDescription, body, value) {
    console.log(pkeys, bodyDescription, body);
    if (pkeys.length == 1) {
      if (bodyDescription[pkeys[0]].type === "number") {
        bodyDescription[pkeys[0]].value = parseInt(value);
        body[pkeys[0]] = parseInt(value);
      } else if (bodyDescription[pkeys[0]].type === "string") {
        bodyDescription[pkeys[0]].value = value;
        body[pkeys[0]] = value;
      } else {
        bodyDescription[pkeys[0]].value = value;
        body[pkeys[0]] = value;
      }
      return;
    } else {
      const data = bodyDescription[pkeys[0]].value;
      const bodyData = body[pkeys[0]];
      this.performChange(pkeys.slice(1, pkeys.length), data, bodyData, value);
    }
  }

  handleChange = (e) => {
    const { name, value } = e.currentTarget;
    console.log(name);
    let body = JSON.parse(this.props.body.value);
    this.performChange(name.split("."), this.bodyDescription, body, value);
    console.log(this.bodyDescription);
    this.props.set_public_body(body);
    this.props.set_body_description(this.bodyDescription);
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
        <input value={obj.description} disabled></input>
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
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        {this.displayAddButton(name)}
      </div>
    );
  }

  displayObject(obj, name) {
    return (
      <div style={{ border: "1px solid", padding: "8px" }}>
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

  render() {
    this.bodyDescription = this.props.body_description;
    console.log(this.props);

    // if (this.props.body.type === "JSON") {
    //   this.body = JSON.parse(this.props.body.value);
    //   this.keysArray = Object.keys(this.body);
    //   if (
    //     this.props.public_body_flag &&
    //     this.props.body &&
    //     this.props.body.type === "JSON"
    //   ) {
    //     for (let i = 0; i < this.keysArray.length; i++) {
    //       this.body[this.keysArray[i]] =
    //         bodyDescription[this.keysArray[i]].default;
    //     }
    //     this.props.set_public_body(this.body);
    //   }
    // }
    return (
      <div>
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
            <div>
              {Object.keys(this.bodyDescription).map((key) => (
                <div>
                  <label style={{ fontWeight: "bold" }}>{key}</label>
                  {this.bodyDescription[key].type === "string" ||
                  this.bodyDescription[key].type === "number"
                    ? this.displayInput(this.bodyDescription[key], key)
                    : this.bodyDescription[key].type === "boolean"
                    ? this.displayBoolean(this.bodyDescription[key], key)
                    : this.bodyDescription[key].type === "object"
                    ? this.displayObject(this.bodyDescription[key].value, key)
                    : this.bodyDescription[key].type === "array"
                    ? this.displayArray(this.bodyDescription[key].value, key)
                    : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PublicBodyContainer;
