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

  handleDelete(index) {
    this.bodyDescription.splice(index, 1);
    //this.props.set_public_body(this.body);
  }

  handleAdd(index, value) {
    this.bodyDescription.splice(1, index, value);
    //body[key].push(this.props.body_description[key].default[0]);
    //this.props.set_public_body(body);
  }

  handleChange = (e) => {
    const name = e.currentTarget.name.split(".");
    const key = name[0];
    const bodyDescription = this.props.body_description;
    let body = this.body;
    const { type, value } = e.currentTarget;
    // if (type === "number") {
    //   switch (bodyDescription[key].dataType) {
    //     case "Array of number":
    //       body[key][name[1]] = parseInt(value);
    //       break;
    //     case "object":
    //       body[key][name[1]] = parseInt(value);
    //       break;
    //     case "Array of object":
    //       body[key][name[1]][name[2]] = parseInt(value);
    //       break;
    //     case "Object of objects":
    //       body[key][name[1]][name[2]] = parseInt(value);
    //       break;
    //     default:
    //       body[key] = parseInt(value);
    //   }
    // } else {
    //   switch (bodyDescription[key].dataType) {
    //     case "Array of string":
    //       body[key][name[1]] = value;
    //       break;
    //     case "object":
    //       body[key][name[1]] = value;
    //       break;
    //     case "Array of object":
    //       body[key][name[1]][name[2]] = value;
    //       break;
    //     case "Object of objects":
    //       body[key][name[1]][name[2]] = value;
    //       break;
    //     case "Array of boolean":
    //       body[key][name[1]] = value;
    //       break;
    //     default:
    //       body[key] = value;
    //   }
    // }
    // this.props.set_public_body(body);
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
    // let type = typeof value;
    // type = type === "object" || type === "number" ? "number" : "string";
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
        <input value={obj.description} placeholder="description"></input>
      </div>
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

  arrayInput(value, type, name) {
    return (
      <div>
        <input
          className={"custom-input"}
          type={type}
          name={name}
          value={value}
          placeholder="Value"
          onChange={this.handleChange}
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
              ? this.displayBoolean(
                  value.value,
                  name + "." + index,
                  "array-boolean"
                )
              : value.type === "object"
              ? this.displayObject(value.value, name + "." + index + ".value")
              : this.arrayInput(value.value, value.type, name + "." + index)}
            <button
              type="button"
              className="btn cross-button"
              //onClick={() => this.handleDelete(key, index)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        {this.displayAddButton()}
      </div>
    );
  }

  displayObject(obj, name) {
    return (
      <div className="object-container">
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
      // toast.error("Invalid Body");
      return body;
    }
  }

  // generateBodyDescription1(json, parentKeys) {
  //   if (!parentKeys) parentKeys = [];

  //   let obj = json;
  //   let keys = Object.keys(json);
  //   if (json.length) {
  //     keys = keys.map(Number);
  //   }
  //   let keyElements = [];
  //   for (let i = 0; i < keys.length; i++) {
  //     if (typeof obj[keys[i]] === "object") {
  //       if (obj[keys[i]].length) {
  //         keyElements.push({
  //           name: keys[i],
  //           parentKeys,
  //           type: "array",
  //           description: "",
  //         });
  //       } else {
  //         keyElements.push({
  //           name: keys[i],
  //           parentKeys,
  //           type: typeof obj[keys[i]],
  //           description: "",
  //         });
  //       }
  //       const childKeyElements = this.generateBodyDescription(obj[keys[i]], [
  //         ...parentKeys,
  //         keys[i],
  //       ]);
  //       if (childKeyElements.length) {
  //         keyElements.push(...childKeyElements);
  //       }
  //     } else {
  //       keyElements.push({
  //         name: keys[i],
  //         parentKeys,
  //         type: typeof obj[keys[i]],
  //         description: "",
  //       });
  //     }
  //   }
  //   return keyElements;
  // }

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

  handleChange(e, index, title) {
    // switch (title) {
    //   case "default-value":
    //     bodyDescription[index].defaultValue = e.currentTarget.value;
    //   case "description":
    //     bodyDescription[index].defaultValue = e.currentTarget.value;
    // }
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
    this.props.set_body_description(bodyDescription);
  }

  render() {
    return (
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
                ? this.displayArray(this.props.body_description[key].value, key)
                : null}
            </div>
          ))}
        </div>
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
