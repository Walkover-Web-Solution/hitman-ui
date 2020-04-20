import React, { Component } from "react";
import GenericTable from "./genericTable";
import "ace-builds";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";
import "./endpoints.scss";
import { Table } from "react-bootstrap";
import NewBodyDescription from "./newBodyDescription";

class BodyContainer extends Component {
  // updatedArray = React.createRef();
  state = {
    selectedBodyType: null,
    data: {
      raw: "",
      raw1: "",
      data: [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ],
      urlencoded: [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ],
    },
    endpointId: null,
    selectedRawBodyType: "TEXT",

    // updatedArray: {},
  };

  rawBodyTypes = ["TEXT", "HTML", "JSON", "XML", "JavaScript"];

  handleAdd(dataType, key) {
    let updatedArray = { ...this.props.updated_array };
    if (updatedArray[key] && Array.isArray(updatedArray[key])) {
      updatedArray[key].push(null);
    } else {
      let tempArr = [null];
      updatedArray[key] = tempArr;
    }
    this.props.update_array(updatedArray);
    // this.setState({ updatedArray });
  }

  handleDelete(index, key) {
    const updatedArray = { ...this.props.updated_array };
    updatedArray[key].splice(index, 1);
    this.props.update_array(updatedArray);
    // this.setState({ updatedArray });
  }

  handleSelectBodyType(bodyType, bodyDescription) {
    if (bodyType === "raw" && bodyDescription) {
      this.flag = true;
      this.showRawBodyType = true;
      this.setState({
        selectedBodyType: this.state.selectedRawBodyType,
      });
      this.props.set_body(
        this.state.selectedRawBodyType,
        this.state.data[bodyType]
      );
    } else {
      this.flag = false;
      if (bodyType === "raw") {
        this.showRawBodyType = true;
        this.setState({
          selectedBodyType: this.state.selectedRawBodyType,
        });
        this.props.set_body(
          this.state.selectedRawBodyType,
          this.state.data[bodyType]
        );
      } else {
        this.showRawBodyType = false;
        this.setState({
          selectedBodyType: bodyType,
        });
        this.props.set_body(bodyType, this.state.data[bodyType]);
      }
    }
  }
  handleArrayChange = (e, field, index) => {
    let updatedArray = { ...this.props.updated_array };
    updatedArray[e.currentTarget.name][index] = e.currentTarget.value;
    let test1 = JSON.stringify(updatedArray);
    this.props.update_array(updatedArray);
    // this.setState({ updatedArray });
    this.props.set_body(this.state.selectedBodyType, test1);
  };

  handleBodyChange = (e) => {
    let updatedArray = { ...this.props.updated_array };
    updatedArray[e.currentTarget.name] = e.currentTarget.value;
    let test1 = JSON.stringify(updatedArray);
    this.props.update_array(updatedArray);
    // this.setState({ updatedArray });
    this.props.set_body(this.state.selectedBodyType, test1);
  };

  handleObjectChange = (e, key) => {
    let updatedArray = { ...this.props.updated_array };
    const name = e.currentTarget.name.split(".")[1];
    console.log(name);
    // updatedArray[name] = {  };
    // updatedArray[name][key] = e.currentTarget.value;
    // let test1 = JSON.stringify(updatedArray);
    // this.props.update_array(updatedArray);
    // // this.setState({ updatedArray });
    // this.props.set_body(this.state.selectedBodyType, test1);
  };

  handleChange(value) {
    const data = { ...this.state.data };
    data.raw = value;
    this.setState({ data });
    this.props.set_body(this.state.selectedRawBodyType, value);
  }

  handleChangeBody(title, dataArray) {
    const data = { ...this.state.data };
    switch (title) {
      case "formData":
        data.data = dataArray;
        this.setState({ data });
        this.props.set_body(this.state.selectedBodyType, dataArray);
        break;
      case "x-www-form-urlencoded":
        data.urlencoded = dataArray;
        this.setState({ data });
        this.props.set_body(this.state.selectedBodyType, dataArray);
        break;
      default:
        break;
    }
  }

  setRawBodyType(rawBodyType) {
    this.setState({
      selectedRawBodyType: rawBodyType,
      selectedBodyType: rawBodyType,
    });
    this.props.set_body(rawBodyType, this.state.data.raw);
  }

  renderBody() {
    if (this.state.selectedBodyType && this.flag) {
      return <NewBodyDescription {...this.props} />;
    } else if (this.state.selectedBodyType) {
      switch (this.state.selectedBodyType) {
        case "multipart/form-data":
          return (
            <GenericTable
              {...this.props}
              title="formData"
              dataArray={[...this.state.data.data]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.data]}
              count="1"
            ></GenericTable>
          );
        case "application/x-www-form-urlencoded":
          return (
            <GenericTable
              {...this.props}
              title="x-www-form-urlencoded"
              dataArray={[...this.state.data.urlencoded]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.urlencoded]}
              count="2"
            ></GenericTable>
          );

        case "raw1":
          return this.props.body_description.map((field) => (
            <div>
              {field.dataType.includes("Array") && (
                <div>
                  <p>{field.name}</p>
                  <Table bordered size="sm">
                    <tbody>
                      {this.props.updated_array[field.name] &&
                        Array.isArray(this.props.updated_array[field.name]) &&
                        this.props.updated_array[field.name].map(
                          (item, index) =>
                            item !== "deleted" ? (
                              <tr key={index}>
                                <td>{field.dataType.split(" ")[2]}</td>
                                <td>
                                  <input
                                    name={field.name}
                                    value={
                                      this.props.updated_array[field.name][
                                        index
                                      ]
                                    }
                                    onChange={(e) =>
                                      this.handleArrayChange(
                                        e,
                                        field.name,
                                        index
                                      )
                                    }
                                    id={field.name}
                                    type={"text"}
                                    style={{ border: "none" }}
                                    className="form-control"
                                    // value={field.defaultValue || ""}s
                                    // defaultValue={field.defaultValue}
                                  />
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-light btn-sm btn-block"
                                    onClick={() =>
                                      this.handleDelete(index, field.name)
                                    }
                                  >
                                    x{" "}
                                  </button>
                                </td>
                              </tr>
                            ) : null
                        )}
                      <tr>
                        <td> </td>
                        <td>
                          {" "}
                          <button
                            type="button"
                            className="btn btn-link btn-sm btn-block"
                            onClick={() =>
                              this.handleAdd(field.dataType, field.name)
                            }
                          >
                            + New Item
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )}
              {!field.dataType.includes("Array") &&
                field !== "deleted" &&
                field.name.trim() !== "" && (
                  <div className="form-group">
                    <label htmlFor={field.name} className="custom-input-label">
                      {field.name}
                    </label>

                    {/* {field.dataType === "Object" &&
                      this.props.object_definition[field.defaultValue] &&
                      this.props.object_definition[field.defaultValue].map(
                        (objfield, index) => (
                          <div>
                            {objfield.name}:
                            <input
                              onChange={(e) => {
                                this.handleObjectChange(objfield.name);
                              }}
                              id={index + "." + field.name}
                              name={index + "." + field.name}
                              // value={
                              //   this.props.updated_array[field.name] === undefined
                              //     ? field.defaultValue
                              //     : this.props.updated_array[field.name]
                              // }
                              className="form-control custom-input"
                              type={
                                field.dataType === "Integer" ||
                                field.dataType === "Long"
                                  ? "number"
                                  : "text"
                              }
                              placeholder=""
                            />
                          </div>
                        )
                      )} */}

                    {field.dataType === "Boolean" && (
                      <select
                        id="custom-select-box"
                        value={field.defaultValue || ""}
                        // defaultValue={field.value}
                        onChange={(e) => this.handleBodyChange(e)}
                        name={field.name}
                      >
                        <option value={true} key={true}>
                          true
                        </option>
                        <option value={false} key={false}>
                          false
                        </option>
                      </select>
                    )}

                    {field.dataType === "Json" && (
                      <textarea
                        className="form-control"
                        name={field.name}
                        id="contents"
                        rows="3"
                        value={
                          this.props.updated_array[field.name] === undefined
                            ? field.defaultValue
                            : this.props.updated_array[field.name]
                        }
                        onChange={this.handleBodyChange}
                      />
                    )}

                    {field.dataType !== "Boolean" &&
                      field.dataType !== "Json" &&
                      field.dataType !== "Object" && (
                        <input
                          onChange={this.handleBodyChange}
                          id={field.name}
                          name={field.name}
                          value={
                            this.props.updated_array[field.name] === undefined
                              ? field.defaultValue
                              : this.props.updated_array[field.name]
                          }
                          className="form-control custom-input"
                          type={
                            field.dataType === "Integer" ||
                            field.dataType === "Long"
                              ? "number"
                              : "text"
                          }
                          placeholder=""
                        />
                      )}
                  </div>
                )}
            </div>
          ));

        case "none":
          return;
        default:
          return (
            <div>
              {" "}
              <AceEditor
                className="custom-raw-editor"
                // style={{
                //   width: "1000px",
                // }}
                mode={this.state.selectedRawBodyType.toLowerCase()}
                theme="github"
                value={this.state.data.raw}
                onChange={this.handleChange.bind(this)}
                setOptions={{
                  showLineNumbers: true,
                }}
                editorProps={{
                  $blockScrolling: false,
                }}
                onLoad={(editor) => {
                  editor.focus();
                  editor.getSession().setUseWrapMode(true);
                  editor.setShowPrintMargin(false);
                }}
              />
            </div>
          );
      }
    }
  }

  render() {
    // console.log("props", this.props);
    // this.keysArray = [];
    // this.valuesArray = [];
    // this.dataType = [];

    // if (this.props.body && this.props.body.type === "JSON") {
    //   const jsonData = JSON.parse(this.props.body.value);
    //   this.keysArray = Object.keys(jsonData);
    //   this.valuesArray = Object.values(jsonData);
    //   const data = Object.values(
    //     JSON.parse(this.props.endpoints[this.props.endpoint_id].body.value)
    //   );
    //   console.log(this.keysArray, this.valuesArray, this.dataType);
    //   let i;
    //   for (i in data) {
    //     let type = typeof data[i];
    //     if (type === "object") {
    //       if (Array.isArray(data[i])) {
    //         if (typeof data[i][0] === "number") type = "Array";
    //         else if (typeof data[i][0] === "string") type = "Array";
    //         //type = "Array";
    //         else type = "Array of Objects";
    //       }
    //     }
    //     this.dataType[i] = type;
    //   }
    // }

    if (this.props.body && !this.state.selectedBodyType) {
      let selectedBodyType = this.props.body.type;
      if (
        selectedBodyType === "JSON" ||
        selectedBodyType === "HTML" ||
        selectedBodyType === "JavaScript" ||
        selectedBodyType === "XML" ||
        selectedBodyType === "TEXT"
      ) {
        this.showRawBodyType = true;
        this.rawBodyType = selectedBodyType;
        selectedBodyType = "raw";
      }
      let data = this.state.data;
      let type = selectedBodyType.split("-");
      data[type[type.length - 1]] = this.props.body.value;
      if (
        document.getElementById(selectedBodyType + "-" + this.props.endpoint_id)
      ) {
        document.getElementById(
          selectedBodyType + "-" + this.props.endpoint_id
        ).checked = true;
        this.setState({
          selectedRawBodyType: this.rawBodyType ? this.rawBodyType : "TEXT",
          selectedBodyType,
          data,
        });
      }
    }

    return (
      <div className="body-wrapper">
        <form className="body-select" className="d-flex ">
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`none-${this.props.endpoint_id}`}
              checked={this.state.selectedBodyType === "none" ? true : false}
              onClick={() => this.handleSelectBodyType("none")}
              className="custom-radio-input"
            />
            none
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`raw-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("raw")}
              className="custom-radio-input"
            />
            raw
          </label>
          {/* <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`raw1-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("raw1")}
              className="custom-radio-input"
            />
            raw1
          </label> */}
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`multipart/form-data-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("multipart/form-data")}
              className="custom-radio-input"
            />
            form-data
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`application/x-www-form-urlencoded-${this.props.endpoint_id}`}
              onClick={() =>
                this.handleSelectBodyType("application/x-www-form-urlencoded")
              }
              className="custom-radio-input"
            />
            x-www-form-urlencoded
          </label>

          <div className="body">
            {this.showRawBodyType === true && (
              <div>
                <div className="dropdown">
                  <button
                    style={{ color: "#f29624", paddingTop: "0px" }}
                    className="btn dropdown-toggle flex-column"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {this.state.selectedRawBodyType}
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    {this.rawBodyTypes.map((rawBodyType) => (
                      <button
                        className="btn custom-body-type-button"
                        type="button"
                        onClick={() => this.setRawBodyType(rawBodyType)}
                        key={rawBodyType}
                      >
                        {rawBodyType}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {this.showRawBodyType === true && (
            <span style={{ textAlign: "right" }}>
              <label
                htmlFor={`body-description-${this.props.endpoint_id}`}
                // className="body"
              >
                <input
                  type="radio"
                  name={`body-select-${this.props.endpoint_id}`}
                  id={`body-description-${this.props.endpoint_id}`}
                  onClick={() =>
                    this.handleSelectBodyType("raw", "bodyDescription")
                  }
                  className="custom-radio-input"
                />
                Body Description
              </label>
            </span>
          )}
        </form>
        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;

/* {this.props.body && this.props.body.type === "JSON" && (
                  <div>
                    <div className="generic-table-container">
                      <div className="public-generic-table-title-container">
                        Body
                      </div>
                      <table
                        className="table table-bordered"
                        id="custom-generic-table"
                      >
                        <thead>
                          <tr>
                            <th className="custom-th"> </th>
                            <th
                              className="custom-th"
                              id="generic-table-key-cell"
                            >
                              KEY
                            </th>
                            <th className="custom-th">VALUE</th>
                            <th className="custom-th">DESCRIPTION</th>
                          </tr>
                        </thead>
                        <tbody style={{ border: "none" }}>
                          {this.keysArray.map((e, index) => (
                            <tr key={index}>
                              <td
                                className="custom-td"
                                id="generic-table-key-cell"
                                style={{ marginLeft: "5px" }}
                              ></td>
                              <td className="custom-td">
                                <div>
                                  <input
                                    disabled
                                    name={index + ".key"}
                                    value={this.keysArray[index]}
                                    type={"text"}
                                    className="form-control"
                                  ></input>
                                  <label
                                    style={{
                                      marginLeft: "20px",
                                      background: "lightgrey",
                                      padding: "1px",
                                      fontSize: "10px",
                                    }}
                                  >
                                    {this.dataType[index]}
                                  </label>
                                </div>
                              </td>
                              <td className="custom-td">
                                {this.dataType[index] === "boolean" ? (
                                  <select
                                    id="custom-select-box"
                                    value={this.valuesArray[index]}
                                    onChange={this.handleChange}
                                    name={index + ".value"}
                                    style={{ width: "20%" }}
                                  >
                                    <option value={true} key={true}>
                                      true
                                    </option>
                                    <option value={false} key={false}>
                                      false
                                    </option>
                                  </select>
                                ) : this.dataType[index] === "Array" ? (
                                  <div>
                                    {this.valuesArray[index].map((i, key) => (
                                      <div>
                                        <input
                                          style={{
                                            marginLeft: "50px",
                                            width: "60%",
                                          }}
                                          type={
                                            typeof i === "number"
                                              ? "number"
                                              : "text"
                                          }
                                          //type="text"
                                          name={index + "." + key + ".value"}
                                          value={i}
                                          onChange={this.handleChange}
                                        ></input>
                                        <button
                                          type="button"
                                          className="btn cross-button"
                                          onClick={() =>
                                            this.handleDelete(index, key)
                                          }
                                        >
                                          X
                                        </button>
                                      </div>
                                    ))}
                                    <span
                                      class="badge badge-success"
                                      style={{
                                        marginLeft: "50px",
                                        marginTop: "5px",
                                      }}
                                      onClick={() => this.handleAdd(index)}
                                    >
                                      Add+
                                    </span>
                                  </div>
                                ) : this.dataType[index] === "object" ? (
                                  this.obectDiv(this.valuesArray[index], index)
                                ) : this.dataType[index] ===
                                  "Array of Objects" ? (
                                  <div>
                                    {this.valuesArray[index].map((k, i) => (
                                      <div
                                        style={{
                                          display: "flex",
                                          margin: "10px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            marginLeft: "5px",
                                            border: "1px solid",
                                            width: "80%",
                                            padding: "5px",
                                            background: "lightgrey",
                                          }}
                                        >
                                          {this.obectDiv(k, index, i)}
                                        </div>
                                        <button
                                          type="button"
                                          className="btn cross-button"
                                          onClick={() =>
                                            this.handleDelete(index, i)
                                          }
                                        >
                                          X
                                        </button>
                                      </div>
                                    ))}
                                    <span
                                      className="badge badge-success"
                                      style={{
                                        marginLeft: "50px",
                                        marginTop: "5px",
                                      }}
                                      onClick={() => this.handleAdd(index)}
                                    >
                                      Add+
                                    </span>
                                  </div>
                                ) : (
                                  <input
                                    name={index + ".value"}
                                    value={this.valuesArray[index]}
                                    onChange={this.handleChange}
                                    type={
                                      this.dataType[index] === "number"
                                        ? "number"
                                        : "text"
                                    }
                                    placeholder="Value"
                                    className="form-control"
                                    style={{ border: "none" }}
                                  />
                                )}
                              </td>
                              <td className="custom-td">
                                <input
                                  disabled
                                  name={index + ".datatype"}
                                  type="text"
                                  value={this.dataType[index]}
                                  placeholder="DataType"
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
                                  )}*/
