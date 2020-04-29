import React, { Component } from "react";
import "./publicEndpoint.scss";
import { JsonHighlightRules } from "ace-builds/src-noconflict/mode-json";
import { Button } from "react-bootstrap";
import jQuery from "jquery";

class BodyDescription extends Component {
  state = {
    bodyDescription: null,
  };

  // handleChangeBody(title, dataArray) {
  //   switch (title) {
  //     case "formData":
  //       this.props.set_body("multipart/form-data", dataArray);
  //       break;
  //     case "x-www-form-urlencoded":
  //       this.props.set_body("application/x-www-form-urlencoded", dataArray);
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // handleDescriptionChange = (e, key) => {
  //   let fieldDescription = { ...this.props.field_description };
  //   let bodyDescription = { ...this.props.body_description };
  //   fieldDescription[key] = e.currentTarget.value;
  //   bodyDescription[key].description = e.currentTarget.value;
  //   this.props.set_field_description(fieldDescription, bodyDescription);
  // };

  // handleDelete(key, index) {
  //   this.body[key].splice(index, 1);
  //   this.props.set_public_body(this.body);
  // }

  // handleAdd(body, key) {
  //   body[key].push(this.props.body_description[key].default[0]);
  //   this.props.set_public_body(body);
  // }

  // handleChange = (e) => {
  //   const name = e.currentTarget.name.split(".");
  //   const key = name[0];
  //   const bodyDescription = this.props.body_description;
  //   let body = this.body;
  //   const { type, value } = e.currentTarget;
  //   if (type === "number") {
  //     switch (bodyDescription[key].dataType) {
  //       case "Array of number":
  //         body[key][name[1]] = parseInt(value);
  //         break;
  //       case "object":
  //         body[key][name[1]] = parseInt(value);
  //         break;
  //       case "Array of object":
  //         body[key][name[1]][name[2]] = parseInt(value);
  //         break;
  //       case "Object of objects":
  //         body[key][name[1]][name[2]] = parseInt(value);
  //         break;
  //       default:
  //         body[key] = parseInt(value);
  //     }
  //   } else {
  //     switch (bodyDescription[key].dataType) {
  //       case "Array of string":
  //         body[key][name[1]] = value;
  //         break;
  //       case "object":
  //         body[key][name[1]] = value;
  //         break;
  //       case "Array of object":
  //         body[key][name[1]][name[2]] = value;
  //         break;
  //       case "Object of objects":
  //         body[key][name[1]][name[2]] = value;
  //         break;
  //       case "Array of boolean":
  //         body[key][name[1]] = value;
  //         break;
  //       default:
  //         body[key] = value;
  //     }
  //   }
  //   this.props.set_public_body(body);
  // };

  // displayAddButton(key) {
  //   return (
  //     <div className="array-row-add-wrapper">
  //       <span
  //         className="badge badge-success"
  //         onClick={() => this.handleAdd(this.body, key)}
  //       >
  //         Add+
  //       </span>
  //     </div>
  //   );
  // }

  // displayBoolean(value, name, className) {
  //   return (
  //     <select
  //       disabled
  //       className={className || "custom-boolean"}
  //       value={value}
  //       onChange={this.handleChange}
  //       name={name}
  //     >
  //       <option value={null}></option>
  //       <option value={true}>true</option>
  //       <option value={false}>false</option>
  //     </select>
  //   );
  // }

  // displayInput(value, name, className) {
  //   let type = typeof value;
  //   type = type === "object" || type === "number" ? "number" : "string";
  //   return (
  //     <input
  //       disabled
  //       className={className || "custom-input"}
  //       type={type}
  //       name={name}
  //       value={value}
  //       placeholder="Value"
  //       onChange={this.handleChange}
  //     ></input>
  //   );
  // }

  // obectDiv(obj, key, index) {
  //   return (
  //     <div className="object-container">
  //       {Object.keys(obj).map((k) => (
  //         <div key={k} className="object-row-wrapper">
  //           <label>{k}</label>
  //           {this.props.body_description[key].dataType === "object"
  //             ? this.displayInput(
  //                 obj[k],
  //                 key + "." + k + ".value",
  //                 "object-value"
  //               )
  //             : this.displayInput(
  //                 obj[k],
  //                 key + "." + index + "." + k + ".value",
  //                 "object-value"
  //               )}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  // displayArray(key) {
  //   return (
  //     <div>
  //       {this.props.body_description[key].default.map((value, index) => (
  //         <div key={index} className="array-row">
  //           {this.props.body_description[key].dataType === "Array of boolean"
  //             ? this.displayBoolean(
  //                 value,
  //                 key + "." + index + ".value",
  //                 "array-boolean"
  //               )
  //             : this.displayInput(
  //                 value,
  //                 key + "." + index + ".value",
  //                 "array-input"
  //               )}
  //           <button
  //             disabled
  //             type="button"
  //             className="btn cross-button"
  //             onClick={() => this.handleDelete(key, index)}
  //           >
  //             <i className="fas fa-times"></i>
  //           </button>
  //         </div>
  //       ))}
  //       {/* {this.displayAddButton(key)} */}
  //     </div>
  //   );
  // }
  // handleChangeBody(title, dataArray) {
  //   switch (title) {
  //     case "formData":
  //       this.props.set_body("multipart/form-data", dataArray);
  //       break;
  //     case "x-www-form-urlencoded":
  //       this.props.set_body("application/x-www-form-urlencoded", dataArray);
  //       break;
  //     default:
  //       break;
  //   }
  // }

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
    console.log(name);
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

  // performBodyChange(pkeys, body, value) {
  //   if (pkeys.length == 1) {
  //     body[pkeys[0]] = value;
  //     return;
  //   } else {
  //     const data = body[pkeys[0]];
  //     this.performBodyChange(pkeys.slice(1, pkeys.length), data, value);
  //   }
  // }

  handleChange = (e) => {
    const { name, value } = e.currentTarget;
    //console.log(name);

    this.performChange(name.split("."), this.props.body_description, value);
    // let body = JSON.parse(this.props.body.value);
    // this.performBodyChange(name.split("."), body, value);
    console.log("sfdsf", this.props.body_description);
    // this.props.set_public_body(body);
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
    //console.log(name);
    let parentKeyArray = name.split(".");
    parentKeyArray.splice(-1, 1);
    // console.log(parentKeyArray.splice(-1, 1), parentKeyArray);
    this.performDescriptionChange(
      parentKeyArray,
      this.props.body_description,
      value
    );
    // this.performChange(parentKeyArray.splice(-1,1), this.props.body_description, value);
    // let body = JSON.parse(this.props.body.value);
    // this.performBodyChange(name.split("."), body, value);
    // console.log("sfdsf", this.props.body_description);
    // this.props.set_public_body(body);
    console.log("sfdsf", this.props.body_description);
    this.props.set_body_description(this.props.body_description);
    // this.props.set_body_description(this.props.body_description);
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
    console.log("name", name);
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
          value: null,
          type: typeof value,
          description: null,
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

// 0: {name: "name", parentKeys: Array(0), type: "string", description: ""}
// 1: {name: "variables", parentKeys: Array(0), type: "object", description: ""}
// 2:
// description: ""
// name: "var1"
// parentKeys: ["variables"]
// type: "object"
// __proto__: Object
// 3:
// description: ""
// name: "initialValue"
// parentKeys: (2) ["variables", "var1"]
// type: "string"
// __proto__: Object
// 4:
// description: ""
// name: "currentValue"
// parentKeys: (2) ["variables", "var1"]
// type: "string"
// __proto__: Object
// 5:
// description: ""
// name: "var2"
// parentKeys: ["variables"]
// type: "object"
// __proto__: Object
// 6:
// description: ""
// name: "initialVaddddlue"
// parentKeys: (2) ["variables", "var2"]
// type: "string"
// __proto__: Object
// 7:
// description: ""
// name: "currentValue"
// parentKeys: (2) ["variables", "var2"]
// type: "string"

// 0: {name: "name", parentKeys: Array(0), type: "string", description: ""}
// 1: {name: "variables", parentKeys: Array(0), type: "object", description: ""}
// 2: {name: "var1", parentKeys: Array(1), type: "object", description: ""}
// 3:
// description: ""
// name: "initialValue"
// parentKeys: (2) ["variables", "var1"]
// type: "string"
// __proto__: Object
// 4:
// description: ""
// name: "currentValue"
// parentKeys: (2) ["variables", "var1"]
// type: "string"
// __proto__: Object
// 5:
// description: ""
// name: "key45"
// parentKeys: (2) ["variables", "var1"]
// type: "string"
// __proto__: Object
// 6:
// description: ""
// name: "var2"
// parentKeys: ["variables"]
// type: "object"
// __proto__: Object
// 7:
// description: ""
// name: "initialVaddddlue"
// parentKeys: (2) ["variables", "var2"]
// type: "string"
// __proto__: Object
// 8:
// description: ""
// name: "currentValue"
// parentKeys: (2) ["variables", "var2"]
// type: "string"
